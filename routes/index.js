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
  res.render("register");
});

// Sign up logic
router.post("/register", function(req, res){
  var newUser = new User({username: req.body.username});
  console.log(req.body.username.includes(" "));
  if (req.body.username.includes(" ")){
    res.redirect("/register");
  } else {
    User.register(newUser, req.body.password, function(err, user){
      if(err){
        console.log(err);
        return res.render("register");
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect("/lists");
        });
      }
    });
  }
});

// Login Routes //
// Open login form
router.get("/login", function(req, res){
  res.render("login");
});

// Login logic
router.post("/login", passport.authenticate("local",
{
  successRedirect: "/lists",
  failureRedirect: "/login"
}), function(req, res){
});

// Logout
router.get("/logout", function(req, res){
  req.logout();
  res.redirect("/lists");
});

module.exports = router;
