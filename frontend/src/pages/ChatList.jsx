import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Для навигации

const ChatList = ({ setChatId }) => {
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();

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
            <Link to={`/chat/${chat._id}`} onClick={() => setChatId(chat._id)}>
              {chat.name}
            </Link>
          </li>
          ))
        )}
      </ul>

      {/* Кнопка для добавления нового чата (функционал добавления пока пустой) */}
      <button
        onClick={() => {
          console.log("Функционал добавления чата будет позже");
          navigate("/"); // Редирект на главную страницу
        }}
      >
        Добавить чат
      </button>
    </div>
  );
};

export default ChatList;