const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const topicController = require('../controller/topicController');

router.get('/', protect('teacher'), topicController.listTopics);
router.post('/', protect('teacher'), topicController.createTopic);
router.get('/:id', protect('teacher'), topicController.getTopic);
router.patch('/:id', protect('teacher'), topicController.updateTopic);
router.delete('/:id', protect('teacher'), topicController.deleteTopic);

module.exports = router;
