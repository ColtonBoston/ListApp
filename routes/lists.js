var express = require("express");
var router = express.Router();
var List = require("../models/list");

// List index route
router.get("/lists", isLoggedIn, function(req, res){
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
router.get("/lists/new", isLoggedIn, function(req, res){
  res.render("lists/new");
});

// Create new list
router.post("/lists", isLoggedIn, function(req, res){
  // var list = req.body.list;
  //
  // list.items = list.items.split(",");
  // console.log(list.items);
  //req.body.list.items = req.body.list.items.split(",");
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
      console.log(list.permissions);
      res.redirect("/lists/" + list._id);
    }
  });
});

// Show list
// router.get("/lists/:id", canUserEdit, function(req, res){
//   List.findById(req.params.id, function(err, foundList){
//     if (err){
//       console.log(err);
//     } else {
//       res.render("lists/show", {list: foundList});
//     }
//   });
// });

// Show list (updated to populate items.addedBy field with usernames)
router.get("/lists/:id", canUserEdit, function(req, res){
  List.findById(req.params.id)
  .populate("items.addedBy")
  .exec(function(err, foundList){
    if (err){
      console.log(err);
    } else {
      res.render("lists/show", {list: foundList});
    }
  });
});

// Edit Route
router.get("/lists/:id/edit", canUserEdit, function(req, res){
    List.findById(req.params.id, function(err, foundList){
      res.render("lists/edit", {list: foundList});
    });
});

// Update Route
router.put("/lists/:id", isLoggedIn, function(req, res){
  List.findByIdAndUpdate(req.params.id, {$set: {"items": req.body.items}}, function(err, updatedList){
    if(err){
      console.log(err);
    } else {
      // res.redirect("/lists/" + updatedList.id);
      res.end();
    }
  });
});

// Destroy Route
router.delete("/lists/:id", checkListOwnership, function(req, res){
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

// Check if the user has permission to edit a list
function canUserEdit(req, res, next){
  if(req.isAuthenticated()){
    List.findById(req.params.id, function(err, foundList){
      if (err){
        res.redirect("back");
      } else {
        if (foundList.author.id.equals(req.user._id) || foundList.permissions.indexOf(req.user._id) >= 0){
          next();
        } else {
          res.redirect("/lists");
        }
      }
    });
  } else {
    res.redirect("/login");
  }
}

function checkListOwnership(req, res, next){
  if(req.isAuthenticated()){
    List.findById(req.params.id, function(err, foundList){
      if (err){
        res.redirect("back");
      } else {
        if (foundList.author.id.equals(req.user._id)){
          next();
        } else {
          res.redirect("back");
        }
      }
    });
  } else {
    res.redirect("/login");
  }
}

module.exports = router;
