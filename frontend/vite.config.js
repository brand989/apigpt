import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // Фиксированный порт
    strictPort: true, // Если порт занят, не переключаться на другой
  },
});

// Обработчик закрытия сервера
const shutdown = () => {
  console.log("⏳ Завершение работы Vite...");
  process.exit(0);
};

process.on("SIGINT", shutdown);  // При нажатии Ctrl + C
process.on("SIGTERM", shutdown); // При завершении процесса (kill PID)