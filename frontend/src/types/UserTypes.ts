// src/types/userTypes.ts
export interface User {
  id: number;
  name: string | null; // Permettre null si 'name' peut être null en base
  email: string;
  role: 'admin' | 'user' | string; // Soyez aussi précis que possible pour les rôles
  is_active: boolean;             // Propriété ATTENDUE et NÉCESSAIRE
  created_at: string;           // Propriété ATTENDUE et NÉCESSAIRE (chaîne ISO)
  avatar_url?: string | null;    // Optionnel
  // Ajoutez d'autres champs que votre API pourrait renvoyer
}