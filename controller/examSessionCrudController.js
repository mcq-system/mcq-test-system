const ExamSession = require('../models/ExamSession');

// GET /exam-sessions?exam_id=...&student_id=...
exports.listExamSessions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.exam_id) filter.exam_id = req.query.exam_id;
    if (req.query.student_id) filter.student_id = req.query.student_id;

    const sessions = await ExamSession.find(filter).lean();
    return res.status(200).json({ success: true, data: sessions });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// POST /exam-sessions
exports.createExamSession = async (req, res) => {
  try {
    const { exam_id, student_id, started_at, submitted_at, status, score } = req.body;
    if (!exam_id || !student_id) {
      return res.status(400).json({ error: 'exam_id and student_id are required' });
    }

    const session = await ExamSession.create({
      exam_id,
      student_id,
      started_at: started_at ? new Date(started_at) : new Date(),
      submitted_at: submitted_at ? new Date(submitted_at) : undefined,
      status: status || 'DOING',
      score: score !== undefined ? Number(score) : undefined,
    });

    return res.status(201).json({ success: true, data: session });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// GET /exam-sessions/:id
exports.getExamSession = async (req, res) => {
  try {
    const session = await ExamSession.findById(req.params.id).lean();
    if (!session) return res.status(404).json({ error: 'Exam session not found' });
    return res.status(200).json({ success: true, data: session });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH /exam-sessions/:id
exports.updateExamSession = async (req, res) => {
  try {
    const update = {};
    const fields = ['status', 'score', 'started_at', 'submitted_at'];
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        update[f] = f.includes('_at') && req.body[f] ? new Date(req.body[f]) : req.body[f];
      }
    }

    const session = await ExamSession.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
    if (!session) return res.status(404).json({ error: 'Exam session not found' });
    return res.status(200).json({ success: true, data: session });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE /exam-sessions/:id
exports.deleteExamSession = async (req, res) => {
  try {
    const deleted = await ExamSession.findByIdAndDelete(req.params.id).lean();
    if (!deleted) return res.status(404).json({ error: 'Exam session not found' });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
