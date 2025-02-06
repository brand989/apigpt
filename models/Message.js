const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  sender: { type: String, required: true }, // "user" или "bot"
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", MessageSchema);