var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
  username: String,
  rawUsername: String,
  email: {type: String, unique: true, sparse: true, required: true, lowercase: true},
  rawEmail: String,
  password: String,
  friends: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
  ]
});

userSchema.plugin(passportLocalMongoose, {usernameQueryFields: ["email"]});

module.exports = mongoose.model("User", userSchema);
