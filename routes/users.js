var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

// Show all users
router.get("/users", isLoggedIn, function(req, res){
  User.find({}, function(err, foundUsers){
    if(err){
      console.log(err);
      res.redirect("/lists");
    } else {
      res.render("users", {users: foundUsers});
    }
  });
});

// Add friend route
router.post("/addFriend/:id", function(req, res){
  if (req.user._id.toString() !== req.params.id && req.user.friends.indexOf(req.params.id) < 0){
    User.findById(req.user._id, function(err, currentUser){
      if (err){
        console.log(err);
        res.redirect("/users");
      } else {
        currentUser.friends.push(req.params.id);

        // Redirects after the user is saved.
        // The callback fixes an issue where the page would refresh before the user
        // was saved and the updated data would not be reflected on the page.
        currentUser.save(function(err2, savedUser){
          //console.log(savedUser.friends);
          res.redirect("/users");
        });
      }
    });
  }
  else {
    res.send("that friend exists already");
  }
});

// Remove friend route
router.post("/removeFriend/:id", function(req, res){
  User.findByIdAndUpdate(req.user._id, {$pull: {friends: req.params.id}}, {new: true}, function(err, foundUser){
    if (err){
      console.log(err);
      res.redirect("/users");
    } else {
      res.redirect("/users");
    }
  });

});

// Checks if the user is logged in
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
}

module.exports = router;
