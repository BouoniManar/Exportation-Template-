// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import api from "../services/api"; // Votre instance Axios configurée
import { jwtDecode } from "jwt-decode";

// --- Interfaces ---
export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;// Doit correspondre à la clé DANS LA RÉPONSE JSON de /api/users/me
}

interface LoginApiResponse { 
  access_token: string;
  // user?: User; // Optionnel: si votre /auth/token renvoie aussi l'objet user
}

interface DecodedToken {
  id: number;
  name: string;
  sub: string; // Généralement l'email de l'utilisateur (sujet du token)
  // avatar_url?: string; // Si le token contenait l'avatar (moins fiable pour la fraîcheur)
  exp?: number;
  iat?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Indique si on charge l'état d'auth initial ou si on rafraîchit les données
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>; // Prend le token actuel du contexte
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    // Initialiser le token depuis localStorage au montage du composant
    if (typeof window !== 'undefined') { // S'assurer qu'on est côté client
        return localStorage.getItem("token");
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true); // Commence en chargement
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Fonction pour se déconnecter et nettoyer
  const performLogout = useCallback(() => {
    console.log("AuthContext: [performLogout] Déconnexion en cours...");
    localStorage.removeItem("token");
    // Optionnel: nettoyer d'autres données spécifiques à l'utilisateur du localStorage si besoin
    // if (user && user.id) { localStorage.removeItem(`userProfileData_${user.id}`); }
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  }, [/* setUser, setToken, setIsAuthenticated sont stables */]);


  // Fonction pour récupérer les données utilisateur fraîches du serveur
  // Elle utilise le 'token' actuel de l'état du AuthContext.
  const fetchAndSetUserFromServer = useCallback(async (currentToken: string) => {
    console.log("AuthContext: [fetchAndSetUserFromServer] Tentative de récupération des données utilisateur.");
    setIsLoading(true);
    try {
      // L'intercepteur Axios devrait ajouter "Bearer " au currentToken
      const response = await api.get<User>('/api/users/me'); 
      if (response.data) {
        console.log("AuthContext: [fetchAndSetUserFromServer] Données reçues:", JSON.stringify(response.data));
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        console.warn("AuthContext: [fetchAndSetUserFromServer] Pas de données reçues de /api/users/me. Déconnexion.");
        performLogout(); // Si /me ne renvoie rien, on considère l'auth comme échouée
      }
    } catch (error: any) {
      console.error("AuthContext: [fetchAndSetUserFromServer] Erreur /api/users/me:", error.response?.status, error.message);
      // Si 401 ou 403, le token est invalide/expiré
      if (error.response?.status === 401 || error.response?.status === 403) {
        performLogout();
      } else {
        // Pour d'autres erreurs réseau/serveur, on pourrait vouloir ne pas déconnecter
        // mais indiquer un état d'erreur. Pour l'instant, on ne change pas l'état d'auth.
        // On pourrait mettre isAuthenticated à false mais garder le user partiel du token ?
        // Pour la simplicité, si on ne peut pas confirmer l'utilisateur, on déconnecte.
        // performLogout(); // Ou setUser(null); setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [performLogout /* setUser, setIsAuthenticated, setIsLoading sont stables */]);


  // Effet pour initialiser l'état d'authentification au chargement de l'application
  // et réagir aux changements de 'token' (après login/logout)
  useEffect(() => {
    console.log("AuthContext: [useEffect on token change] Token actuel:", token ? "Présent" : "Absent");
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          console.warn("AuthContext: [useEffect on token change] Token dans localStorage est expiré. Déconnexion.");
          performLogout();
        } else {
          // Le token est structurellement valide et non expiré.
          // Maintenant, récupérons les données utilisateur complètes et à jour.
          console.log("AuthContext: [useEffect on token change] Token valide, appel à fetchAndSetUserFromServer.");
          fetchAndSetUserFromServer(token);
        }
      } catch (error) {
        console.error("AuthContext: [useEffect on token change] Token invalide dans localStorage. Déconnexion.", error);
        performLogout();
      }
    } else {
      // Pas de token, s'assurer que l'utilisateur est déconnecté
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false); // Chargement initial terminé (pas d'utilisateur)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, fetchAndSetUserFromServer, performLogout]); // `decodeAndSetUser` a été intégrée ici.

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      const response = await api.post<LoginApiResponse>("/auth/token", formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      if (response.data && response.data.access_token) {
        const newToken = response.data.access_token;
        localStorage.setItem("token", newToken);
        setToken(newToken); // Ceci déclenchera le useEffect ci-dessus, qui appellera fetchAndSetUserFromServer
        // setIsLoading(false) sera géré par le useEffect et fetchAndSetUserFromServer
      } else {
        setIsLoading(false); // Erreur avant d'obtenir un token
        throw new Error("Token non reçu du serveur ou réponse invalide.");
      }
    } catch (error) {
      console.error("AuthContext: Erreur de connexion:", error);
      performLogout(); // Nettoyer en cas d'échec de login
      setIsLoading(false);
      throw error; // Propager l'erreur pour que le composant de login puisse la gérer
    }
    // Pas de finally setIsLoading(false) ici, car le useEffect s'en charge après setToken
  };

  // Utiliser performLogout pour la fonction logout exposée
  const logout = useCallback(() => {
    performLogout();
  }, [performLogout]);

  // refreshUserData pour être appelé manuellement par les composants (ex: après upload avatar)
  const refreshUserDataExternal = useCallback(async () => {
    if (token) { // Utilise le token actuel de l'état
      await fetchAndSetUserFromServer(token);
    } else {
      console.warn("AuthContext: [refreshUserDataExternal] Tentative de rafraîchissement sans token.");
      // Optionnel: déconnecter si pas de token mais tentative de refresh
      // performLogout(); 
    }
  }, [token, fetchAndSetUserFromServer]);

  const contextValue: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUserData: refreshUserDataExternal, // Exposer la fonction de rafraîchissement
    setUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};