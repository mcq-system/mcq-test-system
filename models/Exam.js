const mongoose = require('mongoose');
const ExamSchema = new mongoose.Schema({
    exam_name: { type: String, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    class_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    topic: String,
    duration: { type: Number, default: 60 },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    status: { type: String, enum: ['draft', 'published', 'closed'], default: 'draft' },
    start_time: Date,
    end_time: Date,
    total_attempts: { type: Number, default: 0 },
    avg_score: Number,
    created_at: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Exam', ExamSchema);