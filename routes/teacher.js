const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const User = require('../models/User');
const Notification = require('../models/Notification');
const Class = require('../models/Class');
const ClassMember = require('../models/ClassMember');
const Exam = require('../models/Exam');
const ExamQuestion = require('../models/ExamQuestion');
const Schedule = require('../models/Schedule');
const Question = require('../models/Question');
const QuestionTopic = require('../models/QuestionTopic');

//======================= Dashboard ============================================================
router.get('/dashboard', protect('teacher'), async (req, res, next) => {
  try {
    const teacherId = req.user?._id;
    const user = await User.findById(teacherId).lean();

    // class count for this teacher
    const classCount = await Class.countDocuments({ teacher_id: teacherId });

    // student count (unique students across teacher's classes)
    const classIds = await Class.find({ teacher_id: teacherId }, '_id').lean();
    const classIdList = classIds.map(c => c._id);
    const studentCount = await ClassMember.countDocuments({ class_id: { $in: classIdList } });

    // exam count created by teacher
    const examCount = await Exam.countDocuments({ created_by: teacherId });

    // schedules for teacher's classes
    const schedulesRaw = await Schedule.find({ class_id: { $in: classIdList } })
      .populate('class_id', 'ten')
      .lean();

    // Map to frontend format
    const colors = ['toeic', 'grammar', 'ielts', 'vocab', 'listen'];
    const scheduleData = schedulesRaw.map((s, i) => ({
      name: s.class_id ? s.class_id.ten : 'N/A',
      room: 'Phòng học', 
      color: colors[i % colors.length],
      days: [s.day_of_week],
      slot: `${s.start_time} - ${s.end_time}`
    }));

    res.render('teacher/dashboard', {
      user,
      title: 'Teacher Dashboard',
      layout: 'layout-teacher',
      stats: { classCount, studentCount, examCount },
      scheduleData
    });
  } catch (err) {
    next(err);
  }
});


