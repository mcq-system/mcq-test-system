const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');
const User = require('../models/User');

//============================= Dashboard ==========================================================
router.get('/dashboard', protect('student'), async (req, res) => {
    const userId = req.user._id;
    const user = await User.findById(userId).lean();
    res.render('student/dashboard', {
        user,
        title: 'Student Dashboard',
        layout: 'layout-student',
    });
});

//============================= Profile ===========================================================
router.get('/profile', protect('student'), async (req, res, next) => {
  try {
      const userId = req.user?._id;
      if (!userId) return res.redirect('/login');

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).send("Người dùng không tồn tại");

    if (user.dob) {
      user.dob_formatted = user.dob.toISOString().split('T')[0];
      user.dob_display = user.dob.toLocaleDateString('vi-VN');
    }

    res.render('student/profile', {
      title: 'Hồ sơ cá nhân',
      user,
      layout: 'layout-student',
    });
  } catch (err) {
    next(err);
  }
});

router.post('/update-profile', protect('student'), async (req, res, next) => {
  try {
const userId = req.user?._id; 
if (!userId) return res.redirect('/login');

    const { fullname, email, phone, dob, address } = req.body;
    const nameParts = fullname.trim().split(' ');
    const firstName = nameParts.pop();
    const lastName = nameParts.join(' ');

    await User.findByIdAndUpdate(userId, {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      dob,
      address,
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
if (!userId) return res.redirect('/login');

    const notifications = await Notification.find({ recipient: userId })
        .populate('sender', 'first_name last_name')
        .sort({ created_at: -1 })
        .lean();

    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.render('student/notifications', {
      title: 'Thông báo - English MCQ',
      notifications,
      unreadCount,
      layout: 'layout-student',
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
if (!userId) return res.redirect('/login');

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

module.exports = router;
