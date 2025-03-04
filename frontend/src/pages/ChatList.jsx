import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Для навигации

const ChatList = ({ setChatId }) => {
  const [chats, setChats] = useState([]);

  // Загружаем чаты при монтировании компонента
  useEffect(() => {
    // Пример запроса на сервер для получения списка чатов
    fetch("http://localhost:3000/api/chat", {
      method: "GET",
      credentials: "include", // Используем куки для авторизации
    })
      .then((res) => res.json())
      .then((data) => setChats(data))
      .catch((err) => console.error("Ошибка при загрузке чатов:", err));
  }, []);

  return (
    <div>
      <h2>Список чатов</h2>
      <ul>
        {chats.length === 0 ? (
          <p>У вас нет чатов.</p>
        ) : (
          chats.map((chat) => (
            <li key={chat._id}>
              <button onClick={() => setChatId(chat._id)}>{chat.name}</button>
            </li>
          ))
        )}
      </ul>

      {/* Кнопка для добавления нового чата (функционал добавления пока пустой) */}
      <button
        onClick={() => {
          // Здесь будет функционал для добавления чата
          console.log("Функционал добавления чата будет позже");
        }}
      >
        Добавить чат
      </button>
    </div>
  );
};

export default ChatList;