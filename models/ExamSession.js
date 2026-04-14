const mongoose = require("mongoose");

const examSessionSchema = new mongoose.Schema(
  {
    exam_id: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    started_at: { type: Date, default: Date.now },
    submitted_at: { type: Date, default: null },
    status: {
      type: String,
      enum: ["DOING", "SUBMITTED", "EXPIRED"],
      default: "DOING",
    },
  },
  {
    timestamps: false,
    collection: "exam_sessions",
  },
);

examSessionSchema.index({ exam_id: 1, student_id: 1 }, { unique: true });

module.exports = mongoose.model("ExamSession", examSessionSchema);
