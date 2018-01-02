var express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    User = require("./models/user"),
    List = require("./models/list");

var app = express();

mongoose.connect("mongodb://localhost/list_app");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

// PASSPORT CONFIG
app.use(require("express-session")({
  secret: "Zoe is a dog",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())


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

// AUTH ROUTES
app.get("/register", function(req, res){
  res.render("register");
});

// Sign up logic
app.post("/register", function(req, res){
  var newUser = new User({username: req.body.username});
  User.register(newUser, req.body.password, function(err, user){
    if(err){
      console.log(err);
      return res.render("register");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/lists");
      });
    }
  });
});

// Login Routes
app.get("/login", function(req, res){
  res.render("login");
});

app.post("/login", passport.authenticate("local",
{
  successRedirect: "/lists",
  failureRedirect: "/login"
}), function(req, res){
});

app.listen("3000", console.log("ListApp started..."));
