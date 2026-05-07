const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const examController = require('../controller/examController');

router.get('/', protect('teacher'), examController.listExams);
router.post('/', protect('teacher'), examController.createExam);
router.get('/:id', protect('teacher'), examController.getExam);
router.patch('/:id', protect('teacher'), examController.updateExam);
router.delete('/:id', protect('teacher'), examController.deleteExam);

router.get('/:id/questions', protect(['teacher', 'student']), examController.listExamQuestions);
router.post('/:id/questions', protect('teacher'), examController.addExamQuestion);
router.get('/:id/questions/:q_id', protect(['teacher', 'student']), examController.getExamQuestion);

module.exports = router;
