import { createContext, useContext, useEffect, useState } from "react";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null); 
  const [chats, setChats] = useState([]);

  useEffect(() => {
    console.log("🔄 Состояние сообщений обновлено 2:", messages);
  }, [messages]); // Логируем изменения состояния


  useEffect(() => {
    fetch("http://localhost:3000/api/auth/check", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          const userId = data.userId;
          console.log("📡 Подключаем WebSocket с userId:", userId);
          setUserId(userId); 

          const ws = new WebSocket("ws://localhost:3000", ["User_" + userId]);

          ws.onopen = () => {
            console.log("✅ WebSocket подключен");
            setSocket(ws);
            console.log("🟢 WebSocket после setSocket:", ws);
          };

          ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

           
            if (data.type === "new_message") {
              console.log("📩 Новое сообщение:", data.data);
            
              // Добавляем новое сообщение в список, если оно не дублируется
              setMessages((prevMessages) => {
                // Проверяем, что сообщение не дублируется по _id
                const messageExists = prevMessages.some((msg) => msg._id === data.data._id);
                if (messageExists) {
                  console.log("❌ Это сообщение уже есть в списке");
                  return prevMessages; // Если сообщение уже есть, не добавляем его
                }
                
                // Если нет, добавляем сообщение в список
                console.log("Добавляем новое сообщение в список:", data.data);
                return [...prevMessages, data.data];
              });
            }

            if (data.type === "messages") {
              setMessages(data.data);
            }
          };

          ws.onerror = (error) => console.error("❌ Ошибка WebSocket:", error);
          ws.onclose = () => console.log("❌ WebSocket закрыт");

          setSocket(ws);

          console.log("после сетсокет", socket);

          return () => {
            ws.close();
            setSocket(null);
          };
        }
      })
      .catch((err) => console.error("❌ Ошибка при получении userId", err));
  }, []);

  useEffect(() => {
    if (socket) {
      console.log("✅ WebSocket обновлён в состоянии:", socket);
    }
  }, [socket]);


  // ✅ Функция отправки сообщений
  const sendMessage = (chatId, text) => {
    console.log("📨 Попытка отправить сообщение...", socket);
    
    if (!socket) {
      console.error("⛔ WebSocket не подключен! Попробуйте позже.");
      return;
    }
  
    if (socket.readyState !== WebSocket.OPEN) {
      console.error("⛔ WebSocket ещё не открыт! Попробуйте позже.");
      return;
    }
    
    socket.send(JSON.stringify({ type: "send_message", chatId, text }));
    console.log("✅ Сообщение отправлено:", { chatId, text });
  };


  const disconnect = () => {
    if (socket) {
      console.log("🔌 Отключаем WebSocket...");
      socket.close();
      setSocket(null);
    }
  };


  return (
    <WebSocketContext.Provider value={{ socket, messages, sendMessage, userId , chats, disconnect }}>
      {children}
    </WebSocketContext.Provider>
  );
};

// ✅ Теперь `useWebSocket` экспортируется правильно
export const useWebSocket = () => {
  return useContext(WebSocketContext);
};