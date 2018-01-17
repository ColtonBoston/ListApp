var express = require("express"),
    router = express.Router(),
    passport = require("passport"),
    List = require("../models/list"),
    ListItem = require("../models/listItem");

// Save new list item
router.post("/lists/:id/listItems", checkListPermissions, function(req, res){
  List.findById(req.params.id)
    .exec(function(err, foundList){
    if (err){
      console.log(err);
      res.redirect("/lists");
    } else {
      ListItem.create(req.body.item, function(err, item){
        if (err){
          res.redirect("/lists/" + req.params.id);
        } else {
          item.addedBy.id = req.user._id;
          item.addedBy.username = req.user.username;
          item.save();
          foundList.items.push(item._id);
          foundList.save();
          res.redirect("/lists/" + req.params.id);
        }
      });
    }
  });
});

// Update list item
router.put("/lists/:id/listItems/:item_id", checkListPermissions, function(req, res){
  ListItem.findByIdAndUpdate(req.params.item_id, {$set: {"name": req.body.item}}, function(err, updatedItem){
    if (err){
      res.redirect("back");
    } else {
      res.redirect("/lists/" + req.params.id);
    }
  });
});

// Delete list item
router.delete("/lists/:id/listItems/:item_id", checkListPermissions, function(req, res){
    ListItem.findByIdAndRemove(req.params.item_id, function(err){
      if (err){
        console.log(err);
      } else {
        List.findByIdAndUpdate(req.params.id, {$pull: {"items": req.params.item_id}}, function(err, foundList){
          if (err){
            console.log(err);
          } else {
            res.redirect("/lists/" + req.params.id);
          }
        });
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

function checkListPermissions(req, res, next){
  if(req.isAuthenticated()){
    List.findById(req.params.id, function(err, foundList){
      if (err || !foundList){
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

module.exports = router;
