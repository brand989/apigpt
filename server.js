const express = require("express");
const WebSocket = require("ws");
const http = require("http"); // Добавляем модуль http
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const { execSync } = require("child_process");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app); // Создаем HTTP-сервер
const wss = new WebSocket.Server({ server }); // Подключаем WS к HTTP-серверу

// ✅ Попытка освободить порт перед запуском
try {
  console.log(`🔍 Проверяем порт ${PORT}...`);
  const pid = execSync(`lsof -ti:${PORT} || netstat -vanp tcp | grep ${PORT} | awk '{print $9}'`).toString().trim();
  if (pid) {
    console.log(`⚠️  Найден процесс, занимающий порт ${PORT} (PID: ${pid}), завершаем...`);
    execSync(`kill -9 ${pid}`);
    console.log(`✅ Порт ${PORT} очищен!`);
  }
} catch (error) {
  console.log("🔹 Порт свободен, запускаем сервер...");
}

// Подключаем БД
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Подключаем маршруты пользователей
app.use("/api/auth", authRoutes);
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

// Простая проверка сервера
app.get("/", (req, res) => {
  res.send("API работает!");
});

app.get("/api/status", (req, res) => {
  res.json({ message: "Сервер работает! 🚀" });
});

const mongoose = require("mongoose");

mongoose.connection.once("open", async () => {
  console.log("✅ Подключено к MongoDB");

  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log("📂 Коллекции в базе данных:", collections.map(col => col.name));
});

// Настройка WebSocket с проверкой токена в заголовках
wss.on("connection", (ws, req) => {
  console.log("🔗 WebSocket-соединение запрашивается");

  let authHeader = req.headers["sec-websocket-protocol"];

  console.log("🔍 Все заголовки запроса:", req.headers);

  if (!authHeader) {
    ws.close();
    return console.log("❌ Нет заголовка Sec-WebSocket-Protocol, соединение закрыто");
  }

  // Postman иногда передает несколько значений через запятую, берём последний
  authHeader = authHeader.split(",").pop().trim();

  if (!authHeader.startsWith("Bearer ")) {
    ws.close();
    return console.log("❌ Неверный формат токена, соединение закрыто");
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    ws.user = decoded;
    console.log("✅ Авторизованный пользователь подключился:", ws.user.userId);
  } catch (error) {
    ws.close();
    return console.log("❌ Недействительный токен, соединение закрыто");
  }
});

// Запуск сервера
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

// Обработчик закрытия сервера
const shutdown = () => {
  console.log("⏳ Завершение работы сервера...");

  wss.clients.forEach((client) => {
    client.terminate(); // Принудительно закрываем соединение
  });
  wss.close();

  if (server) {
    server.close(() => {
      console.log("✅ Сервер остановлен");
      process.exit(0);
    });
  } else {
    process.exit(1);
  }
};

// Ловим сигналы завершения процесса
process.on("SIGINT", shutdown);  // При нажатии Ctrl + C
process.on("SIGTERM", shutdown); // При завершении процесса (например, `kill PID`)

server.on("close", () => {
  console.log("🔴 Сервер завершил работу");
});
