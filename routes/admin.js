const express = require('express');
const router = express.Router();

router.get('/dashboard', function(req, res) {
    // Render file dashboard.hbs trong thư mục views/admin
    res.render('admin/dashboard', {
        title: 'Bảng điều khiển Admin'
    });
});
router.get('/calendar-teacher', function(req, res) {
    res.render('admin/calendar-teacher', { title: 'Lịch dạy giảng viên' });
});

router.get('/calendar-student', function(req, res) {
    res.render('admin/calendar-student', { title: 'Lịch học sinh viên' });
});
router.get('/dashboard-admin', function(req, res) {
    res.render('admin/dashboard-admin', {
        title: 'Bảng điều khiển Admin hệ thống'
    });
});
router.get('/topic-list', function(req, res) {
    res.render('admin/topic-list', {
        title: 'Danh Sách Chủ Đề'
    });
});
router.get('/question-list', function(req, res) {
    res.render('admin/topic-list', {
        title: 'Danh Sách Câu Hỏi'
    });
});
module.exports = router;