var List = require("../models/list");

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
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "Please login first.");
    res.redirect("/login");
  }
}

module.exports = middlewareObj;
