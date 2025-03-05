import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom"; 

import { useWebSocket } from "../WebSocketProvider"; // Правильный путь к WebSocket контексту

const Chat = () => { // chatId теперь передается как пропс
  const { chatId } = useParams();
  const { sendMessage } = useWebSocket();
  const { messages, setMessages } = useWebSocket();

  const [msg, setMsg] = useState([]);

  useEffect(() => {
    console.log("Сообщения загружены:", msg);
  }, [msg]); // Логируем изменения состояния msg

  console.log("Полученный chatId:", chatId);

  const [text, setText] = useState(""); // Для текста нового сообщения

  // Загружаем сообщения для конкретного чата при монтировании компонента
  useEffect(() => {
    console.log("chatId изменился. Загружаем сообщения...");
    // Загружаем сообщения, связанные с текущим чатом
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/message/${chatId}`, {
          withCredentials: true,
        });
        setMsg(response.data);  // Обновляем состояние сообщениями
      } catch (error) {
        console.error("Ошибка при загрузке сообщений:", error);
      }
    };

    fetchMessages();
  }, [chatId]); 

  // Обработчик отправки сообщения
  const handleSendMessage = () => {
    if (text.trim()) {
      sendMessage(chatId,  text); // Отправляем сообщение в конкретный чат через WebSocket
      setText("");  // Очищаем поле ввода после отправки
    }
  };


  useEffect(() => {
    // Если сообщения из WebSocket обновились, добавляем их в состояние msg
  if (messages && messages.length > 0) {
    messages.forEach((newMessage) => {
      setMsg((prevMsg) => {
        if (prevMsg.find((msg) => msg._id === newMessage._id)) {
          return prevMsg; // Если сообщение уже есть, не добавляем его
        }
        return [...prevMsg, newMessage]; // Добавляем новое сообщение
      });
    });
  }
  }, [messages]); // Логируем изменения состояния


  return (
    <div>
      <h2>Чат: {chatId}</h2>

      {/* Список сообщений */}
      <div
        style={{
          border: "1px solid black",
          padding: "10px",
          margin: "10px 0",
          maxHeight: "300px",
          overflowY: "auto",
        }}
      >
        {msg.length === 0 ? (
          <p>Сообщений пока нет</p>
        ) : (
          msg.map((msg, index) => (
            <p key={index}>
              <strong>{msg.sender === "ChatGPT" ? "Бот" : msg.sender}:</strong>{" "}
              {msg.text}
            </p>
          ))
        )}
      </div>

      {/* Поле ввода сообщения */}
      <input
        type="text"
        placeholder="Введите сообщение"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={handleSendMessage}>Отправить</button>
    </div>
  );
};

export default Chat;