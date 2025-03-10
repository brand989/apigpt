const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    console.log("🔍 MONGO_URI:", process.env.MONGO_URI); // Выводим MONGO_URI перед подключением

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB подключена");
  } catch (error) {
    console.error("❌ Ошибка подключения к MongoDB:", error);
    process.exit(1);
  }
};

module.exports = connectDB;