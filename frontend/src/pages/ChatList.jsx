import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FiEdit2 } from "react-icons/fi";


const ChatList = ({ chats }) => {

const navigate = useNavigate();

  return (
    <div className="chat-list-container">
            <div className="chat-list-add-button" onClick={() => navigate("/")}>
            <FiEdit2 size={24} />
            </div>
        <h1 className="logo">Ваш Бот</h1>  
      <h2 className="chat-list-title">Последние чаты</h2>
      <ul className="chat-list">
        {chats.length === 0 ? (
          <p className="chat-list-empty">У вас нет чатов.</p>
        ) : (
          chats.map((chat) => (
            <li key={chat._id} className="chat-list-item">
              <Link to={`/chat/${chat._id}`} className="chat-list-link">
                {chat.name}
              </Link>
            </li>
          ))
        )}
      </ul>

      
      
    </div>
  );
};

export default ChatList;