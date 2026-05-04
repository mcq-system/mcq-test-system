const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const questionController = require('../controller/questionController');

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get('/dashboard', protect('teacher'), (req, res) => {
  res.render('teacher/dashboard', {
    user: req.user,
    title: 'Teacher Dashboard',
  });
});

// ─── Questions ────────────────────────────────────────────────────────────────
router.get('/questions',             protect('teacher'), questionController.getQuestions);
router.get('/questions/create',      protect('teacher'), questionController.getCreateQuestion);
router.post('/questions/create',     protect('teacher'), questionController.postCreateQuestion);
router.get('/questions/:id/edit',    protect('teacher'), questionController.getEditQuestion);
router.put('/questions/:id',         protect('teacher'), questionController.putUpdateQuestion);
router.delete('/questions/:id',      protect('teacher'), questionController.deleteQuestion);
router.get('/questions/:id',         protect('teacher'), questionController.getQuestionDetail);

module.exports = router;