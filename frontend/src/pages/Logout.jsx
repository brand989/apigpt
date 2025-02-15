import React from "react";
import { useWebSocket } from "../WebSocketProvider";

const Logout = ({ setAuthenticated }) => {
  const { disconnect } = useWebSocket(); // ✅ Теперь не будет ошибки

  const handleLogout = async () => {
    await fetch("http://localhost:3000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    disconnect(); // ✅ Закрываем WebSocket
    setAuthenticated(false);
  };

  return <button onClick={handleLogout}>Выйти</button>;
};

export default Logout;