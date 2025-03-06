import React, { useState } from "react";

const Login = ({ setAuthenticated }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
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