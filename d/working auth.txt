const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

// register page
router.get("/register", (req, res) => res.render("register"));

// register POST
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) { 
      req.flash("error", "Email already registered");
      return res.redirect("/register");
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      name, 
      email, 
      password: hash 
    });
    req.session.userId = user._id;
    req.session.user = { id: user._id, name: user.name };
    req.session.userRole = user.role;
    req.flash("success", "Registration successful!");
    res.redirect("/");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    res.redirect("/register");
  }
});

// login page
router.get("/login", (req, res) => res.render("login"));

// login POST
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) { 
      req.flash("error", "Invalid credentials");
      return res.redirect("/login");
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) { 
      req.flash("error", "Invalid credentials");
      return res.redirect("/login");
    }
    req.session.userId = user._id;
    req.session.user = { id: user._id, name: user.name };
    req.session.userRole = user.role;
    req.flash("success", "Welcome back!");
    res.redirect("/");
  } catch (err) {
    console.error(err);
    req.flash("error", "Server error");
    res.redirect("/login");
  }
});

// logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

module.exports = router;