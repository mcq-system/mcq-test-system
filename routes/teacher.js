const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');
const User = require('../models/User');

//======================= Dashboard ============================================================
router.get('/dashboard', protect('teacher'), async (req, res) => {
  const teacherId = req.user?._id;
  const user = await User.findById(teacherId).lean();
  res.render('teacher/dashboard', {
    user,
    title: 'Teacher Dashboard',
    layout: 'layout-teacher',
  });
});

//======================= Notifications ========================================================
router.get('/notifications', protect('teacher'), async (req, res) => {
  try {
    const teacherId = req.user?._id;
    if (!teacherId) return res.redirect('/login');

    const incoming = await Notification.find({ recipient: teacherId })
        .populate('sender', 'first_name last_name')
        .sort({ created_at: -1 })
        .lean();

    const outgoing = await Notification.find({ sender: teacherId })
        .populate('recipient', 'first_name last_name email')
        .sort({ created_at: -1 })
        .lean();

    const teachers = await User.find({ role: 'teacher' }, 'first_name last_name email').lean();

    res.render('teacher/notifications', {
      title: 'Thông báo & Liên lạc',
      layout: 'layout-teacher',
      incoming,
      outgoing,
      teachers,
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

module.exports = router;
