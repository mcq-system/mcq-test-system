var express = require('express');
var router = express.Router();

/* GET home page. */
<<<<<<< HEAD
router.get('/', function(req, res, next) {
  // Thêm 'home/' vào trước 'index'
  res.render('home/index', { title: 'Hệ thống Trắc Nghiệm' });
=======
router.get('/', function(req, res, next) {
  // Thêm 'home/' vào trước 'index'
  res.render('home/index', { title: 'Hệ thống Trắc Nghiệm' });
>>>>>>> d9f99efa55465185aebb3b76f110bb2f8d8d3f9e
});

module.exports = router;
