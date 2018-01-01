var express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose");

var app = express();

mongoose.connect("mongodb://localhost/list_app");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

var listSchema = new mongoose.Schema({
  name: String,
  owner: String,
  privacy: String,
  items: [],
  createdAt: {type: Date, default: Date.now}
});

var List = mongoose.model("List", listSchema);

// List.create({
//   name: "Groceries",
//   owner: "Colton",
//   privacy: "public",
//   items: ["bananas", "oats", "strawberries", "bacon", "lactose-free milk"]
// }, function(err, list){
//   if (err){
//     console.log(err);
//   } else {
//     console.log(list);
//   }
// });

app.get("/", function(req, res){
  res.render("landing");
});

var data = [
  {
    name: "Groceries",
    owner: "Colton",
    privacy: "public",
    items: ["bananas", "oats", "strawberries", "bacon", "lactose-free milk"]
  },
  {
    name: "To-Do",
    owner: "Colton",
    privacy: "public",
    items: ["Create List app", "Apply for jobs", "Learn guitar", "Exercise"]
  }
];

app.get("/lists", function(req, res){
  List.find({}, function(err, allLists){
    if (err){
      console.log(err);
    } else {
      res.render("index", {lists: allLists});
    }
  });
});

// New
app.get("/lists/new", function(req, res){
  res.render("new");
});

// Create
app.post("/lists", function(req, res){
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

// Show
app.get("/lists/:id", function(req, res){
  List.findById(req.params.id, function(err, foundList){
    if (err){
      console.log(err);
    } else {
      res.render("show", {list: foundList});
    }
  });
});

app.listen("3000", console.log("ListApp started..."));
