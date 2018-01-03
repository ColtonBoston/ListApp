var mongoose = require("mongoose");

var listSchema = new mongoose.Schema({
  name: String,
  owner: String,
  description: String,
  privacy: String,
  items: [],
  createdAt: {type: Date, default: Date.now},
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  }
});

module.exports = mongoose.model("List", listSchema);
