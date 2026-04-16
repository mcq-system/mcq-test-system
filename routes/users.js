var express = require('express');
var router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');

//=============================Dashboard==========================================================
router.get('/dashboard', function(req, res, next) {
  res.render('user/dashboard', {title: 'Dashboard', layout: 'layout'
  });
});

//=============================Profile==========================================================
router.get('/profile', async (req, res, next) => {
  try {
    const userId = "000000000000000000000001"; // ID mẫu
    // Lấy ID từ session thay vì viết cứng (khi có chức năng login)
    // const userId = req.session.userId;
    // if (!userId) {
    //   return res.redirect('/login'); // Chưa login thì đá về trang đăng nhập
    // }

    const user = await User.findById(userId).lean();

    if (!user) return res.status(404).send("Người dùng không tồn tại");

    if (user.dob) {
      user.dob_formatted = user.dob.toISOString().split('T')[0];
      user.dob_display = user.dob.toLocaleDateString('vi-VN');
    }

    res.render('user/profile', {
      title: 'Hồ sơ cá nhân',
      user: user
    });
  } catch (err) {
    next(err);
  }
});

router.post('/update-profile', async (req, res, next) => {
  try {
    const userId = "000000000000000000000001";
    const { fullname, email, phone, dob, address } = req.body;

    // Tách fullname thành last_name và first_name (tương đối)
    const nameParts = fullname.trim().split(' ');
    const firstName = nameParts.pop();
    const lastName = nameParts.join(' ');

    await User.findByIdAndUpdate(userId, {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      dob: dob,
      address: address
    });
    res.redirect('/users/profile');
  } catch (err) {
    next(err);
  }
});

//=============================Thong Bao=============================================================
router.get('/notifications', async function(req, res, next) {
  try {
    const userId = "000000000000000000000001"; // ID mẫu của bạn

    const notifications = await Notification.find({ recipient: userId })
        .populate('sender', 'first_name last_name')
        .sort({ created_at: -1 }).lean();

    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.render('user/notifications', {
      title: 'Thông báo - English MCQ',
      notifications: notifications,
      unreadCount: unreadCount
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/notifications/read/:id', async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.patch('/notifications/read-all', async (req, res) => {
  try {
    const userId = "000000000000000000000001"; // Sau này thay bằng ID user đang log
    await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.delete('/notifications/:id', async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err);
  }
});


module.exports = router;
