

// Structure des données envoyées pour la connexion
export interface LoginFormValues {
  email: string;
  password: string;
}

// Structure des données retournées par l'API après la connexion
export interface LoginResponse {
  access_token: string;
  message?: string; 
}
