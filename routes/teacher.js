const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// @route   GET /teacher/dashboard
// @desc    Display teacher dashboard
// @access  Private (Teacher)
router.get('/dashboard', protect('teacher'), (req, res) => {
  res.render('teacher/dashboard', {
    user: req.user,
    title: 'Teacher Dashboard'
  });
});

module.exports = router;
