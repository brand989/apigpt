console.log("Файл server.js запущен");

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;

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


app.use("/api/auth", authRoutes);
// Подключаем маршруты пользователей
app.use("/api/users", require("./routes/userRoutes"));


// Простая проверка сервера
app.get("/", (req, res) => {
  res.send("API работает!");
});

app.get("/api/status", (req, res) => {
  res.json({ message: "Сервер работает! 🚀" });
});

let server;

// Запуск сервера
server = app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

const mongoose = require("mongoose");

mongoose.connection.once("open", async () => {
  console.log("✅ Подключено к MongoDB");

  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log("📂 Коллекции в базе данных:", collections.map(col => col.name));
});




// Обработчик закрытия сервера
const shutdown = () => {
  console.log("⏳ Завершение работы сервера...");
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