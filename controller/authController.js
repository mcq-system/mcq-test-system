const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mcq_secret_key';
const JWT_EXPIRES = '7d';

// ─── GET /login ───────────────────────────────────────────────────────────────
exports.getLogin = (req, res) => {
  res.render('auth/login');
};

// ─── GET /register ────────────────────────────────────────────────────────────
exports.getRegister = (req, res) => {
  res.render('auth/register');
};

// ─── POST /login ──────────────────────────────────────────────────────────────
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ email và mật khẩu.' });
    }

    // Find user and include the password field (hidden by default)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Tài khoản của bạn đã bị vô hiệu hóa.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác.' });
    }

    // Sign JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    // Set token as an HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });

    // Determine redirect URL based on role
    const redirectMap = {
      admin: '/admin/dashboard',
      teacher: '/teacher/dashboard',
      student: '/student/dashboard',
    };

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      redirectUrl: redirectMap[user.role] || '/',
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server. Vui lòng thử lại.' });
  }
};

// ─── POST /register ───────────────────────────────────────────────────────────
exports.postRegister = async (req, res) => {
  try {
    const { fullName, email, phone, role, password } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin.' });
    }

    // Split fullName into first_name and last_name
    // e.g. "Nguyen Van An" → first_name: "Nguyen Van", last_name: "An"
    const nameParts = fullName.trim().split(' ');
    const last_name = nameParts.pop();
    const first_name = nameParts.join(' ') || last_name;

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email này đã được sử dụng.' });
    }

    // Create new user (password is hashed automatically by the pre-save hook)
    await User.create({ first_name, last_name, email, phone, role, password });

    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công! Vui lòng đăng nhập.',
      redirectUrl: '/login',
    });
  } catch (err) {
    console.error('Register error:', err);
    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email này đã được sử dụng.' });
    }
    return res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
  }
};
