const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const examSessionCrudController = require('../controller/examSessionCrudController');

router.get('/', protect(['teacher', 'student']), examSessionCrudController.listExamSessions);
router.post('/', protect(['teacher', 'student']), examSessionCrudController.createExamSession);
router.get('/:id', protect(['teacher', 'student']), examSessionCrudController.getExamSession);
router.patch('/:id', protect(['teacher', 'student']), examSessionCrudController.updateExamSession);
router.delete('/:id', protect(['teacher', 'student']), examSessionCrudController.deleteExamSession);

module.exports = router;
