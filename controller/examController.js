const Exam = require('../models/Exam');
const ExamQuestion = require('../models/ExamQuestion');
const Question = require('../models/Question');

exports.listExams = async (req, res) => {
  try {
    const filter = req.user?.role === 'teacher' ? { created_by: req.user._id } : {};
    const exams = await Exam.find(filter).sort({ created_at: -1 }).lean();
    return res.status(200).json({ success: true, data: exams });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

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
    const questionIds = examQuestions.map((eq) => eq.question_id);
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
