var mongoose = require("mongoose");

var listSchema = new mongoose.Schema({
  name: String,
  owner: String,
  description: String,
  privacy: String,
  items: [],
  createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model("List", listSchema);
