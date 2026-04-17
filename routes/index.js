var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // Thêm 'home/' vào trước 'index'
  res.render('home/index', { title: 'Hệ thống Trắc Nghiệm' });
});

module.exports = router;
