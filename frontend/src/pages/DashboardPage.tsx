// src/pages/DashboardPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate pour l'édition
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import ActionCardMinimal from '../components/dashboard/ActionCardMinimal';
import { getDashboardStats, UserDashboardStats } from '../services/dashboardService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Icônes
import {
    FaFileSignature, // Remplacer FaFileCode pour Éditeur JSON
    FaCogs,
    FaProjectDiagram,
    FaHistory, // Remplacer FaClock pour Dernière Activité
    FaSpinner,
    FaExclamationTriangle,
    FaCheckCircle,
    FaPauseCircle,
    FaLightbulb, // Remplacer FaBolt pour Actions Rapides
    FaUserEdit,  // Remplacer FaUsersCog pour Gérer Profil
    FaSlidersH, // Remplacer FaTools pour Paramètres
    FaLayerGroup // Remplacer FaListAlt pour Mes Templates
} from 'react-icons/fa';
import { FiBarChart2, FiAlertOctagon, FiActivity, FiPower, FiSettings } from 'react-icons/fi'; // Pour plus de variété

// Helper pour formater la date de dernière activité (peut être externalisé)
const formatLastActivity = (timestamp: string | null): string => {
    if (!timestamp) return 'Indisponible';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMilliseconds = now.getTime() - date.getTime();
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 7 || diffInDays < 0) { // Gérer les dates futures ou très anciennes
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('fr-FR', options);
    }
    if (diffInDays > 0) return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    if (diffInHours > 0) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    if (diffInMinutes > 0) return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    if (diffInSeconds < 5) return "À l'instant";
    return `Il y a ${diffInSeconds} sec`;
};

