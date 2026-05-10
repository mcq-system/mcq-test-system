const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const classController = require('../controller/classController');
const scheduleController = require('../controller/scheduleController');

router.get('/', protect('teacher'), classController.getClasses);
router.post('/', protect('teacher'), classController.createClass);
router.get('/:id', protect('teacher'), classController.getClass);
router.put('/:id', protect('teacher'), classController.updateClass);
router.delete('/:id', protect('teacher'), classController.deleteClass);

router.get('/:id/students', protect('teacher'), classController.getClassStudents);
router.post('/:id/students', protect('teacher'), classController.addClassStudent);
router.delete('/:id/students/:stu_id', protect('teacher'), classController.removeClassStudent);

router.get('/:id/schedule', protect('teacher'), scheduleController.getSchedule);
router.post('/:id/schedule', protect('teacher'), scheduleController.setSchedule);
router.delete('/:id/schedule/:scheduleId', protect('teacher'), scheduleController.deleteSchedule);

module.exports = router;
