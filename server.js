console.log("Файл server.js запущен");

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;

// Подключаем БД
 connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Простая проверка сервера
app.get("/", (req, res) => {
  res.send("API работает!");
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});