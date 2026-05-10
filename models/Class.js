const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClassSchema = new Schema({
  name: { type: String, required: true },
  class_code: { type: String, unique: true, required: true },
  teacher_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String },
  created_at: { type: Date, default: Date.now },
  starting_date: { type: Date },
  ending_date: { type: Date },
  study_schedule: [
    {
      _id: false,
      day: { type: String }, // Monday, Tuesday,...
      slots: [
        {
          _id: false,
          start: { type: String }, // "08:00"
          end: { type: String }    // "10:00"
        }
      ]
    }
  ]
});

module.exports = mongoose.model('Class', ClassSchema, 'classes');
