// src/services/api.ts
import axios from 'axios';
// Essayez d'importer AxiosRequestConfig. S'il n'est pas trouvé, enlevez cette ligne.
// import { AxiosRequestConfig } from 'axios'; 

const API_BASE_URL = "http://127.0.0.1:8001"; 

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  // Option 1 (préférée si l'inférence fonctionne)
  (config) => { 
  // Option 2 (si AxiosRequestConfig est disponible et que vous voulez être explicite)
  // (config: AxiosRequestConfig) => {

    const token = localStorage.getItem('token'); 
    if (token) {
      config.headers = config.headers || {}; 
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;