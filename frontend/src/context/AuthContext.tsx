import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";
import { jwtDecode } from "jwt-decode";



interface User {
  id: number;
  name: string;
  email: string;
}

interface LoginResponse {
  access_token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken: any = jwtDecode(token);
      setUser({ id: decodedToken.id, name: decodedToken.name, email: decodedToken.sub });
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<LoginResponse>("/login", { username: email, password });

      if (response.data && response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        setUser(response.data.user);
      } else {
        throw new Error("Réponse invalide du serveur.");
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
