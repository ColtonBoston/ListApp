var express = require("express");
var router = express.Router();
var List = require("../models/list"),
    ListItem = require("../models/listItem");
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
      res.render("lists/index", {lists: allLists});
    }
  });
});

// Open new list form
router.get("/lists/new", middleware.isLoggedIn, function(req, res){
  res.render("lists/new");
});

// Create new list
router.post("/lists", middleware.isLoggedIn, function(req, res){
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  req.body.list.author = author;
  req.body.list.permissions = req.user.friends;
  //req.body.list.permissions.push(req.user._id);
  List.create(req.body.list, function(err, list){
    if (err){
      console.log(err);
    } else {
      res.redirect("/lists/" + list._id);
    }
  });
});

// Show list (updated to populate items.addedBy field with usernames)
router.get("/lists/:id", middleware.canUserEdit, function(req, res){
  List.findById(req.params.id)
  .populate("items")
  .exec(function(err, foundList){
    if (err || !foundList){
      console.log(err);
      req.flash("error", "List not found.");
      res.redirect(404, "/lists");
    } else {
      res.render("lists/show", {list: foundList});
    }
  });
});

// Edit Route
// router.get("/lists/:id/edit", middleware.canUserEdit, function(req, res){
//     List.findById(req.params.id, function(err, foundList){
//       res.render("lists/edit", {list: foundList});
//     });
// });

// Update Route
router.put("/lists/:id", middleware.isLoggedIn, function(req, res){
  // console.log(req.body.items);
  // console.log(req.body.items[req.body.items.length - 1].addedBy);
  // if (req.user._id.equals(req.body.items[req.body.items.length - 1].addedBy))
  // {
  //   List.findByIdAndUpdate(req.params.id, {$set: {"items": req.body.items}}, function(err, updatedList){
  //     if(err){
  //       console.log(err);
  //       res.redirect("/lists");
  //     } else {
  //       // res.redirect("/lists/" + updatedList.id);
  //       res.end();
  //     }
  //   });
  // } else {
  //   console.log("Don't mess with currentUser!");
  //   res.status(404).send("Oops");
  // }

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
            console.log("Items deleted.");
          }
        });
      });
      // Remove the list from the collection
      foundList.remove();
      res.redirect("/lists");
    }
  });
});

module.exports = router;
