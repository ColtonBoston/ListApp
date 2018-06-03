var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user"),
    middleware = require("../middleware");

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
  if (req.body.username.includes(" ") || !regexUsername().test(req.body.username)){
    req.flash("error", "Invalid username.");
    res.redirect("/");
  } else {
    var usernameLower = req.body.username.toLowerCase();

    var newUser = new User({
      username: usernameLower,
      rawUsername: req.body.username,
      email: req.body.email,
      rawEmail: req.body.email
    });

    User.register(newUser, req.body.password, function(err, user){
      if(err){
        req.flash("error", err.message);
        res.redirect("/");
      } else {
        passport.authenticate("local")(req, res, function(){
          req.flash("success", "Welcome, " + req.body.username + "!");
          res.redirect("/lists");
        });
      }
    });
  }
});

// Check if username or email is taken
router.get("/checkUsers", function(req, res){
  var username = req.query.username.toLowerCase();

  if (username.indexOf("@") === -1){
    User.findOne({"username": username}, function(err, foundUser){
      if (!foundUser || err){
        console.log(err);
        res.send("User not found.");
      } else {
        console.log(foundUser);
        res.send("That user exists");
      }
    });
  } else {
    res.send("email");
  }
  // User.find({$or: [{"username": req.body.username}, {"email": req.body.email}]}, function(err, foundUser){
  //   if (err){
  //     console.log(err);
  //   } else {
  //     console.log(foundUser);
  //   }
  // });
});

// Login Routes //
// Open login form
router.get("/login", function(req, res){
  res.render("login", {page: "login"});
});

// Login logic
router.post("/login", middleware.usernameToLowercase, passport.authenticate("local",
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

// Regex allowing 3-20 characters from a-z, A-Z, 0-9, _, and -
function regexUsername() {
  return /^[\w\-]{3,20}$/;
}

// Escape special characters for regex
function regexEscape(str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

module.exports = router;
