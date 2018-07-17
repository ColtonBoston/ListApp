var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user"),
    List = require("../models/list");
var middleware = require("../middleware");

// User profile page
router.get("/users/profile/:id", middleware.isLoggedIn, function(req, res){
  User.findById(req.params.id)
      .populate("friends")
      .exec(function(err, foundUser){
    if (err || !foundUser){
      req.flash("User not found.");
      res.redirect("/lists");
    } else {
      foundUser.friends.sort(function(a, b){
        var friendA = a.username.toLowerCase();
        var friendB = b.username.toLowerCase();

        return (friendA < friendB) ? -1 : (friendA > friendB) ? 1 : 0;
      });

      List.find({"author.id": foundUser._id}, null, {sort: {"name": 1}}, function(err, foundLists){
        if (err){
          req.flash("Something went wrong.");
          res.redirect("/lists");
        } else if (!foundLists){
          res.render("profile", {user: foundUser, lists: [], page: "profile"});
        } else {
          res.render("profile", {user: foundUser, lists: foundLists, page: "profile"});
        }
      });
    }
  });
});

// Searches the db for usernames matching the search term -- returns JSON
router.get("/users/searchjson/:search", middleware.isLoggedIn, function(req, res){
  var search = regexEscape(req.params.search);
    User.find({"username": new RegExp(search, "i")}, null, {sort: {"username": 1}}, function(err, foundUsers){
      res.json(foundUsers);
    });
});

// Searches the db for usernames matching the search term -- returns VIEW
router.get("/users/search", middleware.isLoggedIn, function(req, res){
  var search = regexEscape(req.query.search);
  User.find({ "username": new RegExp(search, "i") }, function(err, foundUsers){
    // res.render("friendSearch");
    res.render("searchUsers", { users: foundUsers, searchQuery: search });
  });
});

// Show all friends
router.get("/friends", middleware.isLoggedIn, function(req, res){
  // finds all friends of the current user
  User
  .findById(req.user._id)
  .populate('friends')
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

      // Find all users that have added the current user as a friend
      // and removes users that are already friends of the current user.
      // This will allow the current user to see who has added him/her as a friend.
      User.find({ "friends": user._id }, function(err, foundUsers){
        if (err || !foundUsers){
          res.render("friends", { friends: user.friends, page: "friends" });
        } else {
          // Remove friends already added by the current user from the foundUsers array
          for (var i = 0; i < foundUsers.length; i++){
            for (var j = 0; j < user.friends.length; j++){
              if ( user.friends[j]._id.equals(foundUsers[i]._id) ){
                foundUsers.splice(i, 1);
                i--;
                break;
              }
            }
          }
          res.render("friends", { friends: user.friends, userFriendedBy: foundUsers, page: "friends" });
        }
      });
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
              res.redirect(404, "/friends");
            } else {
              currentUser.friends.push(req.params.id);
              // Redirects after the user is saved.
              // The callback fixes an issue where the page would refresh before the user
              // was saved and the updated data would not be reflected on the page.
              currentUser.save(function(err2, savedUser){
                //console.log(savedUser.friends);
                res.redirect("/friends");
              });
            }
          });
        }
        else {
          res.redirect("/friends");
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
          res.redirect("/friends");
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
          res.redirect("/friends");
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
