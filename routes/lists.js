var express = require("express");
var router = express.Router();
var List = require("../models/list"),
    ListItem = require("../models/listItem"),
    User = require("../models/user");
var middleware = require("../middleware");

// List index route
router.get("/lists", middleware.isLoggedIn, function(req, res){
  List.find({$or: [{"permissions": req.user._id}, {"author.id": req.user._id}]}, function(err, allLists){
    if (err){
      console.log(err);
    } else {
      var myLists = [], friendLists = [];
      allLists.forEach(function(list){
        if (list.author.id.equals(req.user._id)){
          myLists.push(list);
        } else {
          friendLists.push(list);
        }
      });
      allLists = myLists.concat(friendLists);
      res.render("lists/index", {lists: allLists, page: "lists"});
    }
  });
});

// Open new list form
router.get("/lists/new", middleware.isLoggedIn, function(req, res){
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
      res.render("lists/new", {friends: user.friends, page: "new"});
      // res.render("users", {users: user.friends, page: "users"});
    }
  });
});

// Create new list
router.post("/lists", middleware.isLoggedIn, function(req, res){
  var author = {
    id: req.user._id,
    username: req.user.rawUsername
  };
  req.body.list.author = author;
  req.body.list.permissions = req.body.permissions;
  //req.body.list.permissions.push(req.user._id);
  List.create(req.body.list, function(err, list){
    if (err){
      console.log(err);
    } else {
      res.redirect("/lists/" + list._id);
    }
  });
});

// Show list
router.get("/lists/:id", middleware.canUserEdit, function(req, res){
  List.findById(req.params.id)
  .populate("items")
  .populate("permissions")
  .exec(function(err, foundList){
    if (err || !foundList){
      console.log(err);
      req.flash("error", "List not found.");
      res.redirect(404, "/lists");
    } else {
      User.findById(req.user._id)
      .populate("friends")
      .exec(function(err, foundUser){
        if (err || !foundUser){
          console.log(err);
          req.flash("error", "User not found.");
          res.redirect(404, "/lists");
        } else {
          var friends = foundUser.friends;

          // Removes permitted friends from the friends array since they are already in the permissions array
          foundList.permissions.forEach(function(permittedFriend){
            friends.forEach(function(friend, i){
              if (permittedFriend._id.equals(friend._id)){
                friends.splice(i, 1);
              }
            });
          });

          // Sorts the user's friends alphabetically
          friends = foundUser.friends.sort(function(a, b){
            var friendA = a.username.toUpperCase();
            var friendB = b.username.toUpperCase();
            return (friendA < friendB) ? -1 : (friendA > friendB) ? 1 : 0;
          });

          // Sorts the list's permissions alphabetically
          foundList.permissions.sort(function(a, b){
            var friendA = a.username.toUpperCase();
            var friendB = b.username.toUpperCase();
            return (friendA < friendB) ? -1 : (friendA > friendB) ? 1 : 0;
          });
          res.req.headers["Cache-Control"] = "max-age=0, no-cache, must-revalidate, proxy-revalidate";
          res.render("lists/show", {list: foundList, friends: friends, page: "show"});
        }
      });
    }
  });
});

// Edit Route
router.get("/lists/:id/edit", middleware.canUserEdit, function(req, res){
  List.findById(req.params.id)
  .populate("items")
  .populate("permissions")
  .exec(function(err, foundList){
    if (err || !foundList){
      console.log(err);
      req.flash("error", "List not found.");
      res.redirect(404, "/lists");
    } else {
      User.findById(req.user._id)
      .populate("friends")
      .exec(function(err, foundUser){
        if (err || !foundUser){
          console.log(err);
          req.flash("error", "User not found.");
          res.redirect(404, "/lists");
        } else {
          // Removes permitted friends from the friends array since they are already in the permissions array
          var friends = foundUser.friends;
          foundList.permissions.forEach(function(permittedFriend){
            friends.forEach(function(friend, i){
              if (permittedFriend._id.equals(friend._id)){
                friends.splice(i, 1);
              }
            });
          });

          // Sorts the user's friends alphabetically
          var friends = foundUser.friends.sort(function(a, b){
            var friendA = a.username.toUpperCase();
            var friendB = b.username.toUpperCase();
            return (friendA < friendB) ? -1 : (friendA > friendB) ? 1 : 0;
          });

          // Sorts the list's permissions alphabetically
          foundList.permissions.sort(function(a, b){
            var friendA = a.username.toUpperCase();
            var friendB = b.username.toUpperCase();
            return (friendA < friendB) ? -1 : (friendA > friendB) ? 1 : 0;
          });

          res.render("lists/edit", {list: foundList, friends: friends, page: "edit"});
        }
      });
    }
  });
});

// Update Route
router.put("/lists/:id", middleware.checkListOwnership, function(req, res){
  List.findByIdAndUpdate(req.params.id, {$set: {"name": req.body.name}}, function(err, updatedList){
    if (err || !updatedList){
      console.log(err);
      res.redirect("/lists");
    } else {
      res.redirect("/lists/" + req.params.id + "/edit");
    }
  });
});

// Destroy Route
router.delete("/lists/:id", middleware.checkListOwnership, function(req, res){
  // Find the list to delete
  List.findById(req.params.id, function(err, foundList){
    if (err){
      res.redirect("/lists");
    } else {
      // Loop through each list item inside the list
      foundList.items.forEach(function(item){
        // Delete each list item from the ListItem collection
        ListItem.findByIdAndRemove(item, function(err){
          if (err){
            console.log(err);
          } else {
            // Items succesfully deleted
          }
        });
      });
      // Remove the list from the collection
      foundList.remove();
      req.flash("success", "List deleted!");
      res.redirect("/lists");
    }
  });
});

// List permission routes
// Add friend to permissions
router.put("/lists/:id/addPermission/:friend_id", middleware.checkListOwnership, function(req, res){
  List.findById(req.params.id, function(err, foundList){
    if (err || !foundList){
      req.flash("List not found.");
      res.redirect(404, "/lists");
    } else {
      // Adds user to the list's permissions if they are not already permitted and they are a friend of the current user
      if (foundList.permissions.indexOf(req.params.friend_id) < 0 && req.user.friends.indexOf(req.params.friend_id) >= 0){
        foundList.permissions.push(req.params.friend_id);
        foundList.save(function(){
          res.redirect("/lists/" + req.params.id);
        });
      } else {
        res.redirect(404, "/lists/" + req.params.id);
      }
    }
  });
});

// Remove friend from permissions
router.put("/lists/:id/removePermission/:friend_id", middleware.checkListOwnership, function(req, res){
  List.findByIdAndUpdate(req.params.id, {$pull: {"permissions": req.params.friend_id}}, function(err, updatedList){
    if (err || !updatedList){
      req.flash("List not found.");
      res.redirect(404, "/lists");
    } else {
      res.redirect("/lists/" + req.params.id + "/edit");
    }
  });
});
module.exports = router;
