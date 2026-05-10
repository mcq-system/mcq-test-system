const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const studentAnswerController = require('../controller/studentAnswerController');

router.get('/', protect(['teacher', 'student']), studentAnswerController.listStudentAnswers);
router.post('/', protect(['teacher', 'student']), studentAnswerController.createStudentAnswer);
router.get('/:id', protect(['teacher', 'student']), studentAnswerController.getStudentAnswer);
router.patch('/:id', protect(['teacher', 'student']), studentAnswerController.updateStudentAnswer);
router.delete('/:id', protect(['teacher', 'student']), studentAnswerController.deleteStudentAnswer);

module.exports = router;
