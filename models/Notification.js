const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['admin', 'teacher'] },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['exam', 'result', 'reminder', 'system'], default: 'system' },
    isRead: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);