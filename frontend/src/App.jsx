import React, { useState, useEffect } from "react";
import { BrowserRouter as Router} from "react-router-dom";
import { WebSocketProvider } from "./WebSocketProvider";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import ChatList from "./pages/ChatList";

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [chatId, setChatId] = useState(null); // Состояние для текущего chatId


  useEffect(() => {
    fetch("http://localhost:3000/api/auth/check", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setAuthenticated(data.authenticated))
      .catch(() => setAuthenticated(false));
  }, []);

  return (
    <Router> 
      <WebSocketProvider token={authenticated ? "token_in_cookie" : ""}>
        <div>
          <h1>Чат</h1>
          {authenticated ? (
            
            <>
              <div style={{ width: "250px", marginRight: "20px" }}>
                <ChatList setChatId={setChatId}/> {/* Отображаем список чатов */}
              </div>
              <div style={{ flexGrow: 1 }}>
                {chatId && <Chat chatId={chatId} />}
              </div>
              <Logout setAuthenticated={setAuthenticated} /> {/* ✅ Кнопка выхода */}
            </>
          ) : (
            <Login setAuthenticated={setAuthenticated} />
          )}
        </div>
      </WebSocketProvider>
    </Router>
  );
};

export default App;