const Class = require('../models/Class');
const ClassMember = require('../models/ClassMember');
const User = require('../models/User');

exports.getClasses = async (req, res) => {
  try {
    const teacherId = req.user?._id;
    const filter = req.user?.role === 'teacher' ? { teacher_id: teacherId } : {};
    const classes = await Class.find(filter).sort({ created_at: -1 }).lean();
    return res.status(200).json({ success: true, data: classes });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.createClass = async (req, res) => {
  try {
    const teacherId = req.user?._id;
    const { name, description, starting_date, ending_date, study_schedule } = req.body;
    if (!name) return res.status(400).json({ error: 'Class name is required' });

    // Generate random 6-char code if not provided
    const class_code = req.body.class_code || Math.random().toString(36).substring(2, 8).toUpperCase();

    const cls = await Class.create({
      name: String(name).trim(),
      class_code,
      description: description ? String(description).trim() : '',
      teacher_id: teacherId,
      starting_date: starting_date ? new Date(starting_date) : null,
      ending_date: ending_date ? new Date(ending_date) : null,
      study_schedule: study_schedule || []
    });

    return res.status(201).json({ success: true, data: cls });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.getClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id).lean();
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    return res.status(200).json({ success: true, data: cls });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const { name, description, starting_date, ending_date, class_code, study_schedule } = req.body;
    const updated = await Class.findByIdAndUpdate(
      req.params.id,
      {
        ...(name ? { name: String(name).trim() } : {}),
        ...(class_code ? { class_code: String(class_code).toUpperCase() } : {}),
        ...(description !== undefined ? { description: String(description).trim() } : {}),
        ...(starting_date !== undefined ? { starting_date: starting_date ? new Date(starting_date) : null } : {}),
        ...(ending_date !== undefined ? { ending_date: ending_date ? new Date(ending_date) : null } : {}),
        ...(study_schedule !== undefined ? { study_schedule } : {}),
      },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: 'Class not found' });
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const deleted = await Class.findByIdAndDelete(req.params.id).lean();
    if (!deleted) return res.status(404).json({ error: 'Class not found' });
    await ClassMember.deleteMany({ class_id: req.params.id });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.getClassStudents = async (req, res) => {
  try {
    const members = await ClassMember.find({ class_id: req.params.id })
      .populate('student_id', 'first_name last_name email')
      .lean();
    return res.status(200).json({ success: true, data: members });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.addClassStudent = async (req, res) => {
  try {
    const { student_id, description } = req.body;
    if (!student_id) return res.status(400).json({ error: 'student_id is required' });

    const student = await User.findById(student_id).lean();
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const member = await ClassMember.create({
      class_id: req.params.id,
      student_id,
      description: description ? String(description).trim() : '',
    });
    return res.status(201).json({ success: true, data: member });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.removeClassStudent = async (req, res) => {
  try {
    const result = await ClassMember.findOneAndDelete({
      class_id: req.params.id,
      student_id: req.params.stu_id,
    }).lean();
    if (!result) return res.status(404).json({ error: 'Member not found' });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
