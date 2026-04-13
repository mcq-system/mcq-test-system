
var express = require('express');
var router = express.Router();
const User = require('../models/User');


// GET /api/users
router.get('/', async function(req, res, next) {
  try {
    const users = await User.find();
    // Sử dụng toPublicJSON để loại bỏ password
    const publicUsers = users.map(u => u.toPublicJSON());
    res.json(publicUsers);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
