const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    name: {
      type: String,
      required: true,
      default: "Без имени", // Название чата, если не передано, будет "Без имени"
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", ChatSchema);