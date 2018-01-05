var express = require("express");
var router = express.Router();
var List = require("../models/list");

// List index route
router.get("/lists", function(req, res){
  List.find({}, function(err, allLists){
    if (err){
      console.log(err);
    } else {
      res.render("lists/index", {lists: allLists});
    }
  });
});

// Open new list form
router.get("/lists/new", isLoggedIn, function(req, res){
  res.render("lists/new");
});

// Create new list
router.post("/lists", isLoggedIn, function(req, res){
  // var list = req.body.list;
  //
  // list.items = list.items.split(",");
  // console.log(list.items);
  req.body.list.items = req.body.list.items.split(",");
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  req.body.list.author = author;
  req.body.list.permissions = req.user.friends;
  List.create(req.body.list, function(err, list){
    if (err){
      console.log(err);
    } else {
      console.log(list.permissions);
      res.redirect("/lists");
    }
  });
});

// Show list
router.get("/lists/:id", function(req, res){
  List.findById(req.params.id, function(err, foundList){
    if (err){
      console.log(err);
    } else {
      res.render("lists/show", {list: foundList});
    }
  });
});

// Edit Route
router.get("/lists/:id/edit", isLoggedIn, function(req, res){
  List.findById(req.params.id, function(err, foundList){
    if (err){
      console.log(err);
    } else {
      if (foundList.permissions.indexOf(req.user._id) >= 0){
        console.log("You can edit");
      } else {
        console.log("You cannot edit");
      }
      res.render("lists/edit", {list: foundList});
    }
  });
});

// Update Route
router.put("/lists/:id", isLoggedIn, function(req, res){
  var newData =
  {
    name: req.body.list.name,
    items: req.body.list.items.split(",")
  }
  List.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, updatedList){
    if(err){
      console.log(err);
    } else {
      res.redirect("/lists/" + updatedList.id);
    }
  });
});

// Destroy Route
router.delete("/lists/:id", function(req, res){
  List.findByIdAndRemove(req.params.id, function(err){
    if (err){
      res.redirect("/lists");
    } else {
      res.redirect("/lists");
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
