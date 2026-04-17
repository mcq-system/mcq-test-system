const express = require('express');
const router = express.Router();

// Mock data - trong thực tế sẽ kết nối database
const questions = [
  { id: 'Q-001', type: 'reading',   level: 'B1', topic: 'Environment', text: 'What is the main cause of climate change according to the passage?', opts: 4, used: 12 },
  { id: 'Q-002', type: 'listening', level: 'A2', topic: 'Culture',     text: 'What time does the speaker say the event starts?', opts: 4, used: 8 },
  { id: 'Q-003', type: 'grammar',   level: 'B2', topic: 'Technology',  text: 'Choose the correct form: "By the time she _____ (arrive), we had finished dinner."', opts: 4, used: 23 },
  { id: 'Q-004', type: 'vocab',     level: 'A1', topic: 'Health',      text: 'What does the word "beneficial" mean in this context?', opts: 4, used: 5 },
  { id: 'Q-005', type: 'reading',   level: 'C1', topic: 'Technology',  text: 'The author implies that AI development will primarily impact which sector first?', opts: 4, used: 17 },
  { id: 'Q-006', type: 'listening', level: 'B1', topic: 'Health',      text: 'According to the audio, how often should adults exercise per week?', opts: 4, used: 9 },
  { id: 'Q-007', type: 'grammar',   level: 'A2', topic: 'Culture',     text: 'She _____ (not/go) to the party because she was sick. Choose the correct answer.', opts: 4, used: 31 },
  { id: 'Q-008', type: 'vocab',     level: 'B2', topic: 'Environment', text: 'Select the synonym of "deteriorate" as used in the reading.', opts: 4, used: 14 },
];

const stats = {
  total: 128,
  reading: 54,
  listening: 38,
  grammarVocab: 36
};

const levels  = ['A1', 'A2', 'B1', 'B2', 'C1'];
const topics  = ['Environment', 'Technology', 'Health', 'Culture'];
const types   = ['reading', 'listening', 'grammar', 'vocab'];

// GET / — Danh sách câu hỏi
router.get('/', (req, res) => {
  const { search = '', type = '', level = '', topic = '' } = req.query;

  let filtered = [...questions];
  if (search) filtered = filtered.filter(q =>
    q.text.toLowerCase().includes(search.toLowerCase()) ||
    q.id.toLowerCase().includes(search.toLowerCase())
  );
  if (type)  filtered = filtered.filter(q => q.type === type);
  if (level) filtered = filtered.filter(q => q.level === level);
  if (topic) filtered = filtered.filter(q => q.topic === topic);

  res.render('questions/index', {
    title: 'Danh sách câu hỏi',
    questions: filtered,
    stats,
    levels,
    topics,
    types,
    filters: { search, type, level, topic },
    paginationInfo: `Hiển thị 1–${filtered.length} của ${filtered.length} câu hỏi`
  });
});

// GET /questions/new — Form thêm câu hỏi
router.get('/questions/new', (req, res) => {
  res.render('questions/form', {
    title: 'Thêm câu hỏi',
    levels,
    topics,
    types,
    isNew: true
  });
});

// POST /questions — Lưu câu hỏi mới
router.post('/questions', (req, res) => {
  // TODO: validate & lưu vào database
  console.log('Dữ liệu câu hỏi mới:', req.body);
  res.redirect('/');
});

// DELETE /questions/:id — Xóa câu hỏi
router.delete('/questions/:id', (req, res) => {
  // TODO: xóa khỏi database
  res.json({ success: true });
});

module.exports = router;
