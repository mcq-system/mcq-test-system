const QuestionTopic = require('../models/QuestionTopic');

exports.listTopics = async (req, res) => {
  try {
    const topics = await QuestionTopic.find().sort({ name: 1 }).lean();
    return res.status(200).json({ success: true, data: topics });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.createTopic = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Topic name is required' });

    const topic = await QuestionTopic.create({
      name: String(name).trim(),
      description: description ? String(description).trim() : '',
    });

    return res.status(201).json({ success: true, data: topic });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.getTopic = async (req, res) => {
  try {
    const topic = await QuestionTopic.findById(req.params.id).lean();
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    return res.status(200).json({ success: true, data: topic });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateTopic = async (req, res) => {
  try {
    const { name, description } = req.body;
    const updated = await QuestionTopic.findByIdAndUpdate(
      req.params.id,
      {
        ...(name ? { name: String(name).trim() } : {}),
        ...(description !== undefined ? { description: String(description).trim() } : {}),
      },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: 'Topic not found' });
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteTopic = async (req, res) => {
  try {
    const deleted = await QuestionTopic.findByIdAndDelete(req.params.id).lean();
    if (!deleted) return res.status(404).json({ error: 'Topic not found' });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
