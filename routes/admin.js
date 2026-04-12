const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// @route   GET /admin/dashboard
// @desc    Display admin dashboard
// @access  Private (Admin)
router.get('/dashboard', protect('admin'), (req, res) => {
  res.render('admin/dashboard', {
    user: req.user,
    title: 'Admin Dashboard'
  });
});

module.exports = router;
