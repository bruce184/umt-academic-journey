// controllers/auth.c.js
const bcrypt = require('bcryptjs');
const userModel = require('../models/user.m');

module.exports = {
  // GET /auth/login
  showLogin(req, res) {
    res.render('auth/login', {
      layout: 'auth',
      title: 'Login',
    });
  },

  // POST /auth/login
  async login(req, res) {
    const { username, password, remember } = req.body;

    const user = await userModel.getByUsername(username);
    if (!user) {
      return res.render('auth/login', {
        layout: 'auth',
        title: 'Login',
        error: 'Sai username hoặc password',
      });
    }

    const ok = bcrypt.compareSync(password, user.password);
    if (!ok) {
      return res.render('auth/login', {
        layout: 'auth',
        title: 'Login',
        error: 'Sai username hoặc password',
      });
    }

    // Lưu vào session
    req.session.user = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
    };

    // Ghi nhớ đăng nhập
    if (remember) {
      // 7 ngày
      req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000;
    } else {
      // Session cookie (hết khi đóng browser)
      req.session.cookie.expires = false;
    }

    res.render('auth/loginSuccess', {
      layout: 'auth',
      title: 'Login success',
      user: req.session.user,
    });
  },

  // GET /auth/register
  showRegister(req, res) {
    res.render('auth/register', {
      layout: 'auth',
      title: 'Register',
    });
  },

  // POST /auth/register
  async register(req, res) {
    const { username, name, email, password } = req.body;

    const existed = await userModel.getByUsername(username);
    if (existed) {
      return res.render('auth/register', {
        layout: 'auth',
        title: 'Register',
        error: 'Username đã tồn tại',
      });
    }

    const hash = bcrypt.hashSync(password, 10);

    await userModel.add({
      username,
      name,
      email,
      password: hash,
    });

    res.redirect('/auth/login');
  },

  // GET /auth/logout
  logout(req, res) {
    req.session.destroy((err) => {
      if (err) console.error(err);
      res.redirect('/auth/login');
    });
  },
};
