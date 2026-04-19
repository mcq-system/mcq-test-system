const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'mcq_secret_key';
const JWT_EXPIRES = '7d';

exports.getLogin = (req, res) => {
  res.render('auth/login', { title: 'Đăng nhập' });
};
exports.getRegister = (req, res) => {
  res.render('auth/register', { title: 'Đăng ký' });
};
exports.getProfile = (req, res) => {
  res.render('auth/profile', { title: 'Thông tin cá nhân' });
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ email và mật khẩu.' });
    }

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

exports.postRegister = async (req, res) => {
  try {
    const { fullName, email, phone, role, password } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin.' });
    }

    const nameParts = fullName.trim().split(' ');
    const last_name = nameParts.pop();
    const first_name = nameParts.join(' ') || last_name;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email này đã được sử dụng.' });
    }

    await User.create({ first_name, last_name, email, phone, role, password });

    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công! Vui lòng đăng nhập.',
      redirectUrl: '/auth/login',
    });
  } catch (err) {
    console.error('Register error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email này đã được sử dụng.' });
    }
    return res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
  }
};

exports.postLogout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  return res.status(200).json({
    success: true,
    message: 'Đăng xuất thành công!',
  });
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }
    return res.status(200).json({
      success: true,
      data: user.toPublicJSON(),
    });
  } catch (err) {
    console.error('getMe error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mật khẩu hiện tại và mới.' });
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Mật khẩu hiện tại không đúng.' });
    }

    user.password = newPassword;
    await user.save();

    // Re-sign token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công.', token });
  } catch (err) {
    console.error('updatePassword error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng với email này.' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Since we don't have an email sender, we just return the token for testing purposes
    // In a real app we would NOT return the token directly in the response
    return res.status(200).json({ 
      success: true, 
      message: 'Email khôi phục mật khẩu đã được gửi.', 
      resetToken // include only for testing since we lack email functionality
    });
  } catch (err) {
    console.error('forgotPassword error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp token và mật khẩu mới.' });
    }

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // Re-sign token
    const jwtToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.cookie('token', jwtToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: 'Khôi phục mật khẩu thành công.',
      token: jwtToken
    });
  } catch (err) {
    console.error('resetPassword error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
  }
};
