const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');
const User = require('../models/User');
const examSessionController = require('../controller/examSessionController');
const Exam = require('../models/Exam');
const Class = require('../models/Class');
const ClassMember = require('../models/ClassMember');
const ExamQuestion = require('../models/ExamQuestion');
const ExamSession = require('../models/ExamSession');
const Schedule = require('../models/Schedule');

// Middleware to inject common data into all student views
router.use(protect('student'), async (req, res, next) => {
    try {
        // Use toObject() to avoid Handlebars prototype access issues
        res.locals.user = req.user.toObject();
        res.locals.layout = 'layout-student';
        
        // Optionally fetch unread notification count for the badge
        res.locals.unreadNotificationsCount = await Notification.countDocuments({ 
            recipient: req.user._id, 
            isRead: false 
        });
        
        next();
    } catch (err) {
        next(err);
    }
});
router.get('/dashboard', protect('student'), async (req, res) => {
    try {
        const userId = req.user._id;
        
        // 1. Stats
        const classCount = await ClassMember.countDocuments({ student_id: userId });
        const sessions = await ExamSession.find({ student_id: userId, status: 'SUBMITTED' }).lean();
        const examCount = sessions.length;
        const avgScore = examCount > 0 
            ? (sessions.reduce((acc, s) => acc + (s.score || 0), 0) / examCount).toFixed(1) 
            : 0;

        // 2. My Classes (Top 3)
        const memberships = await ClassMember.find({ student_id: userId })
            .populate({
                path: 'class_id',
                populate: { path: 'teacher_id', select: 'first_name last_name' }
            })
            .limit(3)
            .lean();
            
        const classes = await Promise.all(memberships.map(async (m) => {
            const cls = m.class_id;
            if (!cls) return null;
            
            // Get first schedule
            const schedule = await Schedule.findOne({ class_id: cls._id }).lean();
            let scheduleStr = 'Chưa có lịch';
            if (schedule) {
                const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
                scheduleStr = `${days[schedule.day_of_week]}, ${schedule.start_time}`;
            }

            return {
                ...cls,
                teacherName: cls.teacher_id ? `${cls.teacher_id.first_name} ${cls.teacher_id.last_name}` : 'N/A',
                scheduleStr
            };
        })).then(results => results.filter(c => c != null));

        // 3. Upcoming Exams (Top 3)
        const examsData = await Exam.find({ status: 'PUBLISHED' })
            .populate('class_id')
            .limit(3)
            .lean();
        
        const exams = await Promise.all(examsData.map(async (exam) => {
            const questionCount = await ExamQuestion.countDocuments({ exam_id: exam._id });
            return {
                ...exam,
                questionCount
            };
        }));

        res.render('student/dashboard', {
            title: 'Student Dashboard',
            stats: {
                classCount,
                examCount,
                avgScore
            },
            classes,
            exams
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

//============================= Profile ===========================================================
router.get('/profile', protect('student'), async (req, res, next) => {
  try {
      const userId = req.user?._id;
      if (!userId) return res.redirect('/auth/login');

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).send("Người dùng không tồn tại");

    if (user.dob) {
      user.dob_formatted = user.dob.toISOString().split('T')[0];
      user.dob_display = user.dob.toLocaleDateString('vi-VN');
    }

    res.render('student/profile', {
      title: 'Hồ sơ cá nhân',
    });
  } catch (err) {
    next(err);
  }
});

router.post('/update-profile', protect('student'), async (req, res, next) => {
  try {
    const userId = req.user?._id; 
    if (!userId) return res.redirect('/auth/login');

    const { fullname, email, phone, dob, address } = req.body;
    if (!fullname || !email) return res.status(400).send('Thiếu thông tin cần thiết');
    const nameParts = String(fullname).trim().split(' ');
    const firstName = nameParts.pop();
    const lastName = nameParts.join(' ');

    await User.findByIdAndUpdate(userId, {
      first_name: String(firstName).trim(),
      last_name: String(lastName).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : undefined,
      dob: dob ? new Date(dob) : undefined,
      address: address ? String(address).trim() : undefined,
    });

    res.redirect('/student/profile');
  } catch (err) {
    next(err);
  }
});

//============================= Notifications =====================================================
router.get('/notifications', protect('student'), async (req, res, next) => {
  try {
const userId = req.user?._id;
const user = await User.findById(userId).lean();
if (!userId) return res.redirect('/auth/login');

    const notifications = await Notification.find({ recipient: userId })
        .populate('sender', 'first_name last_name')
        .sort({ created_at: -1 })
        .lean();

    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.render('student/notifications', {
      title: 'Thông báo - English MCQ',
      notifications,
      unreadCount,
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/notifications/read/:id', protect('student'), async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.patch('/notifications/read-all', protect('student'), async (req, res) => {
  try {
const userId = req.user?._id; 
if (!userId) return res.redirect('/auth/login');

    await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.delete('/notifications/:id', protect('student'), async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err);
  }
});

//============================= Exams & History ===================================================
router.get('/history', protect('student'), examSessionController.getHistory);

router.get('/my-classes', protect('student'), async (req, res, next) => {
    try {
        const studentId = req.user._id;
        const memberships = await ClassMember.find({ student_id: studentId })
            .populate({
                path: 'class_id',
                populate: { path: 'teacher_id', select: 'first_name last_name' }
            })
            .lean();
        
        const classes = await Promise.all(memberships.map(async (m) => {
            const cls = m.class_id;
            if (!cls) return null;
            
            const studentCount = await ClassMember.countDocuments({ class_id: cls._id });
            const examCount = await Exam.countDocuments({ class_id: cls._id, status: 'PUBLISHED' });
            
            return {
                ...cls,
                teacherName: cls.teacher_id ? `${cls.teacher_id.first_name} ${cls.teacher_id.last_name}` : 'N/A',
                studentCount,
                examCount
            };
        }));

        res.render('student/my-classes', {
            title: 'Lớp học của tôi',
            classes: classes.filter(c => c !== null)
        });
    } catch (err) {
        next(err);
    }
});

router.get('/exam-do', protect('student'), async (req, res) => {
    try {
        const examsData = await Exam.find({ status: 'PUBLISHED' })
            .populate('class_id')
            .lean();
        
        const exams = await Promise.all(examsData.map(async (exam) => {
            const questionCount = await ExamQuestion.countDocuments({ exam_id: exam._id });
            return {
                ...exam,
                questionCount
            };
        }));

        res.render('student/upcoming-exams', {
            title: 'Kỳ thi sắp tới',
            exams
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// POST join-class
router.post('/join-class', async (req, res) => {
    try {
        const studentId = req.user._id;
        const { classCode } = req.body;
        
        if (!classCode) return res.status(400).send('Vui lòng nhập mã lớp');
        
        const cls = await Class.findOne({ class_code: classCode.trim().toUpperCase() });
        if (!cls) return res.status(404).send('Không tìm thấy lớp học với mã này');
        
        // Check if already a member
        const existing = await ClassMember.findOne({ class_id: cls._id, student_id: studentId });
        if (existing) return res.status(400).send('Bạn đã là thành viên của lớp này rồi');
        
        await ClassMember.create({ 
            class_id: cls._id, 
            student_id: studentId,
            description: 'Sinh viên mới tham gia',
            created_at: new Date()
        });
        
        res.redirect('/student/my-classes');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Mount the session routes under /student/exam-sessions to match templates
router.post('/exam-sessions/start', protect('student'), examSessionController.startExamSession);
router.post('/exam-sessions/answer', protect('student'), examSessionController.submitAnswer);
router.post('/exam-sessions/submit', protect('student'), examSessionController.submitExam);

router.get('/exam-sessions/:sessionId/do', protect('student'), examSessionController.doExamPage);
router.get('/exam-sessions/:sessionId/result', protect('student'), examSessionController.getResult);

module.exports = router;
