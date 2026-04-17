const express = require('express');
const router = express.Router();

// Import Models
const Class = require('../models/Class');
const Exam = require('../models/Exam');
const Question = require('../models/Question'); 

//  Tạm thời hardcode ID giáo viên (Thay bằng req.session.user._id khi có Login)
const CURRENT_TEACHER_ID = "000000000000000000000002";

// 🔒 Middleware kiểm tra quyền Teacher (tạm thời bỏ qua, bật lên khi có Auth)
const checkTeacher = (req, res, next) => {
  // if (!req.session?.user || req.session.user.role !== 'teacher') {
  //   return res.redirect('/login');
  // }
  next();
};
// ================= DASHBOARD =================
router.get('/dashboard', checkTeacher, async (req, res) => {
  try {
    const classCount = await Class.countDocuments({ teacher: CURRENT_TEACHER_ID });
    const examCount = await Exam.countDocuments({ teacher: CURRENT_TEACHER_ID });
    const questionCount = await Question.countDocuments({ teacher: CURRENT_TEACHER_ID });
    const unreadNoti = await Notification.countDocuments({ recipient: CURRENT_TEACHER_ID, isRead: false });

    res.render('teacher/dashboard', {
      title: 'Dashboard',
      layout: 'layout-teacher',
      stats: {
        classes: classCount,
        exams: examCount,
        questions: questionCount,
        notifications: unreadNoti
      }
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ================= QUẢN LÝ LỚP HỌC =================
router.get('/classes', checkTeacher, async (req, res) => {
  try {
    const classes = await Class.find({ teacher: CURRENT_TEACHER_ID })
      .populate('students', 'full_name email')
      .sort({ created_at: -1 }).lean();

    // Tính số đề thi cho mỗi lớp để hiển thị trên bảng
    const classesWithCounts = await Promise.all(classes.map(async c => {
      const count = await Exam.countDocuments({ class_id: c._id, teacher: CURRENT_TEACHER_ID });
      return { ...c, exam_count: count };
    }));

    res.render('teacher/classes', {
      title: 'Quản lý lớp học',
      layout: 'layout-teacher',
      classes: classesWithCounts,
      total: classes.length
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/classes/create', checkTeacher, (req, res) => {
  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
  res.render('teacher/create-class', {
    title: 'Tạo lớp học mới',
    layout: 'layout-teacher',
    days
  });
});

router.post('/classes', checkTeacher, async (req, res) => {
  try {
    const { class_name, class_code, topic, max_students, start_date, end_date, description, teaching_days, teaching_time } = req.body;
    
    const newClass = new Class({
      class_name,
      class_code,
      teacher: CURRENT_TEACHER_ID,
      topic,
      max_students: max_students || 30,
      start_date,
      end_date,
      description,
      teaching_days: teaching_days ? (Array.isArray(teaching_days) ? teaching_days : [teaching_days]) : [],
      teaching_time,
      status: 'draft'
    });

    await newClass.save();
    res.redirect('/teacher/classes');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete('/classes/:id', checkTeacher, async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= QUẢN LÝ ĐỀ THI =================
router.get('/exams', checkTeacher, async (req, res) => {
  try {
    const exams = await Exam.find({ teacher: CURRENT_TEACHER_ID })
      .populate('class_id', 'class_name')
      .sort({ created_at: -1 }).lean();

    // Thống kê cho 4 card trên cùng
    const stats = {
      total: exams.length,
      published: exams.filter(e => e.status === 'published').length,
      draft: exams.filter(e => e.status === 'draft').length,
      attempts: 444 //  Dữ liệu mẫu. Thay bằng aggregate thực tế khi có bảng StudentExam
    };

    res.render('teacher/exam', {
      title: 'Danh sách đề thi',
      layout: 'layout-teacher',
      exams,
      stats
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/exams/create', checkTeacher, async (req, res) => {
  try {
    const questions = await Question.find({ teacher: CURRENT_TEACHER_ID }).lean();
    res.render('teacher/create-exam', {
      title: 'Tạo đề thi',
      layout: 'layout-teacher',
      questions
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/exams', checkTeacher, async (req, res) => {
  try {
    const { exam_name, duration, topic, status, questions } = req.body;
    
    // Frontend gửi mảng ID câu hỏi dưới dạng JSON string
    const parsedQuestions = JSON.parse(questions);
    
    const newExam = new Exam({
      exam_name,
      duration: duration || 60,
      topic,
      status: status || 'draft',
      teacher: CURRENT_TEACHER_ID,
      questions: parsedQuestions
    });

    await newExam.save();
    res.redirect('/teacher/exams');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete('/exams/:id', checkTeacher, async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= THÔNG BÁO (Giữ nguyên cấu trúc cũ, chỉ cập nhật layout) =================
router.get('/notifications', checkTeacher, async (req, res) => {
  try {
    const incoming = await Notification.find({ recipient: CURRENT_TEACHER_ID })
      .populate('sender', 'full_name').sort({ created_at: -1 }).lean();
      
    const outgoing = await Notification.find({ sender: CURRENT_TEACHER_ID })
      .populate('recipient', 'full_name email').sort({ created_at: -1 }).lean();
      
    const students = await User.find({ role: 'student' }, 'full_name email').lean();

    res.render('teacher/notifications', {
      title: 'Thông báo',
      layout: 'layout-teacher',
      incoming,
      outgoing,
      students
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/notifications/send', checkTeacher, async (req, res) => {
  try {
    const { recipient, title, message, type } = req.body;
    await new Notification({
      recipient,
      sender: CURRENT_TEACHER_ID,
      senderRole: 'teacher',
      title,
      message,
      type
    }).save();
    res.redirect('/teacher/notifications');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;