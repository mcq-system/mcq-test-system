const Question = require('../models/Question');
const QuestionTopic = require('../models/QuestionTopic');

// ─── LIST ─────────────────────────────────────────────────────────────────────

/**
 * GET /teacher/questions
 * List all questions created by the logged-in teacher with optional filters.
 */
exports.getQuestions = async (req, res) => {
    try {
        const { topic, level, status, search, page = 1 } = req.query;
        const LIMIT = 10;
        const skip = (parseInt(page) - 1) * LIMIT;

        const filter = { created_by: req.user.id };
        if (topic)  filter.topic_id = topic;
        if (level)  filter.level = level;
        if (status) filter.status = status;
        if (search) filter.content = { $regex: search, $options: 'i' };

        const [questions, total, topics] = await Promise.all([
            Question.find(filter)
                .populate('topic_id', 'name')
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(LIMIT)
                .lean(),
            Question.countDocuments(filter),
            QuestionTopic.find().sort({ name: 1 }).lean(),
        ]);

        const totalPages = Math.ceil(total / LIMIT);

        res.render('teacher/questions/index', {
            title: 'Quản lý câu hỏi',
            questions,
            topics,
            filters: { topic, level, status, search },
            pagination: {
                current: parseInt(page),
                total: totalPages,
                hasNext: parseInt(page) < totalPages,
                hasPrev: parseInt(page) > 1,
            },
            totalCount: total,
            user: req.user,
        });
    } catch (err) {
        console.error('getQuestions error:', err);
        res.status(500).render('error', { message: 'Lỗi tải danh sách câu hỏi', error: { status: 500 } });
    }
};

// ─── CREATE ───────────────────────────────────────────────────────────────────

/**
 * GET /teacher/questions/create
 */
exports.getCreateQuestion = async (req, res) => {
    try {
        const topics = await QuestionTopic.find().sort({ name: 1 }).lean();
        res.render('teacher/questions/form', {
            title: 'Tạo câu hỏi mới',
            topics,
            question: null,
            user: req.user,
        });
    } catch (err) {
        console.error('getCreateQuestion error:', err);
        res.status(500).render('error', { message: 'Lỗi tải trang', error: { status: 500 } });
    }
};

/**
 * POST /teacher/questions/create
 */
exports.postCreateQuestion = async (req, res) => {
    try {
        const { content, level, status, topic_id, option_contents, correct_option } = req.body;

        // Build options array
        const options = (option_contents || [])
            .map((c, i) => ({
                content: c.trim(),
                is_correct: String(i) === String(correct_option),
            }))
            .filter((o) => o.content !== '');

        const question = await Question.create({
            content: content.trim(),
            level,
            status,
            topic_id: topic_id || null,
            created_by: req.user.id,
            options,
        });

        return res.status(201).json({ success: true, message: 'Tạo câu hỏi thành công!', id: question._id });
    } catch (err) {
        console.error('postCreateQuestion error:', err);
        const message = err.errors
            ? Object.values(err.errors).map((e) => e.message).join(', ')
            : err.message;
        return res.status(400).json({ success: false, message });
    }
};

// ─── EDIT ─────────────────────────────────────────────────────────────────────

/**
 * GET /teacher/questions/:id/edit
 */
exports.getEditQuestion = async (req, res) => {
    try {
        const [question, topics] = await Promise.all([
            Question.findOne({ _id: req.params.id, created_by: req.user.id }).lean(),
            QuestionTopic.find().sort({ name: 1 }).lean(),
        ]);

        if (!question) {
            return res.status(404).render('error', { message: 'Không tìm thấy câu hỏi', error: { status: 404 } });
        }

        res.render('teacher/questions/form', {
            title: 'Chỉnh sửa câu hỏi',
            topics,
            question,
            user: req.user,
        });
    } catch (err) {
        console.error('getEditQuestion error:', err);
        res.status(500).render('error', { message: 'Lỗi tải trang', error: { status: 500 } });
    }
};

/**
 * PUT /teacher/questions/:id
 */
exports.putUpdateQuestion = async (req, res) => {
    try {
        const { content, level, status, topic_id, option_contents, correct_option } = req.body;

        const question = await Question.findOne({ _id: req.params.id, created_by: req.user.id });
        if (!question) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
        }

        const options = (option_contents || [])
            .map((c, i) => ({
                content: c.trim(),
                is_correct: String(i) === String(correct_option),
            }))
            .filter((o) => o.content !== '');

        question.content = content.trim();
        question.level = level;
        question.status = status;
        question.topic_id = topic_id || null;
        question.options = options;

        await question.save();

        return res.status(200).json({ success: true, message: 'Cập nhật câu hỏi thành công!' });
    } catch (err) {
        console.error('putUpdateQuestion error:', err);
        const message = err.errors
            ? Object.values(err.errors).map((e) => e.message).join(', ')
            : err.message;
        return res.status(400).json({ success: false, message });
    }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────

/**
 * DELETE /teacher/questions/:id
 */
exports.deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findOneAndDelete({ _id: req.params.id, created_by: req.user.id });
        if (!question) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
        }
        return res.status(200).json({ success: true, message: 'Xóa câu hỏi thành công!' });
    } catch (err) {
        console.error('deleteQuestion error:', err);
        return res.status(500).json({ success: false, message: 'Lỗi xóa câu hỏi' });
    }
};

// ─── DETAIL (API) ─────────────────────────────────────────────────────────────

/**
 * GET /teacher/questions/:id (JSON)
 */
exports.getQuestionDetail = async (req, res) => {
    try {
        const question = await Question.findOne({ _id: req.params.id, created_by: req.user.id })
            .populate('topic_id', 'name')
            .lean();

        if (!question) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
        }
        return res.status(200).json({ success: true, data: question });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};