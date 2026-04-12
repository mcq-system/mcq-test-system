const jwt = require('jsonwebtoken');

/**
 * Middleware to protect routes and verify user roles.
 * @param {string|string[]} roles - Single role or array of roles allowed to access the route.
 */
const protect = (roles = []) => {
  return (req, res, next) => {
    // 1. Get token from cookies
    const token = req.cookies.token;

    if (!token) {
      // If no token, redirect to login
      return res.redirect('/login');
    }

    try {
      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mcq_secret_key');
      
      // Attach user info to request
      req.user = decoded;

      // 3. Check roles if any are specified
      if (roles.length > 0) {
        const rolesArray = Array.isArray(roles) ? roles : [roles];
        if (!rolesArray.includes(decoded.role)) {
          return res.status(403).render('error', { 
            message: 'Bạn không có quyền truy cập vào trang này.',
            error: { status: 403 }
          });
        }
      }

      next();
    } catch (err) {
      console.error('Auth Middleware Error:', err.message);
      // If token is invalid or expired, clear cookie and redirect
      res.clearCookie('token');
      return res.redirect('/login');
    }
  };
};

module.exports = { protect };
