const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const Message = require("../models/Message");
const { ObjectId } = require("mongoose").Types;

// ✅ 1. Отправка сообщения
// ✅ 1. Отправка сообщения в чат
router.post("/", protect, async (req, res) => {
  try {
    console.log("🔍 Данные запроса:", req.body);
    const { chatId, text } = req.body; // Теперь используется chatId

    if (!chatId || !text) {
      return res.status(400).json({ error: "Чат и текст обязательны" });
    }

 

    const message = new Message({
      chatId,
      sender: req.user.userId, // ID авторизованного пользователя
      text,
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error("Ошибка при отправке сообщения:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// ✅ 2. Получение всех сообщений для конкретного чата
router.get("/:chatId", protect, async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chatId }) // Фильтруем по chatId
      .sort({ createdAt: 1 }); // Сортируем по дате

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