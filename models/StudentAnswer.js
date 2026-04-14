const mongoose = require("mongoose");

const studentAnswerSchema = new mongoose.Schema(
  {
    exam_session_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamSession",
      required: true,
    },
    question_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    option_content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: false,
    collection: "student_answers",
  },
);

studentAnswerSchema.index({ exam_session_id: 1, question_id: 1 }, { unique: true });

module.exports = mongoose.model("StudentAnswer", studentAnswerSchema);
