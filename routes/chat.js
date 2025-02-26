const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");

router.post("/create", async (req, res) => {
  const { userIds } = req.body; // Два или более userId

  try {
    const newChat = new Chat({ users: userIds });
    await newChat.save();
    res.status(201).json(newChat);
  } catch (error) {
    res.status(500).json({ message: "Error creating chat", error });
  }
});

module.exports = router;