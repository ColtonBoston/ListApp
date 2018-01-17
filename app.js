var express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    methodOverride = require("method-override"),
    LocalStrategy = require("passport-local"),
    User = require("./models/user"),
    List = require("./models/list");

var listRoutes = require("./routes/lists"),
    listItemRoutes = require("./routes/listItems"),
    indexRoutes = require("./routes/index"),
    userRoutes = require("./routes/users");

var app = express();

mongoose.connect("mongodb://localhost/list_app_v4");
mongoose.Promise = global.Promise;
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
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
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  next();
});

app.use(indexRoutes);
app.use(listRoutes);
app.use(listItemRoutes);
app.use(userRoutes);

// For shorter route names in routes/lists.js
// app.use("/lists", listRoutes);

app.listen("3000", console.log("ListApp started..."));
