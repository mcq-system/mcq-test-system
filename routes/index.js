var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Chào mừng đến với English MCQ',
    layout: false
  });
});

module.exports = router;
