const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect('admin'), (req, res) => {
  res.render('admin/dashboard', {
    user: req.user,
    title: 'Admin Dashboard'
  });
});

module.exports = router;
