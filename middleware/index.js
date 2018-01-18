var List = require("../models/list");

var middlewareObj = {};

// Checks if the user is logged in
middlewareObj.isLoggedIn = function(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
}

middlewareObj.checkListPermissions = function(req, res, next){
  if(req.isAuthenticated()){
    List.findById(req.params.id, function(err, foundList){
      if (err || !foundList){
        res.redirect(404, "back");
      } else {
        if (foundList.author.id.equals(req.user._id) || foundList.permissions.indexOf(req.user._id) >= 0){
          next();
        } else {
          res.redirect(401, "/lists");
        }
      }
    });
  } else {
    res.redirect(401, "/login");
  }
}

// Check if the user has permission to edit a list
middlewareObj.canUserEdit = function(req, res, next){
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

middlewareObj.checkListOwnership = function(req, res, next){
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

module.exports = middlewareObj;
