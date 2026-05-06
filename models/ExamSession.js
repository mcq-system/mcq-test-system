const mongoose = require("mongoose");

const examSessionSchema = new mongoose.Schema({
    exam_id: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // numeric score from 0..10, optional until submitted
    score: { type: Number, min: 0, max: 10 },
    started_at: { type: Date, default: Date.now },
    submitted_at: { type: Date },
    status: {
        type: String,
        enum: ["DOING", "SUBMITTED", "EXPIRED"],
        default: "DOING",
    },
}, { timestamps: false });

examSessionSchema.index({ exam_id: 1, student_id: 1 }, { unique: true });

module.exports = mongoose.model("ExamSession", examSessionSchema);