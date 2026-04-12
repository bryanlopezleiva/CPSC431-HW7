const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const listSchema = new mongoose.Schema({
  name: { type: String, required: true },
  items: [itemSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("List", listSchema);
