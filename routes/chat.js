const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const protect = require("../middleware/authMiddleware");  // Миддлвар для авторизации

// Получение всех чатов для текущего пользователя
router.get("/", protect, async (req, res) => {
  try {
    const chats = await Chat.find({ users: req.user.userId });// Ищем чаты, в которых есть текущий пользователь
    res.json(chats); // Отправляем список чатов
  } catch (error) {
    console.error("Ошибка при получении чатов:", error);
    res.status(500).json({ message: "Ошибка при получении чатов" });
  }
});

// Создание чата
router.post("/create", async (req, res) => {
  const { users, name } = req.body;

  try {
    const newChat = new Chat({
      users: users,
      name: name || "Без имени", // Если имя не передано, используется дефолтное "Без имени"
    });

    await newChat.save();
    res.status(201).json(newChat); // Возвращаем созданный чат
  } catch (error) {
    res.status(500).json({ message: "Ошибка при создании чата", error });
  }
});

router.get("/:chatId", async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId).populate("users", "username");

    if (!chat) {
      return res.status(404).json({ error: "Чат не найден" });
    }

    res.json(chat);
  } catch (error) {
    console.error("Ошибка при загрузке чата:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});


module.exports = router;