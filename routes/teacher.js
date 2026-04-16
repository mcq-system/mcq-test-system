const express = require('express');
const router = express.Router();

router.get('/dashboard', (req, res) => {
    res.render('teacher/dashboard', {title: 'Lịch dạy giảng viên', layout: 'layout-teacher'
    });
});


module.exports = router;