const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const Message = require("../models/Message");
const { ObjectId } = require("mongoose").Types;

// ✅ 1. Отправка сообщения
router.post("/", protect, async (req, res) => {
  try {

    console.log("🔍 Данные запроса:", req.body);
    const { recipient, text } = req.body;
    if (!recipient || !text) {
      return res.status(400).json({ error: "Получатель и текст обязательны" });
    }

    const message = new Message({
      sender: req.user.userId, // ID текущего пользователя (авторизованного)
      recipient,
      text,
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error("Ошибка при отправке сообщения:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// ✅ 2. Получение всех сообщений с конкретным пользователем
router.get("/:userId", protect, async (req, res) => {
    try {

    const { userId } = req.params;

    const messages = await Message.find({
        $or: [
            { sender: String(req.user.userId), recipient: String(userId) },
            { sender: String(userId), recipient: String(req.user.userId) },
        ],
      }).sort({ createdAt: 1 }); // Сортируем по дате
      
      if (messages.length === 0) {
        return res.json({ message: "Сообщений пока нет" });
      }

      res.json(messages);
    } catch (error) {
      console.error("Ошибка при получении сообщений:", error);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  });

module.exports = router;