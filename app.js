var express = require("express"),
    bodyParser = require("body-parser");

var app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

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
  res.render("lists", {lists: data});
});

// New
app.get("/lists/new", function(req, res){
  res.render("new");
});

app.post("/lists", function(req, res){
  var list = req.body.list;

  list.items = list.items.split(",");
  console.log(list.items);
  data.push(req.body.list);
  res.redirect("/lists");
});

app.listen("3000", console.log("ListApp started..."));
