import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Фиксированный порт
    strictPort: true, // Если порт занят, не переключаться на другой
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

// Обработчик закрытия сервера
const shutdown = () => {
  console.log("⏳ Завершение работы Vite...");
  process.exit(0);
};

process.on("SIGINT", shutdown);  // При нажатии Ctrl + C
process.on("SIGTERM", shutdown); // При завершении процесса (kill PID)