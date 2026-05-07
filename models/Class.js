const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClassSchema = new Schema({
  name: { type: String, required: true },
  teacher_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Class', ClassSchema, 'classes');
