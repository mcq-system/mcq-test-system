const mongoose = require('mongoose');
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

    student_id: { type: String },
    class_name: { type: String },
    department: { type: String },
    address: { type: String },
    dob: { type: Date },

    role: {
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
// Hash password before saving to the database
userSchema.pre('save', async function () {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

/**
 * Compares a plain-text password against the hashed one stored in the database.
 * @param {string} candidatePassword - The plain-text password to compare.
 * @returns {Promise<boolean>} True if the passwords match, false otherwise.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Returns a public-facing representation of the user (without sensitive fields).
 * @returns {Object} User object without password.
 */
userSchema.methods.toPublicJSON = function () {
  const user = this.toObject({ virtuals: true });
  delete user.password;
  return user;
};

/**
 * Generate and hash password token
 * @returns {string} Plain token to send to user
 */
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
