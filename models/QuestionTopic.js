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
        created_at: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: false }
);

module.exports = mongoose.model('QuestionTopic', questionTopicSchema);