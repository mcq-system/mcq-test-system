const mongoose = require("mongoose");

const studentAnswerSchema = new mongoose.Schema(
  {
    examSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamSession",
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    optionSelected: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuestionOption",
    },
  },
  {
    timestamps: false,
  },
);

studentAnswerSchema.index({ examSession: 1, question: 1 }, { unique: true });

module.exports = mongoose.model("StudentAnswer", studentAnswerSchema);
