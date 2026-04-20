// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const exphbs = require('express-handlebars');

const app = express();
const PORT = process.env.PORT || 3000;

// ----- View engine: Handlebars -----
app.engine(
  'hbs',
  exphbs.engine({
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
    defaultLayout: 'main',
  })
);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// ----- Middleware -----
app.use(express.urlencoded({ extended: true })); // nhận dữ liệu form
app.use(express.static(path.join(__dirname, 'public')));

// Session config
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret',   // đổi chuỗi này tuỳ ý
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 60 * 60 * 1000},
  })
);

// Đưa user vào res.locals để dùng trong view (nav.hbs)
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// Routers
const authRouter = require('./routers/auth.r'); // sẽ tạo ở bước 7
app.use('/auth', authRouter);

// Trang chủ đơn giản
app.get('/', (req, res) => {
  res.render('home', { title: 'Home' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
