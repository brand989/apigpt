const express = require("express");
const router = express.Router();
const { getUsers, createUser } = require("../controllers/userController");

// Маршрут для получения всех пользователей
router.get("/", getUsers);

// Маршрут для создания нового пользователя
router.post("/", createUser);

module.exports = router;