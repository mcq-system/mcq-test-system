const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');

//=======================Thông Báo=============================================================
router.get('/notifications', async (req, res) => {
    try {
        const teacherId = "000000000000000000000002";

        const incoming = await Notification.find({ recipient: teacherId })
            .populate('sender', 'first_name last_name')
            .sort({ created_at: -1 }).lean();

        const outgoing = await Notification.find({ sender: teacherId })
            .populate('recipient', 'first_name last_name email')
            .sort({ created_at: -1 }).lean();

        const students = await User.find({ role: 'student' }, 'first_name last_name email').lean();

        res.render('teacher/notifications', {
            title: 'Thông báo & Liên lạc',
            layout: 'layout-teacher',
            incoming,
            outgoing,
            students
        });
    } catch (err) { res.status(500).send(err.message); }
});

router.post('/notifications/send', async (req, res) => {
    try {
        const teacherId = "000000000000000000000002";
        const { recipient, title, message, type } = req.body;

        const newNoti = new Notification({
            recipient,
            sender: teacherId,
            senderRole: 'teacher',
            title,
            message,
            type
        });
        await newNoti.save();
        res.redirect('/teacher/notifications');
    } catch (err) { res.status(500).send(err.message); }
});

module.exports = router;