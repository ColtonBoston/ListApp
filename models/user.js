var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
  email: {type: String, unique: true, sparse: true, required: true},
  username: String,
  password: String,
  friends: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
  ]
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
