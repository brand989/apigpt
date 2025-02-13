import { createContext, useContext, useEffect, useState } from "react";

const WebSocketContext = createContext(null);
export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children, token }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket("ws://localhost:3000", ["Bearer_" + token]);

    ws.onopen = () => console.log("✅ WebSocket подключен");
    ws.onclose = () => console.log("❌ WebSocket закрыт");
    ws.onerror = (error) => console.error("❌ Ошибка WebSocket:", error);

    setSocket(ws);

    return () => {
      ws.close();
      setSocket(null); // ✅ Очищаем WebSocket при выходе
    };
  }, [token]);

  const disconnect = () => {
    if (socket) {
      socket.close();
      setSocket(null); // ✅ Убираем ссылку, чтобы WebSocket не создавался снова
    }
  };

  return (
    <WebSocketContext.Provider value={{ socket, disconnect }}>
      {children}
    </WebSocketContext.Provider>
  );
};