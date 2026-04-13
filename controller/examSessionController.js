const ExamSession = require('../models/ExamSession');
const StudentAnswer = require('../models/StudentAnswer');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const QuestionOption = require('../models/QuestionOption');

// 1. Bắt đầu một phiên làm bài
exports.startExamSession = async (req, res) => {
  try {
    const { examId } = req.body;
    const studentId = req.user._id; // Giả sử đã xác thực

    let session = await ExamSession.findOne({ exam: examId, student: studentId });
    if (session) return res.status(200).json(session);

    session = await ExamSession.create({ exam: examId, student: studentId });
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Lưu đáp án từng câu hỏi
exports.submitAnswer = async (req, res) => {
  try {
    const { examSessionId, questionId, optionSelectedId } = req.body;
    const studentId = req.user._id;

    // Kiểm tra quyền
    const session = await ExamSession.findById(examSessionId);
    if (!session || String(session.student) !== String(studentId)) {
      return res.status(403).json({ error: 'Không có quyền' });
    }

    // Upsert đáp án
    const answer = await StudentAnswer.findOneAndUpdate(
      { examSession: examSessionId, question: questionId },
      { optionSelected: optionSelectedId },
      { upsert: true, new: true }
    );
    res.status(200).json(answer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Nộp bài thi
exports.submitExam = async (req, res) => {
  try {
    const { examSessionId } = req.body;
    const studentId = req.user._id;
    const session = await ExamSession.findById(examSessionId);
    if (!session || String(session.student) !== String(studentId)) {
      return res.status(403).json({ error: 'Không có quyền' });
    }
    if (session.status !== 'DOING') {
      return res.status(400).json({ error: 'Bài đã nộp hoặc hết hạn' });
    }
    session.status = 'SUBMITTED';
    session.submittedAt = new Date();
    await session.save();
    res.status(200).json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Xem kết quả bài thi
exports.getResult = async (req, res) => {
  try {
    const { examSessionId } = req.params;
    const studentId = req.user._id;
    const session = await ExamSession.findById(examSessionId);
    if (!session || String(session.student) !== String(studentId)) {
      return res.status(403).json({ error: 'Không có quyền' });
    }
    // Lấy danh sách đáp án
    const answers = await StudentAnswer.find({ examSession: examSessionId }).populate('question optionSelected');
    // Tính điểm
    let correct = 0;
    for (const ans of answers) {
      if (ans.optionSelected && ans.optionSelected.is_correct) correct++;
    }
    res.status(200).json({ total: answers.length, correct, answers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
