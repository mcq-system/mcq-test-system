const ExamSession = require('../models/ExamSession');
const StudentAnswer = require('../models/StudentAnswer');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const ExamQuestion = require('../models/ExamQuestion');

// ============================================================
// STUDENT - Bắt đầu phiên làm bài
// POST /student/exam-sessions/start
// ============================================================
exports.startExamSession = async (req, res) => {
  try {
    const { exam_id } = req.body;
    const student_id = req.user._id;

    const exam = await Exam.findById(exam_id);
    if (!exam) {
        return res.render('error', { title: 'Lỗi', message: 'Không tìm thấy kỳ thi' });
    }
    if (exam.status !== 'PUBLISHED') {
        return res.render('error', { title: 'Thông báo', message: 'Kỳ thi này hiện chưa được mở' });
    }

    const now = new Date();
    if (now < exam.start_time) {
        return res.render('error', { title: 'Thông báo', message: 'Kỳ thi chưa đến thời gian bắt đầu' });
    }
    if (now > exam.end_time) {
        return res.render('error', { title: 'Thông báo', message: 'Kỳ thi đã kết thúc' });
    }

    let session = await ExamSession.findOne({ exam_id, student_id });
    if (session) {
      if (session.status === 'SUBMITTED') {
          return res.render('error', { title: 'Thông báo', message: 'Bạn đã hoàn thành và nộp bài thi này rồi' });
      }
      return res.redirect('/student/exam-sessions/' + session._id + '/do');
    }

    session = await ExamSession.create({ exam_id, student_id, started_at: now, status: 'DOING' });
    res.redirect('/student/exam-sessions/' + session._id + '/do');
  } catch (err) {
    res.render('error', { title: 'Lỗi hệ thống', message: err.message });
  }
};

