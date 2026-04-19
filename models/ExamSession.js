const mongoose = require("mongoose");

const examSessionSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    status: {
      type: String,
      enum: ["DOING", "SUBMITTED", "EXPIRED"],
      default: "DOING",
    },
  },
  {
    timestamps: false,
  },
);

examSessionSchema.index({ exam: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("ExamSession", examSessionSchema);
