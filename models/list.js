var mongoose = require("mongoose");

var listSchema = new mongoose.Schema({
  name: String,
  description: String,
  items: [
    {
      name: String,
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    }
  ],
  createdAt: {type: Date, default: Date.now},
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  },
  permissions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]
});

module.exports = mongoose.model("List", listSchema);
