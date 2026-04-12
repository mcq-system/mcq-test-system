const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// @route   GET /student/dashboard
// @desc    Display student dashboard
// @access  Private (Student)
router.get('/dashboard', protect('student'), (req, res) => {
  res.render('student/dashboard', {
    user: req.user,
    title: 'Student Dashboard'
  });
});

module.exports = router;
