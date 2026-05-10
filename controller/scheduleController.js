const Class = require('../models/Class');
const Schedule = require('../models/Schedule');

exports.getSchedule = async (req, res) => {
  try {
    const classId = req.params.id;
    const cls = await Class.findById(classId).lean();
    if (!cls) return res.status(404).json({ error: 'Class not found' });

    const schedules = await Schedule.find({ class_id: classId })
      .sort({ day_of_week: 1, start_time: 1 })
      .lean();
    return res.status(200).json({ success: true, data: schedules });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.setSchedule = async (req, res) => {
  try {
    const classId = req.params.id;
    const schedules = Array.isArray(req.body.schedules) ? req.body.schedules : [];

    for (const s of schedules) {
      if (typeof s.day_of_week !== 'number' || !s.start_time || !s.end_time) {
        return res.status(400).json({ error: 'Invalid schedule format' });
      }
    }

    await Schedule.deleteMany({ class_id: classId });
    if (schedules.length) {
      const toInsert = schedules.map((s) => ({
        class_id: classId,
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
      }));
      await Schedule.insertMany(toInsert);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE /classes/:id/schedule/:scheduleId
exports.deleteSchedule = async (req, res) => {
  try {
    const { id: classId, scheduleId } = req.params;
    const deleted = await Schedule.findOneAndDelete({ _id: scheduleId, class_id: classId }).lean();
    if (!deleted) return res.status(404).json({ error: 'Schedule not found' });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
