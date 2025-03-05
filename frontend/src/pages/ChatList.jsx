import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


const ChatList = ({ chats }) => {

    const navigate = useNavigate();

  return (
    <div>
      <h2>Список чатов</h2>
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