const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState<UserDashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    // const navigate = useNavigate(); // Décommentez si vous implémentez le bouton Éditer

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getDashboardStats();
            setStats(data);
        } catch (err: any) {
            console.error("Dashboard fetch error:", err);
            const errorMessage = err.response?.data?.detail || err.message || "Erreur lors du chargement des données du dashboard.";
            setError(errorMessage);
            // Le toast est bien, mais on peut le conditionner si on affiche déjà un message d'erreur complet
            // toast.error(errorMessage, { autoClose: 5000 });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // État de chargement
    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col justify-center items-center h-[calc(100vh-8rem)] text-slate-500"> {/* 8rem est une estimation de la hauteur du header du layout */}
                    <FaSpinner className="animate-spin h-12 w-12 text-indigo-500 mb-4" />
                    <p className="text-lg">Chargement de votre espace de travail...</p>
                </div>
            </DashboardLayout>
        );
    }

    // État d'erreur
    if (error) {
        return (
            <DashboardLayout>
                <div className="max-w-2xl mx-auto mt-10 bg-red-50 p-6 sm:p-8 rounded-xl shadow-lg border-l-4 border-red-500">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <FaExclamationTriangle className="h-8 w-8 text-red-500" aria-hidden="true" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold text-red-800">Oops! Une erreur est survenue.</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{error}</p>
                            </div>
                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={fetchStats}
                                    className="px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                >
                                    Réessayer le chargement
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Affichage principal du Dashboard
    return (
        <DashboardLayout>
            <ToastContainer position="bottom-right" autoClose={4000} theme="colored" hideProgressBar={false} newestOnTop />

            {/* Section d'en-tête de la page */}
            <header className="mb-10 md:mb-12">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
                    Mon Espace
                </h1>
                <p className="mt-2 text-base text-slate-500">
                    Bienvenue ! Voici un aperçu rapide de vos activités et statistiques.
                </p>
            </header>

            {/* Section des Cartes de Statistiques */}
            <section aria-labelledby="stats-heading" className="mb-10 md:mb-12">
                <h2 id="stats-heading" className="sr-only">Statistiques Clés</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 md:gap-6"> {/* Ajusté à 3 colonnes pour plus de focus */}
                    {/* Ligne 1 */}
                    <StatCard
                        title="Projets Actifs" // Changé de "Disponibilité Moy."
                        value={stats?.projectCount ?? "0"} // Utiliser les vraies données
                        icon={FaProjectDiagram}
                        iconColor="text-blue-500" // Cohérent
                        description="Nombre total de projets créés."
                        trend={stats && stats.projectCount > 5 ? 'up' : 'neutral'} // Exemple de tendance
                        trendValue={stats && stats.projectCount > 5 ? '+2 récents' : undefined}
                    />
                    <StatCard
                        title="Templates Générés"
                        value={stats?.templatesGenerated ?? "0"}
                        icon={FaCogs}
                        iconColor="text-teal-500"
                        description="Nombre total de templates sauvegardés."
                    />
                     <StatCard
                        title="Dernière Activité"
                        value={formatLastActivity(stats?.lastActivityTimestamp ?? null)}
                        icon={FaHistory} // Changé pour FaHistory
                        iconColor="text-purple-500"
                        description="Votre interaction la plus récente sur la plateforme."
                    />
                    {/* Optionnel : Ligne 2 pour plus de stats si nécessaire, ou les masquer */}
                    {/*
                    <StatCard
                        title="Incidents Actifs"
                        value={stats?.activeIncidents ?? "0"}
                        icon={FiAlertOctagon} // Alternative
                        iconColor={stats?.activeIncidents && stats.activeIncidents > 0 ? "text-red-500" : "text-slate-400"}
                        description="Problèmes nécessitant attention."
                    />
                    <StatCard
                        title="Opérations en Pause"
                        value={stats?.pausedItems ?? "0"}
                        icon={FaPauseCircle}
                        iconColor={stats?.pausedItems && stats.pausedItems > 0 ? "text-amber-500" : "text-slate-400"}
                        description="Éléments en attente ou désactivés."
                    />
                    <StatCard
                        title="Stat Placeholder"
                        value={"N/A"}
                        icon={FiBarChart2} // Alternative
                        iconColor="text-slate-400"
                        description="Une autre statistique importante."
                    />
                    */}
                </div>
            </section>

            {/* Section Actions Rapides */}
            <section aria-labelledby="quick-actions-heading">
                <h2 id="quick-actions-heading" className="text-2xl font-semibold mb-6 text-slate-700 flex items-center">
                    <FaLightbulb className="mr-3 text-amber-500 text-2xl" /> {/* Icône et couleur changées */}
                    Actions Rapides
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6"> {/* Maintenu à 2 pour la simplicité */}
                    <ActionCardMinimal
                        title="Éditeur JSON"
                        description="Créez ou modifiez la structure JSON brute de vos configurations de template."
                        linkTo="/generate-json"
                        icon={FaFileSignature} // Icône changée
                        bgColorClass="bg-sky-100"
                        textColorClass="text-sky-600"
                        className="hover:border-sky-300"
                    />
                    <ActionCardMinimal
                        title="Générateur de Template"
                        description="Utilisez l'assistant pas à pas pour configurer et générer un nouveau template web."
                        linkTo="/generate-template"
                        icon={FaCogs}
                        bgColorClass="bg-indigo-100"
                        textColorClass="text-indigo-600"
                        className="hover:border-indigo-300"
                    />
                     {/* Cartes d'action supplémentaires (optionnel) */}
                    <ActionCardMinimal
                        title="Mes Templates"
                        description="Visualisez, téléchargez ou supprimez vos templates précédemment générés."
                        linkTo="/my-templates" // Assurez-vous que cette route est correcte
                        icon={FaLayerGroup} // Icône changée
                        bgColorClass="bg-emerald-100"
                        textColorClass="text-emerald-600"
                        className="hover:border-emerald-300"
                    />
                    <ActionCardMinimal
                        title="Gérer mon Profil"
                        description="Mettez à jour vos informations personnelles et paramètres de compte."
                        linkTo="/profile" // Assurez-vous que cette route est correcte
                        icon={FaUserEdit} // Icône changée
                        bgColorClass="bg-rose-100"
                        textColorClass="text-rose-600"
                        className="hover:border-rose-300"
                    />
                </div>
            </section>
        </DashboardLayout>
    );
};

export default DashboardPage;