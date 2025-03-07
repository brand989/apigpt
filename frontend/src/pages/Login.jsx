import React, { useState } from "react";
import { login } from "../api"



const Login = ({ setAuthenticated }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    try {
      const data = await login(username, password);

      if (data.error) {
        throw new Error(data.error || "Ошибка авторизации");
      }

      setAuthenticated(true); // Устанавливаем состояние "вошёл"
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
    <h2 className="login-title">Авторизация</h2>
    {error && <p className="login-error">{error}</p>}
    
    <input
      type="text"
      className="login-input"
      placeholder="Логин"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
    />
    <input
      type="password"
      className="login-input"
      placeholder="Пароль"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
    <button className="login-button" onClick={handleLogin}>Войти</button>
  </div>
  );
};

export default Login;