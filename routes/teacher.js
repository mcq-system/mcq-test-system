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

// Middleware to inject common data into all teacher views
router.use(protect('teacher'), async (req, res, next) => {
    try {
        res.locals.user = req.user.toObject();
        res.locals.layout = 'layout-teacher';
        res.locals.unreadNotificationsCount = await Notification.countDocuments({ 
            recipient: req.user._id, 
            isRead: false 
        });
        next();
    } catch (err) {
        next(err);
    }
});
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

    // 1. Fetch data from Schedule model (old way/detailed)
    const schedulesRaw = await Schedule.find({ class_id: { $in: classIdList } })
      .populate('class_id', 'name')
      .lean();

    // 2. Fetch data from Class model (new structured schedule)
    const classesForSchedule = await Class.find({ teacher_id: teacherId, study_schedule: { $exists: true, $ne: [] } }).lean();

    const dayMap = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6,
      'Chủ nhật': 0, 'Thứ 2': 1, 'Thứ 3': 2, 'Thứ 4': 3, 'Thứ 5': 4, 'Thứ 6': 5, 'Thứ 7': 6
    };

    const colors = ['toeic', 'grammar', 'ielts', 'vocab', 'listen'];
    
    // Map Schedule model data (Fallback)
    const scheduleDataFromModel = schedulesRaw.map((s, i) => ({
      name: s.class_id ? s.class_id.name : 'N/A',
      room: 'Phòng học', 
      color: colors[i % colors.length],
      days: [s.day_of_week],
      slot: `${s.start_time} - ${s.end_time}`
    }));

    // Map Class model study_schedule
    const scheduleDataFromClass = [];
    classesForSchedule.forEach((c, idx) => {
      (c.study_schedule || []).forEach(item => {
        const dayIdx = dayMap[item.day];
        if (dayIdx !== undefined) {
          (item.slots || []).forEach(slot => {
            scheduleDataFromClass.push({
              name: c.name,
              room: 'Online',
              color: colors[(schedulesRaw.length + idx) % colors.length],
              days: [dayIdx],
              slot: `${slot.start} - ${slot.end}`
            });
          });
        }
      });
    });

    // Merge both
    const scheduleData = [...scheduleDataFromModel, ...scheduleDataFromClass];
    
    res.render('teacher/dashboard', {
      title: 'Teacher Dashboard',
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
      title: 'Ngân hàng câu hỏi', 
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

    // add student and exam counts per class
    const enriched = await Promise.all(classes.map(async c => {
      const studentCount = await ClassMember.countDocuments({ class_id: c._id });
      const examCount = await Exam.countDocuments({ class_id: c._id });
      return { ...c, students: studentCount, examCount };
    }));

    res.render('teacher/class-management', {
      title: 'Quản lý lớp học',
      classes: enriched
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi Server");
  }
});


router.get('/create-class', protect('teacher'), async (req, res) => {
  try {
    res.render('teacher/create-class', {
      title: 'Tạo lớp học mới',
      daysList: [
        { vi: 'Thứ 2', en: 'Monday' },
        { vi: 'Thứ 3', en: 'Tuesday' },
        { vi: 'Thứ 4', en: 'Wednesday' },
        { vi: 'Thứ 5', en: 'Thursday' },
        { vi: 'Thứ 6', en: 'Friday' },
        { vi: 'Thứ 7', en: 'Saturday' },
        { vi: 'Chủ nhật', en: 'Sunday' }
      ]
    });
  } catch (err) {
    res.status(500).send("Lỗi Server: " + err.message);
  }
});

// POST create class
router.post('/create-class', protect('teacher'), async (req, res) => {
  try {
    const teacherId = req.user?._id;
    const { name, description, starting_date, ending_date, study_schedule } = req.body;
    if (!name || !teacherId) return res.status(400).send('Thiếu tên lớp hoặc chưa đăng nhập');

    // Parse study_schedule from hidden JSON input
    let formattedSchedule = [];
    try {
      if (req.body.study_schedule_json) {
        formattedSchedule = JSON.parse(req.body.study_schedule_json);
      }
    } catch (e) {
      console.error('Error parsing study_schedule_json:', e);
    }

    const cleanName = String(name).trim();
    const cleanDesc = description ? String(description).trim() : '';

    // Generate random 6-char code
    const class_code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const newClass = await Class.create({ 
        name: cleanName, 
        class_code, 
        description: cleanDesc, 
        teacher_id: teacherId,
        starting_date: starting_date ? new Date(starting_date) : null,
        ending_date: ending_date ? new Date(ending_date) : null,
        study_schedule: formattedSchedule
    });
    res.redirect('/teacher/my-classes');
  } catch (err) {
    console.error('Lỗi tạo lớp:', err);
    res.status(500).send('Lỗi tạo lớp: ' + err.message);
  }
});

// GET view class detail (list students)
router.get('/my-classes/:id', protect('teacher'), async (req, res) => {
  try {
    const teacherId = req.user?._id;
    const classId = req.params.id;
    console.log('Accessing class detail:', classId, 'Teacher:', teacherId);

    const cls = await Class.findOne({ _id: classId, teacher_id: teacherId }).lean();
    if (!cls) return res.status(404).send('Lớp học không tồn tại');

    // Fetch members and exams
    const members = await ClassMember.find({ class_id: classId }).populate('student_id').lean();
    const exams = await Exam.find({ class_id: classId }).sort({ created_at: -1 }).lean();

    // Map English day names to Vietnamese for display
    const dayViMap = {
      'Monday': 'Thứ 2', 'Tuesday': 'Thứ 3', 'Wednesday': 'Thứ 4',
      'Thursday': 'Thứ 5', 'Friday': 'Thứ 6', 'Saturday': 'Thứ 7', 'Sunday': 'Chủ nhật'
    };
    if (cls.study_schedule) {
      cls.study_schedule = cls.study_schedule.map(s => ({
        ...s,
        dayVi: dayViMap[s.day] || s.day
      }));
    }

    res.render('teacher/class-detail', {
      title: `Chi tiết lớp: ${cls.name}`,
      cls,
      members,
      exams
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET edit class form
router.get('/my-classes/:id/edit', protect('teacher'), async (req, res) => {
  try {
    const teacherId = req.user?._id;
    const classId = req.params.id;

    const cls = await Class.findOne({ _id: classId, teacher_id: teacherId }).lean();
    if (!cls) return res.status(404).send('Lớp học không tồn tại');

    if (cls.starting_date) cls.starting_date_val = cls.starting_date.toISOString().split('T')[0];
    if (cls.ending_date) cls.ending_date_val = cls.ending_date.toISOString().split('T')[0];

    // Helper for structured schedule in HBS
    const days = [
      { vi: 'Thứ 2', en: 'Monday' },
      { vi: 'Thứ 3', en: 'Tuesday' },
      { vi: 'Thứ 4', en: 'Wednesday' },
      { vi: 'Thứ 5', en: 'Thursday' },
      { vi: 'Thứ 6', en: 'Friday' },
      { vi: 'Thứ 7', en: 'Saturday' },
      { vi: 'Chủ nhật', en: 'Sunday' }
    ];
    cls.scheduleFlags = days.map((d, dIdx) => {
      const match = (cls.study_schedule || []).find(s => s.day === d.en);
      // Map slots to include the day index for safe Handlebars parsing
      const formattedSlots = (match && match.slots ? match.slots : [{ start: '07:00', end: '09:00' }]).map(slot => {
        return {
          ...slot,
          dayIdx: dIdx
        };
      });
      
      return {
        vi: d.vi,
        en: d.en,
        selected: !!match,
        slots: formattedSlots
      };
    });

    res.render('teacher/edit-class', {
      title: `Chỉnh sửa: ${cls.name}`,
      cls
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST update class
router.post('/my-classes/:id/edit', protect('teacher'), async (req, res) => {
  try {
    const teacherId = req.user?._id;
    const classId = req.params.id;
    const { name, description, starting_date, ending_date, study_schedule } = req.body;

    // Parse study_schedule from hidden JSON input
    let formattedSchedule = [];
    try {
      if (req.body.study_schedule_json) {
        formattedSchedule = JSON.parse(req.body.study_schedule_json);
      }
    } catch (e) {
      console.error('Error parsing study_schedule_json:', e);
    }

    const cls = await Class.findOneAndUpdate(
      { _id: classId, teacher_id: teacherId },
      { 
        name: String(name).trim(), 
        description: String(description).trim(),
        starting_date: starting_date ? new Date(starting_date) : null,
        ending_date: ending_date ? new Date(ending_date) : null,
        study_schedule: formattedSchedule
      },
      { new: true }
    );

    if (!cls) return res.status(404).send('Lớp học không tồn tại');
    res.redirect('/teacher/my-classes');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST delete class
router.post('/my-classes/:id/delete', protect('teacher'), async (req, res) => {
  try {
    const teacherId = req.user?._id;
    const classId = req.params.id;

    // Check ownership
    const cls = await Class.findOne({ _id: classId, teacher_id: teacherId });
    if (!cls) return res.status(404).send('Lớp học không tồn tại hoặc bạn không có quyền xóa');

    // Delete related data
    await Schedule.deleteMany({ class_id: classId });
    await ClassMember.deleteMany({ class_id: classId });
    await Class.deleteOne({ _id: classId });

    res.redirect('/teacher/my-classes');
  } catch (err) {
    console.error('Lỗi xóa lớp:', err);
    res.status(500).send('Lỗi xóa lớp: ' + err.message);
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

    const exams = await Exam.find({ created_by: teacherId })
      .populate('class_id')
      .sort({ created_at: -1 })
      .lean();

    const totalExams = exams.length;
    const publishedExams = exams.filter(e => e.status === 'PUBLISHED').length;
    const draftExams = exams.filter(e => e.status === 'DRAFT').length;

    res.render('teacher/exam-list', {
      title: 'Danh sách đề thi',
      exams,
      stats: { totalExams, publishedExams, draftExams }
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

      // Send notifications to students in the class (Non-blocking)
      if (class_id) {
          try {
              const Notification = require('../models/Notification');
              const ClassMember = require('../models/ClassMember');
              const students = await ClassMember.find({ class_id }).lean();
              
              if (students.length > 0) {
                  const notifications = students.map(s => ({
                      recipient: s.student_id,
                      sender: teacherId,
                      senderRole: 'teacher',
                      title: 'Bài thi mới',
                      message: `Giảng viên đã tạo bài thi mới: ${title}`,
                      type: 'exam',
                      created_at: new Date()
                  }));
                  await Notification.insertMany(notifications);
              }
          } catch (notifyErr) {
              console.error('Failed to send notifications:', notifyErr);
          }
      }

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

