const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { engine } = require('express-handlebars');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');

const app = express();

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
app.use('/admin', adminRouter);

// BẮT LỖI 404 (Nếu không khớp route nào ở trên)
app.use(function(req, res, next) {
  var createError = require('http-errors');
  next(createError(404));
});

// XỬ LÝ LỖI (ERROR HANDLER)
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error', { layout: false });
});

module.exports = app;
