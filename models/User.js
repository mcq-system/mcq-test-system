const mongoose = require('mongoose');
<<<<<<< HEAD
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    last_name: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never return password in queries by default
    },
=======

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
>>>>>>> 1b5ea3f4e07e24826392b11fa7e8980b55bb038b

    student_id: { type: String },
    class_name: { type: String },
    department: { type: String },
    address: { type: String },
    dob: { type: Date },

    role: {
<<<<<<< HEAD
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'banned'],
      default: 'active',
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: false,
  }
);

// ─── Virtual Field ────────────────────────────────────────────────────────────
// Combines first_name and last_name into a full name
userSchema.virtual('full_name').get(function () {
  return `${this.first_name} ${this.last_name}`;
});

// ─── Pre-save Hook ────────────────────────────────────────────────────────────
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
    role: { type: String },
    status: { type: String, enum: ['active', 'inactive', 'banned'], default: 'active' },
    created_at: { type: Date, default: Date.now },
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

module.exports = mongoose.model('User', UserSchema);
  return user;
