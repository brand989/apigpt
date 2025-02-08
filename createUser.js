require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const readline = require("readline");
const User = require("./models/User");

// Подключение к MongoDB
mongoose
.connect(process.env.MONGO_URI)
.then(() => console.log("✅ Подключено к MongoDB"))
.catch((err) => {
  console.error("Ошибка подключения к MongoDB:", err);
  process.exit(1);
});

// Интерфейс для ввода данных
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Функция запроса данных у пользователя
const askQuestion = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

const createUser = async () => {
  try {
    const username = await askQuestion("Введите логин: ");
    const password = await askQuestion("Введите пароль: ");

    rl.close();

    // Проверяем, существует ли пользователь
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log("❌ Пользователь уже существует");
      mongoose.connection.close();
      return;
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const user = new User({
      username,
      password: hashedPassword,
    });

    await user.save();
    console.log(`✅ Пользователь "${username}" создан!`);

    // Генерируем JWT токен
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("🔑 JWT Token:", token);

    mongoose.connection.close();
  } catch (err) {
    console.error("Ошибка при создании пользователя:", err);
    mongoose.connection.close();
  }
};

createUser();