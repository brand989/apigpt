import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Для навигации

const ChatList = () => {
  const [chats, setChats] = useState([]);

  // Загружаем чаты при монтировании компонента
  useEffect(() => {
    // Пример запроса на сервер для получения списка чатов
    fetch("http://localhost:3000/api/chat", {
      method: "GET",
      credentials: "include", // Используем куки для авторизации
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Чаты получены:', data); // Логируем чаты
        setChats(data);
      })
      .catch((err) => console.error("Ошибка при загрузке чатов:", err));
  }, []);

  return (
    <div>
      <h2>Список чатов</h2>

      {/* Список чатов */}
      <ul>
        {chats.length === 0 ? (
          <p>У вас нет чатов.</p>
        ) : (
          chats.map((chat) => (
            <li key={chat._id}>
              <Link to={`/chat/${chat._id}`}>{chat.name}</Link>
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