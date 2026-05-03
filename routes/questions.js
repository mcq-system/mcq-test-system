const express = require('express');
const router = express.Router();

// Mock data - trong thß╗▒c tß║┐ sß║╜ kß║┐t nß╗æi database
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

// GET / ΓÇö Danh s├ích c├óu hß╗Åi
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
    title: 'Danh s├ích c├óu hß╗Åi',
    questions: filtered,
    stats,
    levels,
    topics,
    types,
    filters: { search, type, level, topic },
    paginationInfo: `Hiß╗ân thß╗ï 1ΓÇô${filtered.length} cß╗ºa ${filtered.length} c├óu hß╗Åi`
  });
});

// GET /questions/new ΓÇö Form th├¬m c├óu hß╗Åi
router.get('/questions/new', (req, res) => {
  res.render('questions/form', {
    title: 'Th├¬m c├óu hß╗Åi',
    levels,
    topics,
    types,
    isNew: true
  });
});

// POST /questions ΓÇö L╞░u c├óu hß╗Åi mß╗¢i
router.post('/questions', (req, res) => {
  // TODO: validate & l╞░u v├áo database
  console.log('Dß╗» liß╗çu c├óu hß╗Åi mß╗¢i:', req.body);
  res.redirect('/');
});

// DELETE /questions/:id ΓÇö X├│a c├óu hß╗Åi
router.delete('/questions/:id', (req, res) => {
  // TODO: x├│a khß╗Åi database
  res.json({ success: true });
});

module.exports = router;
