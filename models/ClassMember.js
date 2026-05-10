const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClassMemberSchema = new Schema({
  class_id: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  student_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ClassMember', ClassMemberSchema, 'class_members');
