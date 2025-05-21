// src/services/dashboardService.ts
import api from './api'; // Votre instance configurée d'axios ou fetch

export interface UserDashboardStats {
    projectCount: number;
    templatesGenerated: number;
    lastActivityTimestamp: string; // ISO string date
    activeIncidents: number;
    pausedItems: number;
}

export const getDashboardStats = async (): Promise<UserDashboardStats> => {
    try {
        const response = await api.get<UserDashboardStats>('/api/dashboard/stats'); // Adaptez l'URL de l'endpoint
        return response.data;
    } catch (error: any) {
        console.error("Failed to fetch dashboard stats:", error);
        // Propagez l'erreur pour la gérer dans le composant ou retournez des valeurs par défaut
        throw error.response?.data || new Error("Erreur lors de la récupération des statistiques du dashboard.");
    }
};