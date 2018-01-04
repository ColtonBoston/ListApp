var express = require("express");
var mongoose = require("mongoose");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

// Show all users
router.get("/users", isLoggedIn, function(req, res){
  User.find({}, function(err, foundUsers){
    if(err){
      console.log(err);
    } else {
      res.render("users", {users: foundUsers});
    }
  });
});

router.post("/addFriend/:username/:id", function(req, res){
  console.log(req.user);
  console.log(req.user.friends);
  var friend = {
    id: mongoose.Types.ObjectId(req.params.id),
    username: req.params.username
  };
  console.log(req.user.friends.indexOf(friend.id));
  if (req.user._id.toString() !== req.params.id && req.user.friends.indexOf(friend.id) < 0){
    User.findById(req.user._id, function(err, currentUser){
      if (err){
        console.log(err);
      } else {
        currentUser.friends.push(friend.id);

        // Redirects after the user is saved.
        // The callback fixes an issue where the page would refresh before the user
        // was saved and the updated data would not be reflected on the page.
        currentUser.save(function(err2, savedUser){
          res.redirect("/users");
        });
        // res.redirect("/users");
      }
    });
  }
  else {
    res.send("that friend exists already");
  }
});

// Checks if the user is logged in
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
}

module.exports = router;
