const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const Message = require("./models/Message");
const axios = require("axios");


const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, req) => {
    console.log("🔗 WebSocket-соединение запрашивается");

    // ✅ Проверяем заголовок
    let authHeader = req.headers["sec-websocket-protocol"];

    if (!authHeader) {
        ws.close();
        return console.log("❌ Нет заголовка Sec-WebSocket-Protocol, соединение закрыто");
      }

    authHeader = authHeader.split(",").pop().trim();

    // ✅ Проверяем, что передан userId вместо JWT
    if (!authHeader.startsWith("User_")) {
      ws.close();
      return console.log("❌ Неверный формат заголовка, соединение закрыто");
    }

    const userId = authHeader.replace("User_", "").trim();
    ws.userId = userId;
    console.log("✅ WebSocket подключен, userId:", userId);

    // 📩 Обрабатываем входящие сообщения и команды
    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message);
        console.log("📩 Получено сообщение:", data);

        // ✅ Запрос истории сообщений
        if (data.type === "get_messages") {
            const { chatId } = data;  // Извлекаем chatId из данных
          
            if (!chatId) {
              return ws.send(JSON.stringify({ error: "Требуется chatId" }));  // Если chatId не передан
            }
          
            // Запрашиваем все сообщения для конкретного чата
            const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
          
            if (messages.length === 0) {
              return ws.send(JSON.stringify({ message: "Сообщений пока нет" }));
            }
          
            // Отправляем все сообщения для этого чата
            ws.send(JSON.stringify({ type: "messages", data: messages }));
            return;
          }


        // ✅ Отправка нового сообщения
        if (data.type === "send_message") {
            const { chatId, text } = data;  // Извлекаем chatId и text
          
            if (!text || !chatId) {
              return console.log("❌ Сообщение без текста или chatId");
            }
          
            const newMessage = new Message({
              sender: ws.userId,
              chatId,  // Добавляем chatId
              text,
            });
          
            await newMessage.save();
            console.log("💾 Сообщение сохранено в БД:", newMessage);

          // Здесь должен быть запрос к OpenAI, чтобы получить ответ

            const chatGptResponse = await getChatGPTResponse(text); // Нужно добавить этот запрос

            // После получения ответа от OpenAI добавляем его как новое сообщение
            const botMessage = new Message({
                chatId,
                sender: "67c5c665154bda1f2ced00cf",  // Или ID бота, если необходимо
                text: chatGptResponse, // Ответ от OpenAI
            });

            await botMessage.save(); // Сохраняем сообщение от бота в БД
            console.log("💾 Сообщение от ChatGPT сохранено в БД:", botMessage);



            // Отправляем сообщение всем подключенным клиентам
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: "new_message", data: newMessage }));
              }
            });
          
            return;
          }

      } catch (error) {
        console.error("❌ Ошибка при обработке сообщения:", error);
      }
    });




    ws.on("close", () => {
      console.log("❌ Клиент отключился");
    });
  });

// Отслеживаем изменения в базе данных и отправляем новое сообщение всем подписанным пользователям
Message.watch().on('change', (change) => {
    console.log("🔄 Изменение в базе данных:", change);
    if (change.operationType === 'insert') {
      const newMessage = change.fullDocument;
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'new_message', data: newMessage }));
        }
      });
    }
  });




  return wss;
};

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
  

module.exports = setupWebSocket;