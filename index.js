    require('dotenv').config({ path: './.env' });
    const express = require('express');
    const mongoose = require('mongoose');
    const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const Product = require('./models/Product');
const authRoutes = require('./routes/auth');

const app = express();    // Middleware
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(express.static('public')); // <-- serve static files
    app.set('view engine', 'ejs');

    // Session middleware
    app.use(session({
        secret: process.env.SESSION_SECRET || 'keyboardcat',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
        cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
    }));

// Flash messages
app.use(flash());

// Make user data, session, and flash messages available in views
app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    res.locals.session = req.session;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});    // Database connection
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log("MongoDB connected"))
        .catch(err => console.log(err));

    // Routes
    app.use('/', authRoutes); // Add auth routes
    app.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.render('index', { 
            products,
            currentUser: req.session.user || null,
            session: req.session
        });
    } catch (err) {
        console.error(err);
        res.send('Error loading products');
    }
    });



    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
    });
