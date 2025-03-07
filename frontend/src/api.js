import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL  

// ✅ Запрос статуса сервера
export const getServerStatus = async () => {
  return request("/status");
};

// ✅ Логин
export const login = async (username, password) => {
  return request("/auth/login", "POST", { username, password });
};

// ✅ Логаут
export const logout = async () => {
  return request("/auth/logout", "POST");
};

// ✅ Проверка авторизации
export const checkAuth = async () => {
  return request("/auth/check");
};

// ✅ Получение списка чатов
export const getChats = async () => {
  return request("/chat");
};

// ✅ Создание чата (использует `users: [userId]`, как у тебя)
export const createChat = async (chatName, userId) => {
  return request("/chat/create", "POST", { name: chatName, users: [userId] });
};

// ✅ Отправка сообщения
export const sendMessage = async (chatId, text) => {
  return request("/message", "POST", { chatId, text });
};

// ✅ Получение сообщений чата
export const getMessages = async (chatId) => {
  return request(`/message/${chatId}`);
};

// ✅ Получение информации о чате (название + участники)
export const getChatInfo = async (chatId) => {
  return request(`/chat/${chatId}`); // Делаем GET-запрос к API
};


// 🔄 Универсальная функция для запросов
const request = async (endpoint, method = "GET", data = null) => {
  try {
    const options = {
      method,
      url: `${API_URL}${endpoint}`,
      data,
      withCredentials: true, // Передача cookie (очень важно)
    };

    const response = await axios(options);
    return response.data;
  } catch (error) {
    console.error(`❌ Ошибка запроса ${endpoint}:`, error);
    return { error: "Ошибка соединения с сервером" };
  }
};