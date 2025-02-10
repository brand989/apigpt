const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const User = require("../models/User");

// Защищённый маршрут для получения информации о пользователе
router.get("/me", protect, async (req, res) => {
  try {
    console.log(req.user)
    const user = await User.findById(req.user.userId).select("-password");// Убираем пароль из ответа
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

module.exports = router;