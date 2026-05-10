const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  class_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  day_of_week: { type: Number, required: true },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
});

module.exports = mongoose.model('Schedule', scheduleSchema, 'schedules');
