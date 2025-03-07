import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from '../WebSocketProvider'; 
import { createChat, sendMessage } from "../api";


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
        console.log("📢 Создаём чат:", chatName, "Пользователь:", userId);

        // ✅ Создаём чат через API
        const newChat = await createChat(chatName, userId);

        /// ✅ Отправляем первое сообщение
        await sendMessage(newChat._id, message);

        // Обновляем родительский компонент с новым chatId
        addChat(newChat);

        // Переходим к этому чату
        navigate(`/chat/${newChat._id}`);


      } catch (error) {
        console.error("Ошибка при создании чата:", error);
      }
    }
  };

        // ✅ Обработчик нажатия Enter
        const handleKeyDown = (event) => {
            if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault(); // Предотвращаем перенос строки
            handleCreateChat();
            }
        };

  return (
    <div className="create-chat-container">
      <h1 className="create-chat-title">Чем могу помочь?</h1>
      <input
        type="text"
        value={message}
        className="create-chat-input"
        onChange={handleMessageChange}
        onKeyDown={handleKeyDown} 
        placeholder="Введите сообщение для чата"
      />
      <button className="create-chat-button" onClick={handleCreateChat}>Создать чат</button>
    </div>
  );
};

export default CreateChatPage;