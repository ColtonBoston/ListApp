var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user"),
    List = require("../models/list");
var middleware = require("../middleware");

// Searches the db for usernames matching the search term -- returns JSON
router.get("/users/searchjson/:search", middleware.isLoggedIn, function(req, res){
  var search = regexEscape(req.params.search);
    User.find({"username": new RegExp(search, "i")}, function(err, foundUsers){
      res.json(foundUsers);
    });
});

// Searches the db for usernames matching the search term -- returns VIEW
router.get("/users/search", middleware.isLoggedIn, function(req, res){
  var search = regexEscape(req.query.search);
  User.find({"username": new RegExp(search, "i")}, function(err, foundUsers){
    // res.render("friendSearch");
    res.render("searchUsers", {users: foundUsers, searchQuery: search});
  });
});

// Show all friends
router.get("/users", middleware.isLoggedIn, function(req, res){
  // finds all friends of the current user
  User
  .findById(req.user._id)
  .populate('friends') // <--
  .exec(function (err, user) {
    if (err){
      console.log(err);
      res.redirect("/lists");
    } else {
      // Sort friends by alphabetical order
      user.friends.sort(function(a, b){
        var friendA = a.username.toUpperCase();
        var friendB = b.username.toUpperCase();
        return (friendA < friendB) ? -1 : (friendA > friendB) ? 1 : 0;
      });
        res.render("users", {users: user.friends, page: "users"});
    }
  });

  // finds all signed up users
  // will move this to a search bar with dropdown in the nav
  // User.find({}, function(err, foundUsers){
  //   if(err){
  //     console.log(err);
  //     res.redirect("/lists");
  //   } else {
  //     res.render("users", {users: foundUsers});
  //   }
  // });
});

// Add friend route
router.post("/addFriend/:id", middleware.isLoggedIn, function(req, res){
  // Check if the user to add exists
  User.findById(req.params.id, function(err, foundUser){
      if (err || !foundUser){
        res.redirect(404, "/lists");
      } else {
        // Logic to add friend
        if (req.user._id.toString() !== req.params.id && req.user.friends.indexOf(req.params.id) < 0){
          User.findById(req.user._id, function(err, currentUser){
            if (err || !currentUser){
              console.log(err);
              res.redirect(404, "/users");
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
      }
  });
});

// Remove friend route
router.post("/removeFriend/:id", middleware.isLoggedIn, function(req, res){
  // Check if the friend to delete exists
  User.findById(req.params.id, function(err, foundUser){
    if (err || !foundUser){
      res.redirect(404, "/lists");
    } else {
      // Remove friend from user.friends array
      User.findByIdAndUpdate(req.user._id, {$pull: {friends: req.params.id}}, {new: true}, function(err, currentUser){
        if (err){
          console.log(err);
          res.redirect("/users");
        } else {
          List.find({"author.id": req.user._id}, function(err, foundLists){
            foundLists.forEach(function(list){
              // Removes all instances of a friend from all of the user's lists' permissions (fixed a bug where a friend was added multiple times)
              list.permissions = list.permissions.filter(function(friend){
                return !friend.equals(req.params.id);
              });
              list.save();
            });
          });
          res.redirect("/users");
        }
      });
    }
  });
});

// Escape special characters for regex
function regexEscape(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

module.exports = router;
