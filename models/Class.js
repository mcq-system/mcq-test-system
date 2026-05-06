const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClassSchema = new Schema({
  ten: { type: String, required: true }, // name
  teacher_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Class', ClassSchema);
