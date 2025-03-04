import { createContext, useContext, useEffect, useState } from "react";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);



  useEffect(() => {
    fetch("http://localhost:3000/api/auth/check", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          const userId = data.userId;
          console.log("📡 Подключаем WebSocket с userId:", userId);

          const ws = new WebSocket("ws://localhost:3000", ["User_" + userId]);

          ws.onopen = () => {
            console.log("✅ WebSocket подключен");
            setSocket(ws);
            console.log("🟢 WebSocket после setSocket:", socket); // Должен быть `null`, потому что React не обновил состояние мгновенно.
          };

          ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("📩 Получено сообщение:", data);

            if (data.type === "new_message") {
              setMessages((prev) => [...prev, data.data]);
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
  const sendMessage = (chatId, recipient, text) => {
    console.log("📨 Попытка отправить сообщение...");
    
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.error("⛔ WebSocket не подключен! Попробуйте позже.");
      return;
    }
  
    socket.send(JSON.stringify({ type: "send_message", chatId, recipient, text }));
    console.log("✅ Сообщение отправлено:", { recipient, chatId, text });
  };

  const disconnect = () => {
    if (socket) {
      console.log("🔌 Отключаем WebSocket...");
      socket.close();
      setSocket(null);
    }
  };


  return (
    <WebSocketContext.Provider value={{ messages, sendMessage, disconnect }}>
      {children}
    </WebSocketContext.Provider>
  );
};

// ✅ Теперь `useWebSocket` экспортируется правильно
export const useWebSocket = () => {
  return useContext(WebSocketContext);
};