const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: [true, 'Option content is required'],
            trim: true,
        },
        is_correct: {
            type: Boolean,
            default: false,
        },
    },
    { _id: true }
);

const questionSchema = new mongoose.Schema(
    {
        topic_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'QuestionTopic',
            default: null,
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: [true, 'Question content is required'],
            trim: true,
        },
        level: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'easy',
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
        options: {
            type: [optionSchema],
            validate: {
                validator: function (opts) {
                    if (!opts || opts.length < 2) return false;
                    const correctCount = opts.filter((o) => o.is_correct).length;
                    return correctCount === 1;
                },
                message: 'A question must have at least 2 options and exactly 1 correct answer.',
            },
        },
        created_at: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: false }
);

module.exports = mongoose.model('Question', questionSchema);