const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const axios = require("axios");
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

    // Получаем ответ от ChatGPT
    const chatGptResponse = await getChatGPTResponse(text);

    // Сохраняем ответ ChatGPT как сообщение
    const botMessage = new Message({
      chatId,
      sender: "67c5c665154bda1f2ced00cf",  // Или ID бота, если необходимо
      text: chatGptResponse,
    });

    await botMessage.save();  // Сохраняем ответ от ChatGPT
  
    res.status(201).json({ userMessage: message, botMessage });  // Отправляем оба сообщения
  } catch (error) {
    console.error("Ошибка при отправке сообщения:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// ✅ 2. Получение всех сообщений для конкретного чата
router.get("/:chatId", protect, async (req, res) => {

  try {
    const { chatId } = req.params;

    console.log(chatId)

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



async function getChatGPTResponse(message) {
  const apiKey = process.env.OPENAI_API_KEY; // Загружаем API-ключ из переменной окружения
  
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions", // URL для общения с OpenAI
      {
        model: "gpt-3.5-turbo",  // Используем модель "davinci" или "gpt-3.5-turbo"
        messages: [{ role: "user", content: message }],           // Текст, который отправляется в ChatGPT
        max_tokens: 150,            // Максимальное количество токенов в ответе
        temperature: 0.7,           // Уровень случайности в ответах
      },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
     // Логируем весь ответ для отладки
     console.log("Ответ от OpenAI:", response.data);

     if (response.data.choices && response.data.choices.length > 0) {
      const botMessage = response.data.choices[0].message;
      if (botMessage && botMessage.content) {
        return botMessage.content.trim();
      } else {
        throw new Error("Не удалось найти сообщение в ответе.");
      }
    } else {
      throw new Error("Не удалось получить ответ от OpenAI.");
    } 

  } catch (error) {
    console.error("Ошибка при запросе к OpenAI:", error);
    return "Ошибка при получении ответа.";  // Возвращаем ошибку, если не удалось получить ответ
  }
}



module.exports = router;