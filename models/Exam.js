const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    class_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    duration_minutes: { type: Number, required: true },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    status: {
        type: String,
        enum: ['DRAFT', 'PUBLISHED', 'CLOSED'],
        default: 'DRAFT',
    },
}, { timestamps: false });

module.exports = mongoose.model('Exam', examSchema, 'exams');