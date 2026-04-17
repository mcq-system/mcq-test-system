require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path'); // Chỉ khai báo path 1 lần duy nhất ở đây
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { engine } = require('express-handlebars');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin'); // Import router admin

var app = express();

// CẤU HÌNH HANDLEBARS (HBS)
app.engine('hbs', engine({
  extname: 'hbs',
  defaultLayout: 'layout-admin',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ĐỊNH TUYẾN (ROUTES)
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter); // Route admin phải nằm TRƯỚC error handler

// BẮT LỖI 404 (Nếu không khớp route nào ở trên)
app.use(function(req, res, next) {
  next(createError(404));
});

// XỬ LÝ LỖI (ERROR HANDLER)
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error', { layout: false }); // Không dùng layout admin cho trang lỗi
});

module.exports = app;
module.exports = app;
