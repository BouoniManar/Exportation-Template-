import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminLayout from '../../components/layout/AdminLayout'; // Assurez-vous d'avoir un layout admin
import StatCard from '../../components/dashboard/admin/StatCard'; // Réutiliser ou adapter StatCard
import ActionCardMinimal from '../../components/dashboard/admin/ActionCardMinimal'; // Réutiliser ActionCardMinimal

// Icônes pour l'admin (adaptées de TailAdmin et FontAwesome)
import {
    FaUsers,             // Nombre total d'utilisateurs
    FaFileExport,        // Templates générés
    FaUserShield,        // Rôles & Permissions (ou Supervision)
    FaChartLine,         // Activité de la plateforme
    FaServer,            // État du système / Serveur
    FaSpinner,
    FaExclamationTriangle,
    FaCog,               // Paramètres Généraux (si applicable pour l'admin)
    FaUsersCog,          // Gérer les utilisateurs (Action)
    FaCogs,              // Génération de templates (si l'admin peut y accéder)
    FaFileCode,          // Peut-être voir/gérer les JSONs bruts ?
    FaShieldAlt          // Supervision (Action)
} from 'react-icons/fa';
import { FiActivity, FiAlertOctagon, FiCpu } from 'react-icons/fi'; // Pour plus de variété

// Services (vous devrez créer ces services pour l'admin)
// import { getAdminDashboardStats, AdminDashboardStats } from '../../services/adminDashboardService';
// Placeholder pour les stats admin pour l'instant
interface AdminDashboardStats {
    totalUsers: number;
    templatesGeneratedTotal: number;
    activeUsersToday: number;
    platformHealth: 'Optimal' | 'Avertissement' | 'Critique';
    lastUserRegistration: string | null;
    jsonFilesManaged: number;
}


// Helper pour formater les dates (peut être externalisé)
const formatDate = (timestamp: string | null, format: 'short' | 'full' = 'short'): string => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    if (format === 'short') {
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    return date.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
};

