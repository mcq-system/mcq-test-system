const StudentAnswer = require('../models/StudentAnswer');

// GET /student-answers?exam_session_id=...&question_id=...
exports.listStudentAnswers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.exam_session_id) filter.exam_session_id = req.query.exam_session_id;
    if (req.query.question_id) filter.question_id = req.query.question_id;

    const answers = await StudentAnswer.find(filter).lean();
    return res.status(200).json({ success: true, data: answers });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// POST /student-answers
exports.createStudentAnswer = async (req, res) => {
  try {
    const { exam_session_id, question_id, option_content } = req.body;
    if (!exam_session_id || !question_id) {
      return res.status(400).json({ error: 'exam_session_id and question_id are required' });
    }

    const answer = await StudentAnswer.create({
      exam_session_id,
      question_id,
      option_content: option_content || null,
    });
    return res.status(201).json({ success: true, data: answer });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// GET /student-answers/:id
exports.getStudentAnswer = async (req, res) => {
  try {
    const answer = await StudentAnswer.findById(req.params.id).lean();
    if (!answer) return res.status(404).json({ error: 'Student answer not found' });
    return res.status(200).json({ success: true, data: answer });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH /student-answers/:id
exports.updateStudentAnswer = async (req, res) => {
  try {
    const update = {};
    if (req.body.option_content !== undefined) update.option_content = req.body.option_content;

    const answer = await StudentAnswer.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
    if (!answer) return res.status(404).json({ error: 'Student answer not found' });
    return res.status(200).json({ success: true, data: answer });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE /student-answers/:id
exports.deleteStudentAnswer = async (req, res) => {
  try {
    const answer = await StudentAnswer.findByIdAndDelete(req.params.id).lean();
    if (!answer) return res.status(404).json({ error: 'Student answer not found' });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
