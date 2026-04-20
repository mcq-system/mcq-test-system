var express = require('express');
var router = express.Router();


// Trang chủ hệ thống
router.get('/', function(req, res, next) {
  // Nếu có views/home/index.hbs thì render giao diện mới, nếu không thì fallback về index.hbs
  res.render('home/index', { title: 'Hệ thống Trắc Nghiệm' });
});

module.exports = router;
