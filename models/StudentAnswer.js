const mongoose = require('mongoose');

const studentAnswerSchema = new mongoose.Schema({
    exam_session_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExamSession',
        required: true,
    },
    question_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true,
    },
    selected_option_id: {
        type: mongoose.Schema.Types.ObjectId,
    },
}, { timestamps: false });

studentAnswerSchema.index({ exam_session_id: 1, question_id: 1 }, { unique: true });

module.exports = mongoose.model('StudentAnswer', studentAnswerSchema, 'student_answers');