const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');

const questionsRouter = require('./routes/questions');

const app = express();
const PORT = process.env.PORT || 3000;

// Handlebars setup
app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: {
    eq: (a, b) => a === b,
    typeBadgeClass: (type) => {
      const map = { reading: 'badge-reading', listening: 'badge-listening', grammar: 'badge-grammar', vocab: 'badge-vocab' };
      return map[type] || '';
    },
    typeLabel: (type) => {
      const map = { reading: 'Reading', listening: 'Listening', grammar: 'Grammar', vocab: 'Vocab' };
      return map[type] || type;
    }
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', questionsRouter);

app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});
