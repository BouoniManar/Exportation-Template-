// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from "react";
import api from "../services/api"; // Votre instance Axios préconfigurée
import { jwtDecode } from "jwt-decode";

// --- 1. Adapter l'interface User ---
export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string; // Champ avatar optionnel
  // Ajoutez d'autres champs si votre token JWT les contient
}

// Interface pour la réponse de l'API /login (si elle renvoie l'utilisateur)
// Si elle ne renvoie que le token, cette interface n'est pas utile ici.
interface LoginApiResponse {
  access_token: string;
  // Optionnel: si votre API /login renvoie les infos user
  // user?: User; // Adaptez si la structure est différente
}

// --- Interface pour le token décodé ---
// Définissez plus précisément ce que contient votre token JWT
interface DecodedToken {
  id: number;
  name: string; // Assurez-vous que 'name' est dans le token
  sub: string; // 'sub' contient généralement l'email ou l'ID utilisateur
  avatar_url?: string; // Exemple si vous mettez l'avatar dans le token
  exp?: number; // Date d'expiration (standard JWT)
  // Ajoutez d'autres champs de votre token
}

// --- 2. Adapter AuthContextType ---
interface AuthContextType {
  user: User | null;
  token: string | null; // Ajout du token pour référence potentielle
  isAuthenticated: boolean; // État d'authentification clair
  isLoading: boolean; // Pour gérer le chargement initial
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token")); // Lire le token initial
  const [isLoading, setIsLoading] = useState<boolean>(true); // Commence en chargement
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token); // Initialisé basé sur le token

  // --- 3. Ajuster le décodage du token ---
  const decodeAndSetUser = useCallback((currentToken: string | null) => {
    if (!currentToken) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }
    try {
      // Décoder le token
      const decodedToken = jwtDecode<DecodedToken>(currentToken);
      console.log("Token décodé:", decodedToken);

      // Vérifier l'expiration (optionnel mais recommandé)
      if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
         console.log("Token expiré.");
         throw new Error("Token expiré");
      }

      // Créer l'objet utilisateur à partir du token
      // ATTENTION: Assurez-vous que les noms de champs correspondent à votre token JWT !
      const userData: User = {
        id: decodedToken.id, // Assurez-vous que 'id' est dans le token
        name: decodedToken.name, // Assurez-vous que 'name' est dans le token
        email: decodedToken.sub, // 'sub' contient souvent l'email
        avatarUrl: decodedToken.avatar_url, // Lire depuis 'avatar_url' (ou le nom que vous utilisez)
      };

      setUser(userData);
      setIsAuthenticated(true);

    } catch (error) {
      console.error("Erreur de décodage ou token invalide/expiré:", error);
      localStorage.removeItem("token"); // Nettoyer si invalide
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
       setIsLoading(false); // Fin du chargement initial
    }
  }, []); // useCallback sans dépendances externes

  // --- Effet pour décoder le token au montage ou si le token change ---
  useEffect(() => {
    console.log("AuthProvider: Décodage du token actuel:", token);
    setIsLoading(true); // Commence le chargement à chaque vérification
    decodeAndSetUser(token);
  }, [token, decodeAndSetUser]); // Se redéclenche si 'token' change

  // --- 4. Adapter la fonction Login ---
  const login = async (email: string, password: string) => {
    // Votre API de login doit renvoyer au moins l'access_token
    // Elle peut optionnellement renvoyer les données utilisateur, mais ce n'est pas
    // strictement nécessaire si le token lui-même contient les infos.
    try {
      // Adaptez l'URL et le format des données si nécessaire (form-data ou JSON)
      // Votre API /login actuelle attendait 'username' et 'password' en form-data ?
      // Si elle attend du JSON:
      // const response = await api.post<LoginApiResponse>("/auth/token", { email, password });
      // Si elle attend form-data (plus courant pour /token avec FastAPI):
       const formData = new URLSearchParams();
       formData.append('username', email); // FastAPI s'attend souvent à 'username' pour OAuth2
       formData.append('password', password);
      const response = await api.post<LoginApiResponse>("/auth/token", formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });


      if (response.data && response.data.access_token) {
        const newToken = response.data.access_token;
        localStorage.setItem("token", newToken);
        setToken(newToken); // Met à jour l'état token, ce qui déclenchera useEffect pour décoder
        // Pas besoin de setUser directement ici si le token contient les infos
        // Si l'API renvoie aussi l'user:
        // if (response.data.user) {
        //   setUser(response.data.user);
        //   setIsAuthenticated(true);
        //   setIsLoading(false); // Chargement rapide si user est dans la réponse
        // }
      } else {
        throw new Error("Token non reçu du serveur.");
      }
    } catch (error) {
      // Relancer l'erreur pour que LoginForm puisse l'attraper et afficher un message
      console.error("Erreur dans AuthContext login:", error);
      throw error;
    }
  };

  // --- Fonction Logout (inchangée mais assure la mise à jour de l'état) ---
  const logout = () => {
    console.log("AuthProvider: Logout");
    localStorage.removeItem("token");
    setToken(null); // Déclenchera useEffect pour mettre user à null
    // setUser(null); // Redondant si useEffect gère via token null
    // setIsAuthenticated(false); // Redondant si useEffect gère via token null
  };

  // Fournir les valeurs
  const contextValue: AuthContextType = {
     user,
     token,
     isAuthenticated,
     isLoading,
     login,
     logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {/* Ne rend les enfants que si le chargement initial n'est pas en cours */}
      {/* Vous pouvez aussi afficher un spinner global ici */}
      {/* {!isLoading ? children : <div>Chargement global...</div>} */}
      {children}
    </AuthContext.Provider>
  );
};

// --- 5. Ajouter un Hook personnalisé ---
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};