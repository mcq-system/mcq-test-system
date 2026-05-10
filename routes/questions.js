const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const QuestionController = require('../controller/QuestionController');

// Use controller methods which operate on DB via Mongoose
// GET /questions (list)
router.get('/', protect('teacher'), QuestionController.getQuestions);

// GET /questions/create
router.get('/create', protect('teacher'), QuestionController.getCreateQuestion);

// POST /questions/create
router.post('/create', protect('teacher'), QuestionController.postCreateQuestion);

// GET /questions/:id/edit
router.get('/:id/edit', protect('teacher'), QuestionController.getEditQuestion);

// PUT /questions/:id
router.put('/:id', protect('teacher'), QuestionController.putUpdateQuestion);

// DELETE /questions/:id
router.delete('/:id', protect('teacher'), QuestionController.deleteQuestion);

// API: GET /questions/:id (JSON detail)
router.get('/:id', protect('teacher'), QuestionController.getQuestionDetail);

module.exports = router;
