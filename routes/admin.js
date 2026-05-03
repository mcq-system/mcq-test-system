const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

//======================= Dashboard ============================================================
router.get('/dashboard', protect('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).lean();
    res.render('admin/dashboard', {
      user,
      title: 'Admin Dashboard',
      layout: 'layout-admin',
    });
  } catch (err) {
    next(err);
  }
});

//======================= Notifications (Quản lý thông báo) =====================================
router.get('/notifications', protect('admin'), async (req, res) => {
  try {
    const notifications = await Notification.find()
        .populate('recipient', 'email first_name last_name')
        .populate('sender', 'first_name last_name')
        .sort({ created_at: -1 })
        .lean();
    const user = await User.findById(req.user._id).lean();
    const users = await User.find({ status: 'active' }, 'email first_name last_name').lean();

    res.render('admin/notifications', {
      title: 'Quản lý thông báo',
      layout: 'layout-admin',
      notifications,
      users,
      user,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/notifications', protect('admin'), async (req, res) => {
  try {
    const adminId = req.user._id;
    const { recipient, title, message, type } = req.body;

    const newNoti = new Notification({
      recipient,
      sender: adminId,
      senderRole: 'admin',
      title,
      message,
      type,
    });

    await newNoti.save();
    res.redirect('/admin/notifications');
  } catch (err) {
    res.status(500).send("Lỗi: " + err.message);
  }
});

router.delete('/notifications/:id', protect('admin'), async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

//=========================== Quản lý người dùng ========================================
router.get('/manager-user', protect('admin'), async (req, res) => {
  try {
    const users = await User.find().sort({ created_at: -1 }).lean();
    const user = await User.findById(req.user._id).lean();
    const teachers = users.filter(u => u.role === 'teacher');
    const students = users.filter(u => u.role === 'student');

    res.render('admin/manager-user', {
      title: 'Quản lý người dùng',
      layout: 'layout-admin',
      teachers,
      students,
      user,
      teacherCount: teachers.length,
      studentCount: students.length,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/manager-user', protect('admin'), async (req, res) => {
  try {
    const { first_name, last_name, email, password, role, student_id, department } = req.body;

    const userExist = await User.findOne({ email });
    if (userExist) return res.status(400).send("Email này đã được sử dụng");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role,
      student_id,
      department,
    });

    await newUser.save();
    res.redirect('/admin/manager-user');
  } catch (err) {
    res.status(500).send("Lỗi khi tạo tài khoản: " + err.message);
  }
});

router.patch('/manager-user/status/:id', protect('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User không tồn tại");

    const newStatus = user.status === 'active' ? 'locked' : 'active';
    await User.findByIdAndUpdate(req.params.id, { status: newStatus });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete('/manager-user/:id', protect('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

//============================= Profile (Hồ sơ Admin) =============================================
router.get('/profile', protect('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user) return res.status(404).send("Người dùng không tồn tại");
    if (user.dob) {
      const dateObj = new Date(user.dob);

      if (!isNaN(dateObj.getTime())) {
        user.dob_formatted = dateObj.toISOString().split('T')[0];
        user.dob_display = dateObj.toLocaleDateString('vi-VN');
      }
    }
    res.render('admin/profile', {
      title: 'Hồ sơ Admin',
      user,
      layout: 'layout-admin',
    });
  } catch (err) {
    next(err);
  }
});

router.post('/update-profile', protect('admin'), async (req, res, next) => {
  try {
    const adminId = req.user._id;
    const { fullname, email, phone, dob, address } = req.body;

    const nameParts = fullname.trim().split(' ');
    const firstName = nameParts.length > 1 ? nameParts.pop() : nameParts[0];
    const lastName = nameParts.join(' ');

    await User.findByIdAndUpdate(adminId, {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      dob,
      address,
    });
    res.redirect('/admin/profile');
  } catch (err) {
    next(err);
  }
});


//======================= Calendar (Từ han-be) ===================================================
router.get('/calendar-teacher', protect('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).lean();
    res.render('admin/calendar-teacher', {
      title: 'Lịch dạy giảng viên',
      layout: 'layout-admin',
      user,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/calendar-student', protect('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).lean();
    res.render('admin/calendar-student', {
      title: 'Lịch học sinh viên',
      layout: 'layout-admin',
      user,
    });
  } catch (err) {
    next(err);
  }
});

//======================= Dashboard Admin Chi Tiết (Từ han-be) ====================================
router.get('/dashboard-admin', protect('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).lean();
    res.render('admin/dashboard-admin', {
      title: 'Bảng điều khiển Admin hệ thống',
      layout: 'layout-admin',
      user,
    });
  } catch (err) {
    next(err);
  }
});

//======================= Ngân hàng câu hỏi (Từ han-be) ==========================================
router.get('/topic-list', protect('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).lean();
    res.render('admin/topic-list', {
      title: 'Danh Sách Chủ Đề',
      layout: 'layout-admin',
      user,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/question-list', protect('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).lean();
    res.render('admin/question-list', {
      title: 'Ngân hàng câu hỏi',
      layout: 'layout-admin',
      user,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/dashboard-student-stats', protect('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).lean();
    res.render('admin/dashboard-student-stats', {
      title: 'Thống kê lớp học',
      layout: 'layout-admin',
      user,
      // TODO: thay mock data bằng query thực khi có model phù hợp
      stats: { activeClasses: 3, examsDone: 12, avgScore: 7.8 },
      courses: [],
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
