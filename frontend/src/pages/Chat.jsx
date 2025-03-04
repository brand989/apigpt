import React, { useState, useEffect } from "react";
import { useWebSocket } from "../WebSocketProvider"; // Правильный путь к WebSocket контексту

const Chat = ({ chatId }) => { // chatId теперь передается как пропс
  const { sendMessage } = useWebSocket();
  const [messages, setMessages] = useState([]);

  const [recipient, setRecipient] = useState(""); // Для ID собеседника
  const [text, setText] = useState(""); // Для текста нового сообщения

  // Загружаем сообщения для конкретного чата при монтировании компонента
  useEffect(() => {
    if (chatId) {
      // Запросить сообщения для этого чата
      fetch(`http://localhost:3000/api/message/${chatId}`, {
        method: "GET",
        credentials: "include",
      })

        .then((res) => res.json())
        .then((data) => {
          console.log("Загружены сообщения:", data);
          setMessages(data);
        })
        .catch((err) => console.error("Ошибка при загрузке сообщений:", err));
    }
  }, [chatId]);

  // Обработчик отправки сообщения
  const handleSendMessage = () => {
    if (recipient && text.trim()) {
      sendMessage(chatId, recipient, text); // Отправляем сообщение в конкретный чат через WebSocket
      setText("");  // Очищаем поле ввода после отправки
    }
  };

  console.log("🔄 Chat компонент обновился, сообщений:", messages.length);

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
        {messages.length === 0 ? (
          <p>Сообщений пока нет</p>
        ) : (
          messages.map((msg, index) => (
            <p key={index}>
              <strong>
                {msg.sender === recipient
                  ? "Вы"
                  : msg.sender === "ChatGPT" // Если отправитель — бот
                  ? "Бот"
                  : "Друг"}:
              </strong>{" "}
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