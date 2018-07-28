var express = require("express"),
    router = express.Router(),
    passport = require("passport"),
    List = require("../models/list"),
    ListItem = require("../models/listItem"),
    middleware = require("../middleware");

// Save new list item
router.post("/lists/:id/listItems", middleware.checkListPermissions, function(req, res){
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
          item.addedBy.username = req.user.rawUsername;
          item.save();
          foundList.items.push(item._id);
          foundList.save(function(err, savedList){
            res.req.headers["Cache-Control"] = "max-age=0, no-cache, must-revalidate, proxy-revalidate";
            res.redirect("/lists/" + req.params.id);
          });
        }
      });
    }
  });
});

// Update list item
router.put("/lists/:id/listItems/:item_id", middleware.checkListPermissions, function(req, res){
  if (req.body.item){
    ListItem.findByIdAndUpdate(req.params.item_id, {$set: {"name": req.body.item}}, function(err, updatedItem){
      if (err || !updatedItem){
        res.redirect(404, "/lists/" + req.params.id);
      } else {
        res.redirect("/lists/" + req.params.id + "/edit");
      }
    });
  } else if (req.body.isCompleted){
    ListItem.findById(req.params.item_id, function(err, foundItem){
      if (err || !foundItem){
        res.redirect(404, "/lists/" + req.params.id);
      } else {
        if (foundItem.isCompleted !== req.body.isCompleted){
          foundItem.isCompleted = req.body.isCompleted;
          foundItem.save(function(){
            res.redirect("/lists/" + req.params.id);
          });
        } else {
          res.redirect("/lists/" + req.params.id);
        }
      }
    });
  }

});

// Delete list item
router.delete("/lists/:id/listItems/:item_id", middleware.checkListItemOwnership, function(req, res){
    ListItem.findByIdAndRemove(req.params.item_id, function(err){
      if (err){
        console.log(err);
        res.redirect(404, "/lists/" + req.params.id);
      } else {
        List.findByIdAndUpdate(req.params.id, {$pull: {"items": req.params.item_id}}, function(err, foundList){
          if (err || !foundList){
            console.log(err);
            res.redirect(403, "/lists/" + req.params.id);
          } else {
            res.redirect("/lists/" + req.params.id + "/edit");
          }
        });
      }
    });
});

module.exports = router;
