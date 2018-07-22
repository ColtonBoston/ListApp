var express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    flash = require("connect-flash"),
    methodOverride = require("method-override"),
    LocalStrategy = require("passport-local"),
    User = require("./models/user"),
    List = require("./models/list");

var listRoutes = require("./routes/lists"),
    listItemRoutes = require("./routes/listItems"),
    indexRoutes = require("./routes/index"),
    userRoutes = require("./routes/users");

var app = express();

//mongoose.connect("mongodb://localhost/list_app_v4");
mongoose.connect(process.env.DATABASEURL);
mongoose.Promise = global.Promise;
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// PASSPORT CONFIG
app.use(require("express-session")({
  secret: process.env.SECRET,
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
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

// Redirect from http to https
app.get("*", function(req, res, next){
  if (req.headers["x-forwarded-proto"] != "https" && process.env.NODE_ENV === "production"){
    res.redirect("https://" + req.hostname + req.url);
  }
  else {
    next();
  }
});

app.use(indexRoutes);
app.use(listRoutes);
app.use(listItemRoutes);
app.use(userRoutes);

// For shorter route names in routes/lists.js
// app.use("/lists", listRoutes);

app.listen(process.env.PORT, process.env.IP, console.log("ListApp started..."));
