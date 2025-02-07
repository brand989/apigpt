import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Имитация входа
    navigate("/chat");
  };

  return (
    <div>
      <h1>Вход</h1>
      <button onClick={handleLogin}>Войти</button>
    </div>
  );
};

export default Login;