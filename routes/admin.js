var express = require('express');
var router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const {protect} = require('../middleware/auth');

router.get('/dashboard', protect('admin'), (req, res) => {
    res.render('admin/dashboard', {
        user: req.user,
        title: 'Admin Dashboard'
    });
});

//=======================Thông Báo=============================================================
router.get('/notifications', async (req, res) => {
    try {
        const notifications = await Notification.find()
            .populate('recipient', 'email first_name last_name').sort({created_at: -1}).lean();

        const users = await User.find({}, 'email first_name last_name').lean();

        res.render('admin/manager-notifications', {
            title: 'Quản lý thông báo', notifications, users
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});



    router.post('/notifications', async (req, res) =>
    {
        try {
            const {recipient, title, message, type} = req.body;
            const newNoti = new Notification({
                recipient,
                title,
                message,
                type
            });
            await newNoti.save();
            res.redirect('/admin/notifications');
        } catch (err) {
            res.status(500).send(err.message);
        }
    });

    router.delete('/notifications/:id', async (req, res) =>
    {
        try {
            await Notification.findByIdAndDelete(req.params.id);
            res.sendStatus(200);
        } catch (err) {
            res.status(500).send(err.message);
        }
    });

//===========================Quản lý người dùng========================================
    router.get('/manager-user', async (req, res) => {
        try {
            const users = await User.find().lean();

            const teachers = users.filter(u => u.role === 'teacher');
            const students = users.filter(u => u.role === 'student');

            res.render('admin/manager-user', {
                title: 'Quản lý người dùng',
                teachers,
                students,
                teacherCount: teachers.length,
                studentCount: students.length
            });
        } catch (err) {
            res.status(500).send(err.message);
        }
    });

    router.post('/manager-user', async (req, res) => {
        try {
            const {first_name, last_name, email, password, role, student_id, department} = req.body;

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new User({
                first_name,
                last_name,
                email,
                password: hashedPassword,
                role,
                student_id,
                department
            });

            await newUser.save();
            res.redirect('/admin/manager-user');
        } catch (err) {
            res.status(500).send("Lỗi khi tạo tài khoản: " + err.message);
        }
    });

    router.patch('/manager-user/status/:id', async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            const newStatus = user.status === 'active' ? 'locked' : 'active';
            await User.findByIdAndUpdate(req.params.id, {status: newStatus});
            res.sendStatus(200);
        } catch (err) {
            res.status(500).send(err.message);
        }
    });

    router.delete('/manager-user/:id', async (req, res) => {
        try {
            await User.findByIdAndDelete(req.params.id);
            res.sendStatus(200);
        } catch (err) {
            res.status(500).send(err.message);
        }
    });
    module.exports = router;
