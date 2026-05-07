const mongoose = require('mongoose');

const examQuestionSchema = new mongoose.Schema({
    exam_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    question_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
}, { timestamps: false });

module.exports = mongoose.model('ExamQuestion', examQuestionSchema, 'exam_questions');