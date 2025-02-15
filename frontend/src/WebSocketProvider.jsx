import { createContext, useContext, useEffect, useState } from "react";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  console.log(socket);

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

          ws.onopen = () => console.log("✅ WebSocket подключен");
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

          return () => {
            ws.close();
            setSocket(null);
          };
        }
      })
      .catch((err) => console.error("❌ Ошибка при получении userId", err));
  }, []);

  // ✅ Функция отправки сообщений
  const sendMessage = (recipient, text) => {
    if (!socket) {
      console.error("⛔ WebSocket не подключен!");
      return;
    }
    socket.send(JSON.stringify({ type: "send_message", recipient, text }));
  };

  return (
    <WebSocketContext.Provider value={{ messages, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

// ✅ Теперь `useWebSocket` экспортируется правильно
export const useWebSocket = () => {
  return useContext(WebSocketContext);
};