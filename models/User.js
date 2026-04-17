const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    phone: { type: String },
    password: { type: String, required: true },

    student_id: { type: String },
    class_name: { type: String },
    department: { type: String },
    address: { type: String },
    dob: { type: Date },

    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        default: 'student'
    },
    status: {
        type: String,
        enum: ['active', 'locked'],
        default: 'active'
    },

    created_at: { type: Date, default: Date.now }
});

UserSchema.virtual('full_name').get(function() {
    return `${this.last_name} ${this.first_name}`;
});

module.exports = mongoose.model('User', UserSchema);