require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('hbs');
var methodOverride = require('method-override');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var authRouter = require('./routes/auth');
var studentRouter = require('./routes/student');
var teacherRouter = require('./routes/teacher');
var adminRouter = require('./routes/admin');

const connectDB = require('./config/db');

connectDB();

var app = express();

// ─── Handlebars helpers ───────────────────────────────────────────────────────
hbs.registerHelper('eq', (a, b) => String(a) === String(b));
hbs.registerHelper('gt', (a, b) => a > b);
hbs.registerHelper('add', (a, b) => a + b);
hbs.registerHelper('subtract', (a, b) => a - b);
hbs.registerHelper('toString', (v) => String(v));
hbs.registerHelper('formatDate', (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
});
hbs.registerHelper('truncate', (str, len) => {
    if (!str) return '';
    return str.length > len ? str.slice(0, len) + '…' : str;
});
hbs.registerHelper('json', (v) => JSON.stringify(v || null));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRouter);
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/student', studentRouter);
app.use('/teacher', teacherRouter);
app.use('/admin', adminRouter);

app.use(function(req, res, next) {
    next(createError(404));
});
app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;