// ============================================================
// STUDENT - Trang làm bài
// GET /student/exam-sessions/:sessionId/do
// ============================================================
exports.doExamPage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const student_id = req.user._id;
    const user = req.user;

    const session = await ExamSession.findById(sessionId).lean();
    if (!session || String(session.student_id) !== String(student_id)) {
      return res.status(403).render('error', { message: 'Không có quyền', error: { status: 403 } });
    }
    if (session.status !== 'DOING') {
      return res.redirect('/student/exam-sessions/' + sessionId + '/result');
    }

    const exam = await Exam.findById(session.exam_id).lean();
    const examQuestions = await ExamQuestion.find({ exam_id: session.exam_id }).lean();
    const questionIds = examQuestions.map(eq => eq.question_id);
    const questions = await Question.find({ _id: { $in: questionIds } }).lean();

    const answers = await StudentAnswer.find({ exam_session_id: sessionId }).lean();
    const answerMap = {};
    for (const a of answers) {
      answerMap[String(a.question_id)] = a.selected_option_id ? String(a.selected_option_id) : null;
    }

    const questionsWithAnswer = questions.map((q, idx) => ({
      ...q,
      index: idx + 1,
      selected_option: answerMap[String(q._id)] || null,
      options: q.options.map(o => ({
        ...o,
        is_selected: answerMap[String(q._id)] === String(o._id),
      })),
    }));

    // Tính thời gian còn lại (ms)
    const endTime = new Date(session.started_at).getTime() + exam.duration_minutes * 60 * 1000;
    const remainingMs = Math.max(0, endTime - Date.now());

    res.render('student/exam-do', {
      title: exam.title,
      layout: 'layout-student',
      user,
      exam,
      session: { ...session, _id: sessionId },
      questions: questionsWithAnswer,
      remainingMs,
      totalQuestions: questions.length,
      answeredCount: Object.keys(answerMap).length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// STUDENT - Lưu đáp án từng câu (AJAX)
// POST /student/exam-sessions/answer
// ============================================================
exports.submitAnswer = async (req, res) => {
  try {
    const { exam_session_id, question_id, selected_option_id } = req.body;
    const student_id = req.user._id;

    const session = await ExamSession.findById(exam_session_id);
    if (!session || String(session.student_id) !== String(student_id)) {
      return res.status(403).json({ error: 'Không có quyền' });
    }
    if (session.status !== 'DOING') {
      return res.status(400).json({ error: 'Phiên làm bài đã kết thúc' });
    }

    const answer = await StudentAnswer.findOneAndUpdate(
        { exam_session_id, question_id },
        { selected_option_id },
        { upsert: true, new: true }
    );
    res.status(200).json({ ok: true, answer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// STUDENT - Nộp bài thi
// POST /student/exam-sessions/submit
// ============================================================
exports.submitExam = async (req, res) => {
  try {
    const { exam_session_id } = req.body;
    const student_id = req.user._id;

    const session = await ExamSession.findById(exam_session_id);
    if (!session || String(session.student_id) !== String(student_id)) {
      return res.status(403).json({ error: 'Không có quyền' });
    }
    if (session.status !== 'DOING') {
      return res.status(400).json({ error: 'Bài đã nộp hoặc hết hạn' });
    }

    // Compute score before marking submitted
    const examQuestions = await ExamQuestion.find({ exam_id: session.exam_id }).lean();
    const questionIds = examQuestions.map(eq => eq.question_id);
    const questions = await Question.find({ _id: { $in: questionIds } }).lean();
    const answers = await StudentAnswer.find({ exam_session_id }).lean();
    const answerMap = {};
    for (const a of answers) answerMap[String(a.question_id)] = a.selected_option_id ? String(a.selected_option_id) : null;

    let correct = 0;
    for (const q of questions) {
      const correctOpt = q.options.find(o => o.is_correct);
      if (correctOpt && answerMap[String(q._id)] === String(correctOpt._id)) correct++;
    }
    const total = questions.length;
    const score = total > 0 ? Number(((correct / total) * 10).toFixed(1)) : 0.0;

    session.score = score;
    session.status = 'SUBMITTED';
    session.submitted_at = new Date();
    await session.save();

    res.redirect('/student/exam-sessions/' + exam_session_id + '/result');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// STUDENT - Trang kết quả bài thi
// GET /student/exam-sessions/:sessionId/result
// ============================================================
exports.getResult = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const student_id = req.user._id;
    const user = req.user;

    const session = await ExamSession.findById(sessionId).lean();
    if (!session || String(session.student_id) !== String(student_id)) {
      return res.status(403).render('error', { message: 'Không có quyền', error: { status: 403 } });
    }
    if (session.status !== 'SUBMITTED') {
      return res.redirect('/student/exam-sessions/' + sessionId + '/do');
    }

    const exam = await Exam.findById(session.exam_id).lean();
    const examQuestions = await ExamQuestion.find({ exam_id: session.exam_id }).lean();
    const questionIds = examQuestions.map(eq => eq.question_id);
    const questions = await Question.find({ _id: { $in: questionIds } }).lean();

    const answers = await StudentAnswer.find({ exam_session_id: sessionId }).lean();
    const answerMap = {};
    for (const a of answers) {
      answerMap[String(a.question_id)] = a.selected_option_id ? String(a.selected_option_id) : null;
    }

    let correct = 0;
    const detail = questions.map((q, idx) => {
      const selectedId = answerMap[String(q._id)] || null;
      const correctOption = q.options.find(o => o.is_correct);
      const isCorrect = selectedId && correctOption && selectedId === String(correctOption._id);
      if (isCorrect) correct++;
      const selectedOpt = selectedId ? q.options.find(o => String(o._id) === selectedId) : null;
      return {
        index: idx + 1,
        question: q.content,
        options: q.options.map(o => ({
          ...o,
          is_selected: String(o._id) === selectedId,
        })),
        selected: selectedOpt ? selectedOpt.content : null,
        correct_answer: correctOption ? correctOption.content : null,
        is_correct: !!isCorrect,
      };
    });

    const total = questions.length;
    const wrong = total - correct;
    const score = total > 0 ? ((correct / total) * 10).toFixed(1) : '0.0';

    res.render('student/exam-result', {
      title: 'Kết quả bài thi',
      exam,
      session,
      total,
      correct,
      wrong,
      score,
      detail,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// STUDENT - Lịch sử làm bài
// GET /student/exam-sessions/history
// ============================================================
exports.getHistory = async (req, res) => {
  try {
    const student_id = req.user._id;
    const user = req.user;

    const sessions = await ExamSession.find({ student_id }).lean();

    // Gắn thêm thông tin exam cho mỗi session
    const enriched = await Promise.all(sessions.map(async s => {
      const exam = await Exam.findById(s.exam_id).lean();
      return { ...s, exam };
    }));

    enriched.sort((a, b) => new Date(b.started_at) - new Date(a.started_at));

    res.render('student/exam-history', {
      title: 'Lịch sử làm bài',
      sessions: enriched,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// TEACHER - Xem tất cả session của một bài thi
// GET /teacher/exams/:examId/sessions
// ============================================================
exports.getExamSessions = async (req, res) => {
  try {
    const { examId } = req.params;
    const teacher_id = req.user._id;
    const user = req.user;

    const exam = await Exam.findById(examId).lean();
    if (!exam) return res.status(404).render('error', { message: 'Không tìm thấy bài thi', error: { status: 404 } });
    if (String(exam.created_by) !== String(teacher_id)) {
      return res.status(403).render('error', { message: 'Không có quyền', error: { status: 403 } });
    }

    const sessions = await ExamSession.find({ exam_id: examId })
        .populate('student_id', 'first_name last_name email')
        .lean();

    // Tính điểm nhanh cho mỗi session đã nộp
    const examQuestions = await ExamQuestion.find({ exam_id: examId }).lean();
    const questionIds = examQuestions.map(eq => eq.question_id);
    const questions = await Question.find({ _id: { $in: questionIds } }).lean();
    const total = questions.length;

    const sessionsWithScore = await Promise.all(sessions.map(async s => {
      if (s.status !== 'SUBMITTED') return { ...s, score: null };
      const answers = await StudentAnswer.find({ exam_session_id: s._id }).lean();
      const answerMap = {};
      for (const a of answers) answerMap[String(a.question_id)] = a.selected_option_id ? String(a.selected_option_id) : null;
      let correct = 0;
      for (const q of questions) {
        const correctOpt = q.options.find(o => o.is_correct);
        if (correctOpt && answerMap[String(q._id)] === String(correctOpt._id)) correct++;
      }
      return { ...s, correct, score: total > 0 ? ((correct / total) * 10).toFixed(1) : '0.0' };
    }));

    res.render('teacher/exam-sessions', {
      title: `Kết quả: ${exam.title}`,
      layout: 'layout-teacher',
      user,
      exam,
      sessions: sessionsWithScore,
      total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// TEACHER - Xem chi tiết kết quả 1 học sinh
// GET /teacher/exam-sessions/:sessionId/result
// ============================================================
exports.getSessionResultForTeacher = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const teacher_id = req.user._id;
    const user = req.user;

    const session = await ExamSession.findById(sessionId)
        .populate('student_id', 'first_name last_name email')
        .lean();
    if (!session) return res.status(404).render('error', { message: 'Không tìm thấy phiên thi', error: { status: 404 } });

    const exam = await Exam.findById(session.exam_id).lean();
    if (!exam || String(exam.created_by) !== String(teacher_id)) {
      return res.status(403).render('error', { message: 'Không có quyền', error: { status: 403 } });
    }

    const examQuestions = await ExamQuestion.find({ exam_id: session.exam_id }).lean();
    const questionIds = examQuestions.map(eq => eq.question_id);
    const questions = await Question.find({ _id: { $in: questionIds } }).lean();

    const answers = await StudentAnswer.find({ exam_session_id: sessionId }).lean();
    const answerMap = {};
    for (const a of answers) answerMap[String(a.question_id)] = a.selected_option_id ? String(a.selected_option_id) : null;

    let correct = 0;
    const detail = questions.map((q, idx) => {
      const selectedId = answerMap[String(q._id)] || null;
      const correctOption = q.options.find(o => o.is_correct);
      const isCorrect = selectedId && correctOption && selectedId === String(correctOption._id);
      if (isCorrect) correct++;
      const selectedOpt = selectedId ? q.options.find(o => String(o._id) === selectedId) : null;
      return {
        index: idx + 1,
        question: q.content,
        options: q.options.map(o => ({
          ...o,
          is_selected: String(o._id) === selectedId,
        })),
        selected: selectedOpt ? selectedOpt.content : null,
        correct_answer: correctOption ? correctOption.content : null,
        is_correct: !!isCorrect,
      };
    });

    const total = questions.length;
    const score = total > 0 ? ((correct / total) * 10).toFixed(1) : '0.0';

    res.render('teacher/session-result', {
      title: 'Chi tiết bài làm',
      layout: 'layout-teacher',
      user,
      exam,
      session,
      total,
      correct,
      wrong: total - correct,
      score,
      detail,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};