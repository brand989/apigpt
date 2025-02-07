import { BrowserRouter, Routes, Route } from "react-router-dom";
import Chat from "./pages/Chat";
import Login from "./pages/Login";

import { useState } from "react";
import { getServerStatus } from "./api";


function App() {

  const [status, setStatus] = useState("");

  const checkServer = async () => {
    const data = await getServerStatus();
    setStatus(data.message || data.error);
  };

  return (
    <div>
    <h1>Проверка связи с сервером</h1>
    <button onClick={checkServer}>Проверить сервер</button>
    <p>{status}</p>
    {/* <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </BrowserRouter> */}
  </div>
    
  );
}

export default App;