import React, { useState, useEffect } from "react";
import { BrowserRouter , Routes,  Route } from "react-router-dom";
import { WebSocketProvider } from "./WebSocketProvider";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import ChatList from "./pages/ChatList";
import CreateChatPage from "./pages/CreateChatPage";

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [chats, setChats] = useState([]);

  // Функция для добавления нового чата
  const addChat = (newChat) => {
    setChats((prevChats) => [...prevChats, newChat]); // Добавляем новый чат в список
  };

  useEffect(() => {
    fetch("http://localhost:3000/api/auth/check", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setAuthenticated(data.authenticated))
      .catch(() => setAuthenticated(false));
  }, []);

  // Загружаем чаты при монтировании компонента через API
  useEffect(() => {
    if(authenticated) {
      fetch("http://localhost:3000/api/chat", {
        method: "GET",
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => setChats(data))
        .catch((err) => console.error("Ошибка при загрузке чатов:", err));
    }
  }, [authenticated]);



  return (
    <BrowserRouter> 
      <WebSocketProvider authenticated={authenticated}>
        <div className="app-container">
          {authenticated ? (
            <>
            <div className="logout-container">
                <Logout setAuthenticated={setAuthenticated} />
              </div>

              <div className="chat-layout">
                <div className="chat-sidebar">
               
                  <ChatList chats={chats}/> 
                </div>
                <div className="chat-main">
                  {<Routes>
                    <Route path="/chat/:chatId" element={<Chat />} /> 
                    <Route path="/" element={<CreateChatPage addChat={addChat}/>} />
                  </Routes>}
                </div>
              </div>
            </>
          ) : (
            <Login setAuthenticated={setAuthenticated} />
          )}
        </div>
      </WebSocketProvider>
      </BrowserRouter>
  );
};

export default App;