const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const topicController = require('../controller/topicController');

router.get('/', protect(['admin', 'teacher']), topicController.listTopics);
router.post('/', protect(['admin', 'teacher']), topicController.createTopic);
router.get('/:id', protect(['admin', 'teacher']), topicController.getTopic);
router.patch('/:id', protect(['admin', 'teacher']), topicController.updateTopic);
router.delete('/:id', protect(['admin', 'teacher']), topicController.deleteTopic);

module.exports = router;
