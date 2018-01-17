var mongoose = require("mongoose");

var listItemSchema = new mongoose.Schema({
  name: String,
  addedBy: {
    id: {
      type: mongoose.Schema.Types.ObjectId
    },
    username: String
  }
});

module.exports = mongoose.model("ListItem", listItemSchema);
