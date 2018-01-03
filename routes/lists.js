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
router.get("/lists/new", function(req, res){
  res.render("lists/new");
});

// Create new list
router.post("/lists", function(req, res){
  // var list = req.body.list;
  //
  // list.items = list.items.split(",");
  // console.log(list.items);
  req.body.list.items = req.body.list.items.split(",");
  List.create(req.body.list, function(err, list){
    if (err){
      console.log(err);
    } else {
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

module.exports = router;