//======================= Notifications ========================================================
router.get('/notifications', protect('teacher'), async (req, res) => {
  try {
    const teacherId = req.user?._id;
    if (!teacherId) return res.redirect('/login');
    const user = await User.findById(teacherId).lean();

    const incoming = await Notification.find({ recipient: teacherId })
        .populate('sender', 'first_name last_name')
        .sort({ created_at: -1 })
        .lean();

    const outgoing = await Notification.find({ sender: teacherId })
        .populate('recipient', 'first_name last_name email')
        .sort({ created_at: -1 })
        .lean();

    const students = await User.find({ role: 'student' }, 'first_name last_name email').lean();
    res.render('teacher/notifications', {
      title: 'Thông báo & Liên lạc',
      layout: 'layout-teacher',
      incoming,
      outgoing,
      user,
      students,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/notifications/send', protect('teacher'), async (req, res) => {
  try {
    const teacherId = req.user?._id;
    if (!teacherId) return res.redirect('/login');

    const { recipient, title, message, type } = req.body;

    const newNoti = new Notification({
      recipient,
      sender: teacherId,
      senderRole: 'teacher',
      title,
      message,
      type,
    });

    await newNoti.save();
    res.redirect('/teacher/notifications');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

//============================= Profile ===========================================================
router.get('/profile', protect('teacher'), async (req, res, next) => {
  try {
    const teacherId = req.user?._id;
    if (!teacherId) return res.redirect('/login');

    const user = await User.findById(teacherId).lean();
    if (!user) return res.status(404).send("Người dùng không tồn tại");

    if (user.dob) {
      user.dob_formatted = user.dob.toISOString().split('T')[0];
      user.dob_display = user.dob.toLocaleDateString('vi-VN');
    }

    res.render('teacher/profile', {
      title: 'Hồ sơ cá nhân',
      user,
      layout: 'layout-teacher',
    });
  } catch (err) {
    next(err);
  }
});

router.post('/update-profile', protect('teacher'), async (req, res, next) => {
  try {
    const teacherId = req.user?._id;
    if (!teacherId) return res.redirect('/login');

    const { fullname, email, phone, dob, address } = req.body;
    const nameParts = fullname.trim().split(' ');
    const firstName = nameParts.pop();
    const lastName = nameParts.join(' ');

    await User.findByIdAndUpdate(teacherId, {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      dob,
      address,
    });

    res.redirect('/teacher/profile');
  } catch (err) {
    next(err);
  }
});

//======================= Placeholder routes (từ sidebar links) ===================================

router.get('/questions', protect('teacher'), async (req, res, next) => {
  try {
    const teacherId = req.user._id;
    const user = await User.findById(teacherId).lean();
    const questions = await Question.find({ created_by: teacherId })
        .populate('topic_id', 'name')
        .sort({ created_at: -1 })
        .lean();
    const topics = await QuestionTopic.find().sort({ name: 1 }).lean();

    res.render('teacher/questions', {
      user, 
      title: 'Ngân hàng câu hỏi', 
      layout: 'layout-teacher',
      questions,
      topics
    });
  } catch (err) { next(err); }
});

// routes/teacher.js

// Đảm bảo dòng này đúng (không phải outer)
router.get('/my-classes', protect('teacher'), async (req, res) => {
  try {
    const teacherId = req.user?._id;
    if (!teacherId) return res.redirect('/login');

    // fetch classes and student counts
    const classes = await Class.find({ teacher_id: teacherId }).lean();

    // add student counts per class
    const enriched = await Promise.all(classes.map(async c => {
      const studentCount = await ClassMember.countDocuments({ class_id: c._id });
      return { ...c, students: studentCount };
    }));

    res.render('teacher/class-management', {
      title: 'Quản lý lớp học',
      layout: 'layout-teacher',
      classes: enriched
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi Server");
  }
});


router.get('/create-class', protect('teacher'), async (req, res) => {
  try {
    const teacherId = req.user?._id;
    const user = await User.findById(teacherId).lean();
    res.render('teacher/create-class', {
      title: 'Tạo lớp học mới',
      layout: 'layout-teacher', 
      user
    });
  } catch (err) {
    console.error("Lỗi chi tiết:", err); 
    res.status(500).send("Lỗi Server: " + err.message);
  }
});

// POST create class
router.post('/create-class', protect('teacher'), async (req, res) => {
  try {
    const teacherId = req.user?._id;
    const { name, description } = req.body;
    if (!name || !teacherId) return res.status(400).send('Thiếu tên lớp hoặc chưa đăng nhập');
    // basic sanitize
    const cleanName = String(name).trim();
    const cleanDesc = description ? String(description).trim() : '';

    const newClass = await Class.create({ name: cleanName, description: cleanDesc, teacher_id: teacherId });
    res.redirect('/teacher/my-classes');
  } catch (err) {
    console.error('Lỗi tạo lớp:', err);
    res.status(500).send('Lỗi tạo lớp: ' + err.message);
  }
});

// ======================= Schedule endpoints ==================================
// GET /teacher/classes/:id/schedule - get schedule for a class (JSON)
router.get('/classes/:id/schedule', protect('teacher'), async (req, res) => {
  try {
    const teacherId = req.user?._id;
    const classId = req.params.id;
    const cls = await Class.findById(classId).lean();
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    if (String(cls.teacher_id) !== String(teacherId)) return res.status(403).json({ error: 'Forbidden' });

    const schedules = await Schedule.find({ class_id: classId }).sort({ day_of_week: 1, start_time: 1 }).lean();
    return res.status(200).json({ success: true, data: schedules });
  } catch (err) {
    console.error('get schedule error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /teacher/classes/:id/schedule - replace schedule list for a class
router.post('/classes/:id/schedule', protect('teacher'), async (req, res) => {
  try {
    const teacherId = req.user?._id;
    const classId = req.params.id;
    const cls = await Class.findById(classId).lean();
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    if (String(cls.teacher_id) !== String(teacherId)) return res.status(403).json({ error: 'Forbidden' });

    const schedules = Array.isArray(req.body.schedules) ? req.body.schedules : [];
    // validate
    for (const s of schedules) {
      if (typeof s.day_of_week !== 'number' || !s.start_time || !s.end_time) {
        return res.status(400).json({ error: 'Invalid schedule format' });
      }
    }

    // replace
    await Schedule.deleteMany({ class_id: classId });
    if (schedules.length) {
      const toInsert = schedules.map(s => ({ class_id: classId, day_of_week: s.day_of_week, start_time: s.start_time, end_time: s.end_time }));
      await Schedule.insertMany(toInsert);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('post schedule error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});




//======================= Quản lý đề thi (Teacher Exams) =======================================

// 1. Danh sách đề thi 
// Link truy cập: localhost:3000/teacher/exams
router.get('/exams', protect('teacher'), async (req, res) => {
  try {
    const teacherId = req.user?._id;
    const user = await User.findById(teacherId).lean();

    const exams = await Exam.find({ created_by: teacherId }).sort({ created_at: -1 }).lean();

    res.render('teacher/exam-list', {
      title: 'Danh sách đề thi',
      layout: 'layout-teacher',
      user,
      exams
    });
  } catch (err) {
    res.status(500).send("Lỗi tải danh sách đề thi: " + err.message);
  }
});

// 2. Trang tạo đề thi mới 
// Link truy cập: localhost:3000/teacher/create-exam
router.get('/create-exam', protect('teacher'), async (req, res) => {
    try {
        const teacherId = req.user?._id;
        const user = await User.findById(teacherId).lean();

        res.render('teacher/create-exams', {
            title: 'Tạo đề thi mới',
            layout: 'layout-teacher',
            user
        });
    } catch (err) {
        res.status(500).send("Lỗi hiển thị trang tạo đề thi: " + err.message);
    }
});

// 3. API xử lý lưu đề thi
router.post('/exams/store', protect('teacher'), async (req, res) => {
  try {
    const teacherId = req.user?._id;
    const { title, duration_minutes, start_time, end_time, class_id } = req.body;
    // question_ids can be from form as question_ids[] => may be array or single string
    let question_ids = req.body['question_ids[]'] || req.body.question_ids || [];
    if (!title) return res.status(400).send('Thiếu tiêu đề đề thi');

    if (typeof question_ids === 'string') question_ids = [question_ids];
    if (!Array.isArray(question_ids)) question_ids = [];

    // sanitize ids
    question_ids = question_ids.map(q => String(q).trim()).filter(Boolean);

    // validate existence of question ids
    if (question_ids.length) {
      const existing = await require('../models/Question').find({ _id: { $in: question_ids } }, '_id').lean();
      const existingIds = existing.map(e => String(e._id));
      const missing = question_ids.filter(q => !existingIds.includes(q));
      if (missing.length) return res.status(400).send('Một vài câu hỏi không tồn tại: ' + missing.join(','));
    }

    // Use mongoose transaction if available
    const mongoose = require('mongoose');
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const exam = await Exam.create([{ class_id: class_id || null,
        created_by: teacherId,
        title: String(title).trim(),
        duration_minutes: Number(duration_minutes) || 0,
        start_time: start_time ? new Date(start_time) : null,
        end_time: end_time ? new Date(end_time) : null,
        status: 'DRAFT' }], { session });

      const examId = exam[0]._id;
      if (question_ids.length) {
        const toInsert = question_ids.map(qid => ({ exam_id: examId, question_id: qid }));
        await ExamQuestion.insertMany(toInsert, { session });
      }

      await session.commitTransaction();
      session.endSession();
      res.redirect('/teacher/exams');
    } catch (errTx) {
      await session.abortTransaction();
      session.endSession();
      throw errTx;
    }
  } catch (err) {
    res.status(500).send("Lỗi khi lưu đề thi: " + err.message);
  }
});
module.exports = router;

