const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const Message = require("./models/Message");

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
          const { userId } = data;

          if (!userId) {
            return ws.send(JSON.stringify({ error: "Требуется userId" }));
          }

          const messages = await Message.find({
            $or: [
              { sender: String(ws.userId), recipient: String(userId) },
              { sender: String(userId), recipient: String(ws.userId) },
            ],
          }).sort({ createdAt: 1 });

          if (messages.length === 0) {
            return ws.send(JSON.stringify({ message: "Сообщений пока нет" }));
          }

          ws.send(JSON.stringify({ type: "messages", data: messages }));
          return;
        }

        // ✅ Отправка нового сообщения
        if (data.type === "send_message") {
          const { recipient, text } = data;
          if (!recipient || !text) {
            return console.log("❌ Сообщение без получателя или текста");
          }

          const newMessage = new Message({
            sender: ws.userId,
            recipient,
            text,
          });

          await newMessage.save();
          console.log("💾 Сообщение сохранено в БД:", newMessage);

          // 🔄 Отправляем сообщение всем клиентам
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

  return wss;
};

module.exports = setupWebSocket;