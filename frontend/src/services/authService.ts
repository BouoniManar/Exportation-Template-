import axios from "axios";
import { LoginFormValues, LoginResponse } from "../types/authTypes"; 

const API_BASE_URL = "http://127.0.0.1:8001"; 

export const login = async (values: LoginFormValues): Promise<LoginResponse> => {
  try {
    const formData = new FormData();
    formData.append("username", values.email);  
    formData.append("password", values.password);

    const response = await axios.post<LoginResponse>(`${API_BASE_URL}/login`, formData, {
      headers: { "Content-Type": "multipart/form-data" }, 
    });

    return response.data;
  } catch (error) {
    console.error("Erreur de connexion:", error);
    throw error;
  }
};
