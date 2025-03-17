import axios from "axios";
import { LoginFormValues, RegisterFormValues } from "../types/authTypes";

const API_URL = "http://localhost:8001"; // Remplacez par votre URL backend

export const login = async (data: LoginFormValues) => {
  return axios.post(`${API_URL}/login`, data);
};

export const register = async (data: RegisterFormValues) => {
  return axios.post(`${API_URL}/register`, data);
};
