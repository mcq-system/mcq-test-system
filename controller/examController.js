const Exam = require('../models/Exam');
const ExamQuestion = require('../models/ExamQuestion');
const Question = require('../models/Question');
const QuestionTopic = require('../models/QuestionTopic');
const Notification = require('../models/Notification');
const ClassMember = require('../models/ClassMember');
const mongoose = require('mongoose');

// ─── API: List exams (JSON) ────────────────────────────────────────────────────
exports.listExams = async (req, res) => {
  try {
    const filter = req.user?.role === 'teacher' ? { created_by: req.user._id } : {};
    const exams = await Exam.find(filter).sort({ created_at: -1 }).lean();
    return res.status(200).json({ success: true, data: exams });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ─── PAGE: Danh sách đề thi ────────────────────────────────────────────────────
/**
 * GET /teacher/exams
 */
exports.getExamListPage = async (req, res) => {
  try {
    const teacherId = req.user._id;

    const exams = await Exam.find({ created_by: teacherId })
      .populate('class_id', 'name')
      .sort({ created_at: -1 })
      .lean();

    const totalExams     = exams.length;
    const publishedExams = exams.filter(e => e.status === 'PUBLISHED').length;
    const draftExams     = exams.filter(e => e.status === 'DRAFT').length;

    res.render('teacher/exam-list', {
      title: 'Danh sách đề thi',
      exams,
      stats: { totalExams, publishedExams, draftExams },
    });
  } catch (err) {
    console.error('getExamListPage error:', err);
    res.status(500).render('error', { message: 'Lỗi tải danh sách đề thi', error: { status: 500 } });
  }
};

// ─── PAGE: Tạo đề thi mới ─────────────────────────────────────────────────────
/**
 * GET /teacher/create-exam
 */
exports.getCreateExamPage = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // Load questions and topics for the question bank on the create-exam page
    const [questions, topics] = await Promise.all([
      Question.find({ created_by: teacherId, status: 'active' })
        .populate('topic_id', 'name')
        .sort({ created_at: -1 })
        .lean(),
      QuestionTopic.find().sort({ name: 1 }).lean(),
    ]);

    res.render('teacher/create-exams', {
      title: 'Tạo đề thi mới',
      questions,
      topics,
    });
  } catch (err) {
    console.error('getCreateExamPage error:', err);
    res.status(500).render('error', { message: 'Lỗi hiển thị trang tạo đề thi', error: { status: 500 } });
  }
};

// ─── API: Lưu đề thi (POST JSON) ──────────────────────────────────────────────
/**
 * POST /teacher/exams/store  — nhận JSON từ create-exams.hbs
 * Body: { title, duration_minutes, topic, question_ids: [...] }
 */
exports.postSaveExam = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { title, duration_minutes, topic, class_id } = req.body;

    // question_ids có thể là mảng ID string
    let question_ids = req.body.question_ids || [];
    if (typeof question_ids === 'string') question_ids = [question_ids];
    if (!Array.isArray(question_ids)) question_ids = [];
    question_ids = question_ids.map(q => String(q).trim()).filter(Boolean);

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên đề thi!' });
    }
    if (question_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng thêm ít nhất 1 câu hỏi vào đề thi!' });
    }

    // Validate question IDs tồn tại
    const existing = await Question.find({ _id: { $in: question_ids } }, '_id').lean();
    if (existing.length !== question_ids.length) {
      return res.status(400).json({ success: false, message: 'Một số câu hỏi không tồn tại trong hệ thống.' });
    }

    // Transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const [exam] = await Exam.create([{
        class_id: class_id || null,
        created_by: teacherId,
        title: String(title).trim(),
        duration_minutes: Number(duration_minutes) || 0,
        status: 'DRAFT',
      }], { session });

      const toInsert = question_ids.map((qid, order) => ({
        exam_id: exam._id,
        question_id: qid,
        order,
      }));
      await ExamQuestion.insertMany(toInsert, { session });

      await session.commitTransaction();
      session.endSession();

      // Gửi thông báo cho học sinh trong lớp (non-blocking)
      if (class_id) {
        try {
          const students = await ClassMember.find({ class_id }).lean();
          if (students.length > 0) {
            const notifications = students.map(s => ({
              recipient: s.student_id,
              sender: teacherId,
              senderRole: 'teacher',
              title: 'Bài thi mới',
              message: `Giảng viên đã tạo bài thi mới: ${title}`,
              type: 'exam',
              created_at: new Date(),
            }));
            await Notification.insertMany(notifications);
          }
        } catch (notifyErr) {
          console.error('Failed to send notifications:', notifyErr);
        }
      }

      return res.status(201).json({
        success: true,
        message: `Đề thi "${title}" đã được lưu thành công với ${question_ids.length} câu hỏi!`,
        examId: exam._id,
      });
    } catch (errTx) {
      await session.abortTransaction();
      session.endSession();
      throw errTx;
    }
  } catch (err) {
    console.error('postSaveExam error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi khi lưu đề thi: ' + err.message });
  }
};

// ─── API: CRUD cơ bản ─────────────────────────────────────────────────────────

exports.createExam = async (req, res) => {
  try {
    const { title, duration_minutes, start_time, end_time, class_id, status } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const exam = await Exam.create({
      class_id: class_id || null,
      created_by: req.user?._id,
      title: String(title).trim(),
      duration_minutes: Number(duration_minutes) || 0,
      start_time: start_time ? new Date(start_time) : null,
      end_time: end_time ? new Date(end_time) : null,
      status: status || 'DRAFT',
    });

    return res.status(201).json({ success: true, data: exam });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.getExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).lean();
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    return res.status(200).json({ success: true, data: exam });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const update = {};
    const fields = ['title', 'duration_minutes', 'start_time', 'end_time', 'status', 'class_id'];
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        update[f] = f.includes('time') && req.body[f] ? new Date(req.body[f]) : req.body[f];
      }
    }
    const exam = await Exam.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    return res.status(200).json({ success: true, data: exam });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id).lean();
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    await ExamQuestion.deleteMany({ exam_id: req.params.id });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.listExamQuestions = async (req, res) => {
  try {
    const examId = req.params.id;
    const examQuestions = await ExamQuestion.find({ exam_id: examId }).lean();
    const questionIds = examQuestions.map(eq => eq.question_id);
    const questions = await Question.find({ _id: { $in: questionIds } }).lean();
    return res.status(200).json({ success: true, data: questions });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.addExamQuestion = async (req, res) => {
  try {
    const { question_id } = req.body;
    if (!question_id) return res.status(400).json({ error: 'question_id required' });

    const exists = await ExamQuestion.findOne({ exam_id: req.params.id, question_id }).lean();
    if (exists) return res.status(409).json({ error: 'Question already added' });

    const link = await ExamQuestion.create({ exam_id: req.params.id, question_id });
    return res.status(201).json({ success: true, data: link });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.getExamQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.q_id).lean();
    if (!question) return res.status(404).json({ error: 'Question not found' });
    return res.status(200).json({ success: true, data: question });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