const AdminPage: React.FC = () => {
    // Remplacer UserDashboardStats par AdminDashboardStats
    const [stats, setStats] = useState<AdminDashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAdminStats = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Décommentez et implémentez quand le service admin sera prêt
            // const data = await getAdminDashboardStats();
            // setStats(data);

            // --- DONNÉES MOCK POUR L'INSTANT ---
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simuler un délai réseau
            setStats({
                totalUsers: 1250,
                templatesGeneratedTotal: 3480,
                activeUsersToday: 452,
                platformHealth: 'Optimal',
                lastUserRegistration: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 5).toISOString(), // Inscription récente
                jsonFilesManaged: 875,
            });
            // --- FIN DES DONNÉES MOCK ---

        } catch (err: any) {
            console.error("Admin Dashboard fetch error:", err);
            const errorMessage = err.response?.data?.detail || err.message || "Erreur lors du chargement des données du dashboard administrateur.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdminStats();
    }, [fetchAdminStats]);

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex flex-col justify-center items-center h-[calc(100vh-8rem)] text-slate-500">
                    <FaSpinner className="animate-spin h-12 w-12 text-indigo-600 mb-4" />
                    <p className="text-lg">Chargement du tableau de bord administrateur...</p>
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
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
                                    onClick={fetchAdminStats}
                                    className="px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                >
                                    Réessayer le chargement
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <ToastContainer position="top-right" autoClose={4000} theme="colored" hideProgressBar={false} newestOnTop />

            <header className="mb-8 md:mb-10">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
                    Tableau de Bord Administrateur
                </h1>
                <p className="mt-2 text-base text-slate-500">
                    Vue d'ensemble de la plateforme JsonToUI.
                </p>
            </header>

            {/* Section des Cartes de Statistiques Admin - Style TailAdmin */}
            <section aria-labelledby="admin-stats-heading" className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5 mb-8 md:mb-10">
                <StatCard
                    title="Utilisateurs Inscrits"
                    value={stats?.totalUsers.toLocaleString() ?? "0"}
                    icon={FaUsers}
                    iconColor="text-blue-500 bg-blue-100" // TailAdmin style
                    trend="up" // Exemple
                    trendValue="+12 depuis hier" // Exemple
                    cardClassName="bg-white dark:bg-boxdark shadow-default" // TailAdmin style
                />
                <StatCard
                    title="Templates Générés (Total)"
                    value={stats?.templatesGeneratedTotal.toLocaleString() ?? "0"}
                    icon={FaFileExport}
                    iconColor="text-green-500 bg-green-100"
                    trend="up"
                    trendValue="+50 cette semaine"
                    cardClassName="bg-white dark:bg-boxdark shadow-default"
                />
                <StatCard
                    title="Utilisateurs Actifs (24h)"
                    value={stats?.activeUsersToday.toLocaleString() ?? "0"}
                    icon={FiActivity}
                    iconColor="text-orange-500 bg-orange-100"
                    cardClassName="bg-white dark:bg-boxdark shadow-default"
                />
                <StatCard
                    title="Santé Plateforme"
                    value={stats?.platformHealth ?? "N/A"}
                    icon={stats?.platformHealth === 'Optimal' ? FaShieldAlt : FiAlertOctagon}
                    iconColor={
                        stats?.platformHealth === 'Optimal' ? "text-teal-500 bg-teal-100" :
                        stats?.platformHealth === 'Avertissement' ? "text-yellow-500 bg-yellow-100" :
                        "text-red-500 bg-red-100"
                    }
                    cardClassName="bg-white dark:bg-boxdark shadow-default"
                />
            </section>

            {/* Section Actions Rapides Admin */}
            <section aria-labelledby="admin-quick-actions-heading" className="mb-8 md:mb-10">
                <h2 id="admin-quick-actions-heading" className="text-2xl font-semibold mb-6 text-slate-700">
                    Gestion et Supervision
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ActionCardMinimal
                        title="Gérer les Utilisateurs"
                        description="Consulter, modifier ou supprimer des comptes utilisateurs."
                        linkTo="/admin/users" // Assurez-vous que cette route est définie
                        icon={FaUsersCog}
                        bgColorClass="bg-sky-50" // Couleurs plus douces
                        textColorClass="text-sky-700"
                        borderColorClass="border-sky-200"
                        className="hover:shadow-lg"
                    />
                    <ActionCardMinimal
                        title="Superviser la Plateforme"
                        description="Voir les logs, l'état du système et les métriques de performance."
                        linkTo="/admin/platform-supervision" // Assurez-vous que cette route est définie
                        icon={FaShieldAlt}
                        bgColorClass="bg-emerald-50"
                        textColorClass="text-emerald-700"
                        borderColorClass="border-emerald-200"
                        className="hover:shadow-lg"
                    />
                    <ActionCardMinimal
                        title="Statistiques Détaillées" // Lien vers une page plus détaillée
                        description="Analyser les tendances d'utilisation et de génération de templates."
                        linkTo="/admin/analytics" // Nouvelle route potentielle
                        icon={FaChartLine}
                        bgColorClass="bg-purple-50"
                        textColorClass="text-purple-700"
                        borderColorClass="border-purple-200"
                        className="hover:shadow-lg"
                    />
                     {/* Vous pouvez ajouter d'autres actions ici si nécessaire */}
                    <ActionCardMinimal
                        title="Configuration Générale"
                        description="Ajuster les paramètres globaux de l'application JsonToUI."
                        linkTo="/admin/settings"
                        icon={FaCog}
                        bgColorClass="bg-slate-50"
                        textColorClass="text-slate-700"
                        borderColorClass="border-slate-200"
                        className="hover:shadow-lg"
                    />
                </div>
            </section>

            {/* Section d'information supplémentaire - Style TailAdmin */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-2 2xl:gap-7.5">
                <div className="rounded-lg border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                    <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
                        Dernières Inscriptions
                    </h4>
                    {/* Ici, vous pourriez lister les derniers utilisateurs inscrits */}
                    {/* Exemple statique */}
                    <div className="flex flex-col">
                        <div className="py-3 px-1 border-b border-gray-200 dark:border-strokedark">
                           <p className="text-sm text-gray-700 dark:text-gray-200">Utilisateur A - {formatDate(stats?.lastUserRegistration ?? null)}</p>
                        </div>
                        <div className="py-3 px-1 border-b border-gray-200 dark:border-strokedark">
                            <p className="text-sm text-gray-700 dark:text-gray-200">Utilisateur B - {formatDate(new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString())}</p>
                        </div>
                        <div className="py-3 px-1">
                            <Link to="/admin/users" className="text-sm text-blue-600 hover:underline">Voir tous les utilisateurs...</Link>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                    <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
                        État du Système
                    </h4>
                     <div className="flex flex-col items-center justify-center h-full py-4">
                        <FiCpu className="h-16 w-16 text-green-500 mb-3" />
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-200">Serveurs Opérationnels</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tous les services fonctionnent normalement.</p>
                    </div>
                </div>
            </div>

        </AdminLayout>
    );
};

export default AdminPage;