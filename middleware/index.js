var List = require("../models/list"),
    ListItem = require("../models/listItem");

var middlewareObj = {};

// Checks if the user is logged in
middlewareObj.isLoggedIn = function(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  req.flash("error", "Please login first.");
  res.redirect("/login");
}

middlewareObj.checkListPermissions = function(req, res, next){
  if(req.isAuthenticated()){
    List.findById(req.params.id, function(err, foundList){
      if (err || !foundList){
        req.flash("error", "List not found.");
        res.redirect(404, "/lists");
      } else {
        if (foundList.author.id.equals(req.user._id) || foundList.permissions.indexOf(req.user._id) >= 0){
          next();
        } else {
          req.flash("error", "You do not have permission to use that list.");
          res.redirect(401, "/lists");
        }
      }
    });
  } else {
    req.flash("error", "Please login first.");
    res.redirect(401, "/login");
  }
}

// Check if the user has permission to edit a list
middlewareObj.canUserEdit = function(req, res, next){
  if(req.isAuthenticated()){
    List.findById(req.params.id, function(err, foundList){
      if (err || !foundList){
        req.flash("error", "List not found.");
        res.redirect("/lists");
      } else {
        if (foundList.author.id.equals(req.user._id) || foundList.permissions.indexOf(req.user._id) >= 0){
          next();
        } else {
          req.flash("error", "You do not have permission to edit that list");
          res.redirect("/lists");
        }
      }
    });
  } else {
    req.flash("error", "Please login first.");
    res.redirect("/login");
  }
}

middlewareObj.checkListOwnership = function(req, res, next){
  if(req.isAuthenticated()){
    List.findById(req.params.id, function(err, foundList){
      if (err || !foundList){
        req.flash("error", "List not found.");
        res.redirect("/lists");
      } else {
        if (foundList.author.id.equals(req.user._id)){
          next();
        } else {
          req.flash("error", "You do not own that list.");
          res.redirect("/lists");
        }
      }
    });
  } else {
    req.flash("error", "Please login first.");
    res.redirect("/login");
  }
}

middlewareObj.checkListItemOwnership = function(req, res, next){
  if (req.isAuthenticated()){
    List.findById(req.params.id, function(err, foundList){
      if (err || !foundList){
        res.redirect("/lists");
      } else {
        ListItem.findById(req.params.item_id, function(err, foundListItem){
          if (err || !foundListItem){
            res.redirect("/lists/" + req.params.id);
          } else {
            if (foundList.author.id.equals(req.user._id) || foundListItem.addedBy.id.equals(req.user._id)){
              next();
            } else {
              res.redirect(403, "/lists/" + req.params.id);
            }
          }
        });
      }
    });

  } else {
    req.flash("error", "Please login.");
    res.redirect("/login")
  }
}

// Middleware to convert username input to lowercase before attempt to log in
middlewareObj.usernameToLowercase = function(req, res, next){
  req.body.username = req.body.username.toLowerCase();
  next();
}

module.exports = middlewareObj;
