const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect('teacher'), (req, res) => {
  res.render('teacher/dashboard', {
    user: req.user,
    title: 'Teacher Dashboard'
  });
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



// routes/teacher.js

// Đảm bảo dòng này đúng (không phải outer)
router.get('/my-classes', async (req, res) => {
    try {
        // Giả sử bạn lấy danh sách lớp từ Database
        // Nếu chưa có database, hãy để tạm mảng rỗng: const classes = [];
       const classes = [
        { id: 1, code: 'TOEIC-2024A', name: 'TOEIC Preparation 2024A', subject: 'TOEIC', students: 32, exams: 5, status: 'Đang hoạt động', time: '2024-01-15 - 2024-05-15' },
        { id: 2, code: 'IELTS-W01', name: 'IELTS Writing Workshop', subject: 'IELTS', students: 18, exams: 3, status: 'Đang hoạt động', time: '2024-02-01 - 2024-04-30' },
        { id: 3, code: 'GRAM-01', name: 'Grammar Foundations', subject: 'Grammar', students: 45, exams: 8, status: 'Đang hoạt động', time: '2024-01-10 - 2024-06-10' },
        { id: 4, code: 'VOC-ADV', name: 'Vocabulary Building', subject: 'Vocabulary', students: 28, exams: 4, status: 'Đã kết thúc', time: '2023-09-01 - 2023-12-20' },
        { id: 5, code: 'TOEIC-L01', name: 'TOEIC Listening', subject: 'TOEIC', students: 25, exams: 6, status: 'Nháp', time: '2024-03-01 - 2024-06-30' }
    ];

        res.render('teacher/class-management', {
            title: 'Quản lý lớp học',
            layout: 'layout-teacher', // File layouts/layout-teacher.hbs
            classes: classes
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi Server");
    }
});


router.get('/create-class', async (req, res) => {
    try {
        // Tạm thời bỏ qua kiểm tra login và tìm trong database
        // Chúng ta tạo một user giả ngay tại đây
        const user = {
            _id: "123",
            name: "Giảng viên demo",
            email: "teacher@test.com",
            avatar: "/images/default-avatar.png" // Nếu bạn có dùng ảnh đại diện
        };

        res.render('teacher/create-class', {
            title: 'Tạo lớp học mới',
            layout: 'layout-teacher', 
            user: user // Truyền user giả này vào giao diện
        });

    } catch (err) {
        console.error("Lỗi chi tiết:", err); 
        res.status(500).send("Lỗi Server: " + err.message);
    }
});




//======================= Quản lý đề thi (Teacher Exams) =======================================

// 1. Danh sách đề thi 
// Link truy cập: localhost:3000/teacher/exams
router.get('/exams', protect('teacher'), async (req, res) => {
    try {
        const teacherId = req.user?._id;
        const user = await User.findById(teacherId).lean();

        const exams = [
            { id: 1, title: 'TOEIC Reading Practice Test 1', topic: 'TOEIC', questions: 40, duration: 60, status: 'Đã xuất bản', classes_count: 3, total_attempts: 87, avg_score: '72%', created_at: '2024-01-15' },
            { id: 2, title: 'Grammar Fundamentals Quiz', topic: 'Grammar', questions: 25, duration: 30, status: 'Đã xuất bản', classes_count: 2, total_attempts: 124, avg_score: '68%', created_at: '2024-01-12' },
            { id: 3, title: 'IELTS Vocabulary Test', topic: 'Vocabulary', questions: 30, duration: 45, status: 'Nháp', classes_count: 0, total_attempts: 0, avg_score: '-', created_at: '2024-01-20' },
            { id: 4, title: 'TOEIC Listening Mock Exam', topic: 'TOEIC', questions: 50, duration: 90, status: 'Đã xuất bản', classes_count: 1, total_attempts: 32, avg_score: '75%', created_at: '2024-01-08' },
            { id: 5, title: 'Advanced Grammar Test', topic: 'Grammar', questions: 35, duration: 45, status: 'Đã lưu trữ', classes_count: 0, total_attempts: 156, avg_score: '65%', created_at: '2023-12-01' }
        ];

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
        // Sau khi xử lý logic lưu vào DB...
        res.redirect('/teacher/exams');
    } catch (err) {
        res.status(500).send("Lỗi khi lưu đề thi: " + err.message);
    }
});



>>>>>>> f07d833 (Update)
module.exports = router;
