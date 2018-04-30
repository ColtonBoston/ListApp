var mongoose = require("mongoose");

var listItemSchema = new mongoose.Schema({
  name: String,
  addedBy: {
    id: {
      type: mongoose.Schema.Types.ObjectId
    },
    username: String
  },
  isCompleted: { type: Boolean, default: false }
});

module.exports = mongoose.model("ListItem", listItemSchema);
