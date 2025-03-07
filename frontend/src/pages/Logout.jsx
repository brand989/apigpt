import React from "react";
import { useWebSocket } from "../WebSocketProvider";
import { logout } from "../api";

const Logout = ({ setAuthenticated }) => {
  const { disconnect } = useWebSocket(); // ✅ Теперь не будет ошибки

  const handleLogout = async () => {
    await logout();

    disconnect(); // ✅ Закрываем WebSocket
    setAuthenticated(false);
  };

  return <button className="logout-button" onClick={handleLogout}>Выйти</button>;
};

export default Logout;