require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
const { engine } = require('express-handlebars');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var studentRouter = require('./routes/student');
var teacherRouter = require('./routes/teacher');
var adminRouter = require('./routes/admin');
var authRouter = require('./routes/auth');
var questionsRouter = require('./routes/questions');
var dropdragRouter = require('./routes/dropdrag');

const connectDB = require('./config/db');

connectDB();

var app = express();

app.engine(
    'hbs',
    engine({
      extname: '.hbs',
      defaultLayout: false,
      layoutsDir: path.join(__dirname, 'views', 'layouts'),
      partialsDir: path.join(__dirname, 'views', 'partials'),
      helpers: {
        eq: function (a, b) {
          return a === b;
        },
        slice: function (str, start, end) {
          return str ? str.slice(start, end) : "";
        }
      }
    })
);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/student', studentRouter);
app.use('/teacher', teacherRouter);
app.use('/admin', adminRouter);
app.use('/questions', questionsRouter);
app.use('/dropdrag', dropdragRouter);


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
