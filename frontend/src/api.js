const API_URL = "/api";

export async function getServerStatus() {
  try {
    const response = await fetch(`${API_URL}/status`);
    return await response.json();
  } catch (error) {
    console.error("Ошибка запроса:", error);
    return { error: "Ошибка соединения с сервером" };
  }
}