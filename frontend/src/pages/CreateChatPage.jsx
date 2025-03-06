import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useWebSocket } from '../WebSocketProvider'; 

const CreateChatPage = ({ addChat }) => {
  const [message, setMessage] = useState("");
  const { userId } = useWebSocket();
  const navigate = useNavigate();

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleCreateChat = async () => {
    if (message.trim()) {
      const chatName = message.split(" ").slice(0, 3).join(" "); // Название чата из первых трех слов сообщения

      try {
        console.log(chatName,[userId])
        const response = await axios.post("http://localhost:3000/api/chat/create", {
          name: chatName,
          users: [userId],
        }, {
            withCredentials: true,  
          });

        const newChat = response.data;

        // Создаем первое сообщение в чате
        await axios.post("http://localhost:3000/api/message", {
          chatId: newChat._id,
          text: message,
        }, {
            withCredentials: true,  
          });

        // Обновляем родительский компонент с новым chatId
        addChat(newChat);

        // Переходим к этому чату
        navigate(`/chat/${newChat._id}`);


      } catch (error) {
        console.error("Ошибка при создании чата:", error);
      }
    }
  };

  return (
    <div>
      <h1>Чем могу помочь?</h1>
      <input
        type="text"
        value={message}
        onChange={handleMessageChange}
        placeholder="Введите сообщение для чата"
      />
      <button onClick={handleCreateChat}>Создать чат</button>
    </div>
  );
};

export default CreateChatPage;