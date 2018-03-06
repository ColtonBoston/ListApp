var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

// Landing Page
router.get("/", function(req, res){
  if (req.isAuthenticated()){
    res.redirect("/lists");
  } else {
    res.render("landing")
  }
});

// AUTH ROUTES //
// Open register form
router.get("/register", function(req, res){
  res.render("register", {page: "register"});
});

// Sign up logic
router.post("/register", function(req, res){
  var newUser = new User({username: req.body.username});
  console.log(req.body.username.includes(" "));
  if (req.body.username.includes(" ")){
    req.flash("error", "Username cannot include spaces.");
    res.redirect("/register");
  } else {
    User.register(newUser, req.body.password, function(err, user){
      if(err){
        req.flash("error", err.message);
        return res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function(){
          req.flash("success", "Welcome, " + req.body.username + "!");
          res.redirect("/lists");
        });
      }
    });
  }
});

// Login Routes //
// Open login form
router.get("/login", function(req, res){
  res.render("login", {page: "login"});
});

// Login logic
router.post("/login", passport.authenticate("local",
{
  successRedirect: "/lists",
  failureRedirect: "/login",
  failureFlash: true
}), function(req, res){
});

// Logout
router.get("/logout", function(req, res){
  req.logout();
  req.flash("success", "You have successfully been logged out.");
  res.redirect("/");
});

module.exports = router;
