const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  text: { type: String, required: true },
  status: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const listSchema = new mongoose.Schema({
  title: { type: String, required: true },
  entries: [itemSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("List", listSchema);
