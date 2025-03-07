import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom"; 
import { useWebSocket } from "../WebSocketProvider"; 

const Chat = () => { 
  const { chatId } = useParams();
  const { sendMessage } = useWebSocket();
  const { messages, setMessages, setChatId } = useWebSocket();
  const [msg, setMsg] = useState([]);
  const [text, setText] = useState(""); 
  const [chatName, setChatName] = useState("Загрузка...");
  const [users, setUsers] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    setChatId(chatId); // ✅ Передаём chatId в WebSocketProvider
  }, [chatId, setChatId]);


  // Загружаем название чата и пользователей
  useEffect(() => {
    const fetchChatInfo = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/chat/${chatId}`, {
          withCredentials: true,
        });
        setChatName(response.data.name || "Без названия"); 


        // Создаём объект { userId: username }
        const userMap = {};
        response.data.users.forEach(user => {
          userMap[user._id] = user.username;
        });
        setUsers(userMap);

        // Получаем текущего пользователя
        const userResponse = await axios.get("http://localhost:3000/api/auth/check", {
          withCredentials: true,
        });
        setCurrentUserId(userResponse.data.userId);


      } catch (error) {
        console.error("Ошибка при загрузке чата:", error);
        setChatName("Чат не найден");
      }
    };

    fetchChatInfo();
  }, [chatId]);


  // Загружаем сообщения для конкретного чата при монтировании компонента
  useEffect(() => {

    // Загружаем сообщения, связанные с текущим чатом
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/message/${chatId}`, {
          withCredentials: true,
        });
        setMsg(response.data);  
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
    <div className="chat-container">
      <h2 className="chat-title">{chatName}</h2>

      {/* Список сообщений */}
      <div className="chat-messages">
        {msg.length === 0 ? (
          <p className="chat-no-messages">Сообщений пока нет</p>
        ) : (
          msg.map((msg, index) => {
            const isUserMessage = msg.sender === currentUserId; // 👈 Проверяем, кто отправил сообщение

            return (
              <div
                key={index}
                className={`chat-message ${
                  isUserMessage ? "chat-message-user" : "chat-message-other"
                }`}
              >
                {!isUserMessage && (
                  <span className="chat-message-sender">{users[msg.sender] || "БОТ"}</span>
                )}
                {msg.text}
              </div>
            );
          })
        )}
      </div>

      {/* Поле ввода */}
      <div className="chat-input">
        <input
          type="text"
          className="chat-input-field"
          placeholder="Введите сообщение"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault(); // Предотвращаем перенос строки
              handleSendMessage();
            }
          }}
        />
        <button className="chat-send-button" onClick={handleSendMessage}>
          Отправить
        </button>
      </div>
    </div>
  );


};

export default Chat;