const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const token = req.cookies.token; 

  if (!token ) {
    return res.status(401).json({ error: "Нет токена, доступ запрещён" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Добавляем пользователя в `req`
    next(); // Передаём управление дальше
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: "Токен недействителен" });
  }
};

module.exports = protect;