const ExamSession = require('../models/ExamSession');
const StudentAnswer = require('../models/StudentAnswer');
const mongoose = require('mongoose');

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const getExamCollection = () => mongoose.connection.collection('exams');
const getQuestionCollection = () => mongoose.connection.collection('questions');

exports.startExamSession = async (req, res) => {
  try {
    const { examId } = req.body;
    const studentId = req.user.id;

    if (!isObjectId(examId)) {
      return res.status(400).json({ error: 'examId không hợp lệ' });
    }

    const exam = await getExamCollection().findOne({ _id: new mongoose.Types.ObjectId(examId) });
    if (!exam) {
      return res.status(404).json({ error: 'Không tìm thấy đề thi' });
    }

    let session = await ExamSession.findOne({ exam_id: examId, student_id: studentId });
    if (session) return res.status(200).json(session);

    session = await ExamSession.create({ exam_id: examId, student_id: studentId });
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { examSessionId, questionId, optionContent } = req.body;
    const studentId = req.user.id;

    if (!isObjectId(examSessionId) || !isObjectId(questionId)) {
      return res.status(400).json({ error: 'examSessionId hoặc questionId không hợp lệ' });
    }

    if (!optionContent || typeof optionContent !== 'string') {
      return res.status(400).json({ error: 'optionContent là bắt buộc' });
    }
 
    const session = await ExamSession.findById(examSessionId);
    if (!session || String(session.student_id) !== String(studentId)) {
      return res.status(403).json({ error: 'Không có quyền' });
    }

    if (session.status !== 'DOING') {
      return res.status(400).json({ error: 'Phiên làm bài không còn ở trạng thái DOING' });
    }
 
    const answer = await StudentAnswer.findOneAndUpdate(
      { exam_session_id: examSessionId, question_id: questionId },
      { option_content: optionContent.trim() },
      { upsert: true, new: true }
    );
    res.status(200).json(answer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
 
exports.submitExam = async (req, res) => {
  try {
    const { examSessionId } = req.body;
    const studentId = req.user.id;

    if (!isObjectId(examSessionId)) {
      return res.status(400).json({ error: 'examSessionId không hợp lệ' });
    }

    const session = await ExamSession.findById(examSessionId);
    if (!session || String(session.student_id) !== String(studentId)) {
      return res.status(403).json({ error: 'Không có quyền' });
    }

    if (session.status !== 'DOING') {
      return res.status(400).json({ error: 'Bài đã nộp hoặc hết hạn' });
    }

    session.status = 'SUBMITTED';
    session.submitted_at = new Date();
    await session.save();
    res.status(200).json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
 
exports.getResult = async (req, res) => {
  try {
    const { examSessionId } = req.params;
    const studentId = req.user.id;

    if (!isObjectId(examSessionId)) {
      return res.status(400).json({ error: 'examSessionId không hợp lệ' });
    }

    const session = await ExamSession.findById(examSessionId);
    if (!session || String(session.student_id) !== String(studentId)) {
      return res.status(403).json({ error: 'Không có quyền' });
    }

    
    const answers = await StudentAnswer.find({ exam_session_id: examSessionId }).lean();

    const questionIds = answers.map((a) => a.question_id);
    const questions = await getQuestionCollection()
      .find({ _id: { $in: questionIds } }, { projection: { options: 1, content: 1 } })
      .toArray();

    const questionMap = new Map(questions.map((q) => [String(q._id), q]));
 
    let correct = 0;
    const resultAnswers = answers.map((ans) => {
      const question = questionMap.get(String(ans.question_id));
      const correctOption = question?.options?.find((opt) => opt.is_correct);
      const isCorrect = Boolean(correctOption) && ans.option_content === correctOption.content;
      if (isCorrect) correct += 1;

      return {
        ...ans,
        question_content: question?.content || null,
        correct_option_content: correctOption?.content || null,
        is_correct: isCorrect,
      };
    });

    res.status(200).json({
      total: resultAnswers.length,
      correct,
      score_percent: resultAnswers.length ? Number(((correct / resultAnswers.length) * 100).toFixed(2)) : 0,
      answers: resultAnswers,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
