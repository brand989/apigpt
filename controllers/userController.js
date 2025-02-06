const User = require("../models/User");

// Получить всех пользователей
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// Создать нового пользователя
const createUser = async (req, res) => {
  try {
    const { username } = req.body;
    const newUser = new User({ username });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

module.exports = { getUsers, createUser };