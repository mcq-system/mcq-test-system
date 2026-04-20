const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  first_name: { type: String, required: true, trim: true },
  last_name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
  },
  phone: { type: String, trim: true, default: null },
  password: { type: String, required: true, minlength: 6, select: false },
  student_id: { type: String },
  class_name: { type: String },
  department: { type: String },
  address: { type: String },
  dob: { type: Date },
  role: { type: String },
  status: { type: String, enum: ['active', 'inactive', 'banned'], default: 'active' },
  created_at: { type: Date, default: Date.now },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: false
});

// Virtual full_name
UserSchema.virtual('full_name').get(function () {
  return `${this.first_name} ${this.last_name}`;
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Public JSON method
UserSchema.methods.toPublicJSON = function () {
  const user = this.toObject({ virtuals: true });
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', UserSchema);
