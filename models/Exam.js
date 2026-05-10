const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    class_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    duration_minutes: { type: Number, default: 0 },
    start_time: { type: Date, default: null },
    end_time: { type: Date, default: null },
    status: {
        type: String,
        enum: ['DRAFT', 'PUBLISHED', 'CLOSED'],
        default: 'DRAFT',
    },
}, { timestamps: false });

module.exports = mongoose.model('Exam', examSchema, 'exams');