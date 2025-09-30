const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const session = require('express-session');

// Register page
router.get('/register', (req, res) => {
  res.render('register');
});

// Handle register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashed });
    await user.save();

    req.flash('success', 'Registration successful, please login');
    res.redirect('/user/login');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Registration failed');
    res.redirect('/user/register');
  }
});

// Login page
router.get('/login', (req, res) => {
  res.render('login');
});

// Handle login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/user/login');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      req.flash('error', 'Invalid password');
      return res.redirect('/user/login');
    }

    req.session.userId = user._id;
    req.flash('success', 'Logged in successfully');
    res.redirect('/');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Login failed');
    res.redirect('/user/login');
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
