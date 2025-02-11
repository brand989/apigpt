const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Авторизация пользователя
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  
  console.log("🔍 Логин: ", username, "Пароль: ", password);

  try {
    // Ищем пользователя в базе
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Неверный логин или пароль" });
    }

    // Проверяем пароль
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Неверный логин или пароль" });
    }

    // Генерируем JWT-токен
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token });
  } catch (error) {
    console.error("Ошибка авторизации:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

module.exports = router;