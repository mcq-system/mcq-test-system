const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware để bảo vệ route và kiểm tra quyền truy cập.
 */
const protect = (roles = []) => {
  return async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
      return res.redirect('/login');
    }

    try {
      // Xác thực token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mcq_secret_key');

      // Tìm user trong DB
      const user = await User.findById(decoded.id);
      if (!user) {
        res.clearCookie('token');
        return res.redirect('/login');
      }

      // Gán user vào req
      req.user = user;

      // Kiểm tra role nếu có yêu cầu
      const rolesArray = Array.isArray(roles) ? roles : [roles];
      if (rolesArray.length > 0 && !rolesArray.includes(user.role)) {
        return res.status(403).render('error', {
          message: 'Bạn không có quyền truy cập vào trang này.',
          error: { status: 403 }
        });
      }

      next();
    } catch (err) {
      console.error('Auth Middleware Error:', err.message);
      res.clearCookie('token');
      return res.redirect('/login');
    }
  };
};

module.exports = { protect };
