require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('MongoDB connected'))
  .catch(err => console.error('Mongo connect error', err));

  // ...existing code...
// Basic middleware setup
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  next();
});

// View engine + static
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(flash());

// Sessions (store sessions in Mongo)
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboardcat',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Make session + flash available in views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.session = req.session;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const checkoutRoutes = require('./routes/checkout');
const cartRoutes = require('./routes/cart');

// Debug route to test Express
app.get('/debug', (req, res) => {
    res.json({
        session: req.session,
        cart: req.session.cart,
        user: req.session.user
    });
});

// Route middleware - order matters!
app.use('/cart', cartRoutes);        // Cart routes first
app.use('/checkout', checkoutRoutes); // Then checkout
app.use('/admin', adminRoutes);       // Then admin
app.use('/', authRoutes);             // Then auth
app.use('/', userRoutes);             // Then user routes

// Test route to verify Express is working
app.get('/test', (req, res) => {
  res.send('Test route works!');
});

// 404 handler for undefined routes
app.use((req, res, next) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).send('Page not found');
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, ()=> console.log(`Server running on http://localhost:${PORT}`));

