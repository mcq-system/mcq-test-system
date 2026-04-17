const mongoose = require('mongoose');
const ClassSchema = new mongoose.Schema({
    class_name: { type: String, required: true },
    class_code: { type: String, required: true, unique: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topic: String,
    max_students: { type: Number, default: 30 },
    start_date: Date,
    end_date: Date,
    description: String,
    teaching_days: [String],
    teaching_time: String,
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['draft', 'active', 'ended'], default: 'draft' },
    created_at: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Class', ClassSchema);