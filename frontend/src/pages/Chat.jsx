import React, { useState } from "react";
import { useWebSocket } from "../WebSocketProvider";

const Chat = () => {
  const { messages = [], sendMessage, getMessages } = useWebSocket(); // ✅ Всегда массив
  const [recipient, setRecipient] = useState("");
  const [text, setText] = useState("");

  const handleSendMessage = () => {
    if (recipient && text.trim()) {
      sendMessage(recipient, text);
      setText(""); // Очищаем поле после отправки
    }
  };

  return (
    <div>
      <h2>Чат</h2>

      {/* Ввод ID собеседника */}
      <div>
        <input
          type="text"
          placeholder="ID собеседника"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <button onClick={() => getMessages(recipient)}>Загрузить сообщения</button>
      </div>

      {/* Блок сообщений */}
      <div style={{ border: "1px solid black", padding: "10px", margin: "10px 0", maxHeight: "300px", overflowY: "auto" }}>
        {messages.length === 0 ? (
          <p>Сообщений пока нет</p>
        ) : (
          messages.map((msg, index) => (
            <p key={index}>
              <strong>{msg.sender === recipient ? "Вы" : "Друг"}:</strong> {msg.text}
            </p>
          ))
        )}
      </div>

      {/* Ввод нового сообщения */}
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