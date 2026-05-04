const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect('teacher'), (req, res) => {
  res.render('teacher/dashboard', {
    user: req.user,
    title: 'Teacher Dashboard'
  });
});

module.exports = router;
