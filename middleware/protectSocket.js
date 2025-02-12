const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET;

const protectSocket = (socket, next) => {
  const token = socket.handshake.query.token; // Получаем токен из query параметра

  if (!token) {
    return next(new Error("No token, access denied"));
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    socket.user = decoded; // Добавляем информацию о пользователе в сокет
    next(); // Передаем управление дальше
  } catch (error) {
    return next(new Error("Invalid token"));
  }
};

module.exports = protectSocket;