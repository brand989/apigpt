import React, { useState, useEffect } from "react";
import { WebSocketProvider } from "./WebSocketProvider";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Logout from "./pages/Logout";

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3000/api/auth/check", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setAuthenticated(data.authenticated))
      .catch(() => setAuthenticated(false));
  }, []);

  return (
    <WebSocketProvider token={authenticated ? "token_in_cookie" : ""}>
      <div>
        <h1>Чат</h1>
        {authenticated ? (
          <>
            <Chat />
            <Logout setAuthenticated={setAuthenticated} /> {/* ✅ Кнопка выхода */}
          </>
        ) : (
          <Login setAuthenticated={setAuthenticated} />
        )}
      </div>
    </WebSocketProvider>
  );
};

export default App;