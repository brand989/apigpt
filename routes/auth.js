const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();



// Авторизация пользователя
router.post("/login", async (req, res) => {
 

  try {
    const { username, password } = req.body;
    console.log("🔍 Логин: ", username, "Пароль: ", password);

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

    // Логируем токен перед отправкой
    console.log("🔑 Токен: ", token);

    // 🔒 Отправляем токен в HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,  // Защита от XSS
      secure: process.env.NODE_ENV === "production", // Только HTTPS в проде
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Локально Lax, в проде None
      maxAge: 60 * 60 * 1000, // 1 час
      domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : "", // Пустой домен на локалке
    });

    console.log("Set cookie:", res.getHeader('Set-Cookie'));
    res.json({ token });
  } catch (error) {
    console.error("Ошибка авторизации:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});



router.get("/check", (req, res) => {
  const token = req.cookies?.token; // ✅ Читаем токен из куков
  console.log("🔑 Токен из куки:", token);


  if (!token) {
    return res.json({ authenticated: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ authenticated: true, userId: decoded.userId });
  } catch (error) {
    res.json({ authenticated: false });
  }
});


// 🚀 Добавляем логаут (удаляем куку)
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});


module.exports = router;