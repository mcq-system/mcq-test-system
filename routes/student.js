const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const examSessionController = require('../controller/examSessionController');

// @route   GET /student/dashboard
// @desc    Display student dashboard
// @access  Private (Student)
router.get('/dashboard', protect('student'), (req, res) => {
  res.render('student/dashboard', {
    user: req.user,
    title: 'Student Dashboard'
  });
});

// Exam Session APIs
router.post('/exam-sessions/start', protect('student'), examSessionController.startExamSession);
router.post('/exam-sessions/answer', protect('student'), examSessionController.submitAnswer);
router.post('/exam-sessions/submit', protect('student'), examSessionController.submitExam);
router.get('/exam-sessions/:examSessionId/result', protect('student'), examSessionController.getResult);

module.exports = router;
