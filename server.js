const express = require("express");
const http = require("http"); // Добавляем модуль http
const cors = require("cors");
const cookieParser = require("cookie-parser"); // 🔥 Добавляем cookie-parser
const jwt = require("jsonwebtoken");
const { execSync } = require("child_process");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const setupWebSocket = require("./websocket"); // Подключаем WebSocket



const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app); // Создаем HTTP-сервер

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
app.use(
  cors({
    origin: "http://localhost:5173", // ✅ Разрешаем только свой фронтенд
    credentials: true, // ✅ Разрешаем куки
  })
);

app.use(express.json());
app.use(cookieParser()); // 🔥 Добавляем поддержку куков

// Подключаем маршруты пользователей
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);  
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

mongoose.connection.on("error", (error) => {
  console.error("❌ Ошибка подключения к MongoDB:", error.message);
});



// 🛠 Подключаем WebSocket и сохраняем ссылку на него
const wss = setupWebSocket(server);

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

  wss.close(() => {
    console.log("🔴 WebSocket-сервер закрыт");
  });


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