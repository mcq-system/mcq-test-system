const mongoose = require('mongoose');

const questionTopicSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Topic name is required'],
            trim: true,
            unique: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        color : {
            type: String,
            trim: true,
            default: '#000000', // Default color (black)
        },
        icon: {
            type: String,
            trim: true,
            default: '', // Default to empty string if no icon is provided
        },
        created_at: {
            type: Date,
            default: Date.now(),
        },
    },
    { timestamps: false }
);

module.exports = mongoose.model('QuestionTopic', questionTopicSchema, 'question_topics');