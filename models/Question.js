const mongoose = require('mongoose');
const QuestionSchema = new mongoose.Schema({
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    topic: String,
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    options: [{
        key: { type: String, enum: ['A','B','C','D'], required: true },
        value: { type: String, required: true }
    }],
    correct_answer: { type: String, enum: ['A','B','C','D'], required: true },
    explanation: String,
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Question', QuestionSchema);