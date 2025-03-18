import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8001"; // Vérifie cette URL

export const login = async (credentials: { email: string; password: string }) => {
  const formData = new FormData();
  formData.append("username", credentials.email);  
  formData.append("password", credentials.password);

  return axios.post(`${API_BASE_URL}/login`, formData, {
    headers: { "Content-Type": "multipart/form-data" }, 
  })
  .then(response => response.data)
  .catch(error => {
    console.error("Erreur API Login:", error.response?.data || error.message);
    throw error;
  });
};
