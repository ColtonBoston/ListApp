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
    var usernameLower = req.body.username.toLowerCase(),
        emailLower = req.body.email.toLowerCase();

    var newUser = new User({
      username: usernameLower,
      rawUsername: req.body.username,
      email: emailLower,
      rawEmail: req.body.email
    });

    User.register(newUser, req.body.password, function(err, user){
      if(err){
        req.flash("error", err.message);
        res.redirect("/");
      } else {
        console.log(user);
        // passport.authenticate("local")(req, res, function(){
        //   req.flash("success", "Welcome, " + req.body.username + "!");
        //   res.redirect("/lists");
        // });
        passport.authenticate("local",
        {
          successRedirect: "/lists",
          failureRedirect: "/",
          failureFlash: true
        })(req, res, function(){});
      }
    });
  }
});

// Check if username or email is taken
router.get("/checkUsers", function(req, res){

  if (req.query.username){
    var username = req.query.username.toLowerCase();

    // Searches the db for a user with the given username
    User.findOne({"username": username}, function(err, foundUser){
      if (!foundUser || err){
        res.send("User not found.");
      } else {
        res.send("That user exists");
      }
    });
  } else if (req.query.email){
    var email = req.query.email.toLowerCase();

    // Searches the db for a user with the given email
    User.findOne({"email": email}, function(err, foundUser){
      if (!foundUser || err){
        res.send("User not found.");
      } else {
        res.send("That user exists.");
      }
    });
  } else {
    res.status(404).send("Something was wrong.");
  }
});

// LOGIN ROUTES //
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
// END OF LOGIN ROUTES

// Regex allowing 3-20 characters from a-z, A-Z, 0-9, _, and -
function regexUsername() {
  return /^[\w\-]{3,20}$/;
}

// Escape special characters for regex
function regexEscape(str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

module.exports = router;
