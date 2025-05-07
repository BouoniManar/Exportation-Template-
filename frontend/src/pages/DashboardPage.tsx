// src/pages/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard'; // Utilise la version mise à jour
import ActionCard from '../components/dashboard/ActionCard';
import ActionCardMinimal from '../components/dashboard/ActionCardMinimal';
// Import des icônes (vous pouvez en ajouter/changer)
import {
  FaFileCode, FaCogs, FaProjectDiagram, FaClock, FaSpinner, FaExclamationTriangle, FaCheckCircle, FaPauseCircle, FaExclamationTriangle as FaIncident // Alias pour Active Incidents
} from 'react-icons/fa';

// Interface et fetch (inchangés)
interface DashboardStats {
  projectCount: number | null;
  templatesGenerated: number | null;
  lastActivity: string | null;
  // Peut-être ajouter d'autres stats comme activeIncidents etc.
  activeIncidents?: number | null;
  pausedMonitors?: number | null; // Exemple
}
const fetchDashboardData = (): Promise<DashboardStats> => {
   return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        projectCount: 7,
        templatesGenerated: 15,
        lastActivity: "Hier",
        activeIncidents: 0, // Donnée exemple
        pausedMonitors: 0, // Donnée exemple
      });
    }, 1500);
  });
};


const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ... (logique fetch) ...
    setLoading(true); setError(null); fetchDashboardData()
      .then(setStats).catch(err => { console.error(err); setError("Erreur chargement stats."); })
      .finally(() => setLoading(false));
  }, []);

  const SpinnerIcon = FaSpinner as React.ElementType;
  const ErrorAlertIcon = FaExclamationTriangle as React.ElementType; // Renommé pour clarté

  if (loading) { /* ... Affichage chargement ... */
     return <DashboardLayout><div className="flex justify-center items-center h-64"><SpinnerIcon className="animate-spin h-8 w-8 text-gray-500" /><span className="ml-3">Chargement...</span></div></DashboardLayout>;
   }
  if (error) { /* ... Affichage erreur ... */
    return <DashboardLayout><div className="bg-red-100 ..."><ErrorAlertIcon className="inline ..."/><strong>Erreur:</strong><span>{error}</span></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Mon Espace</h1>

      {/* Section Stats - Style mis à jour */}
      {/* Utilisation d'une grille à 6 colonnes pour potentiellement mieux correspondre à l'exemple */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {/* Vous pouvez réorganiser ou ajouter/supprimer des cartes ici */}
        {/* Exemple: 1ère ligne comme la capture */}
         <StatCard title="Disponibilité Moy." value={"100%"} icon={FaCheckCircle} iconColor="text-green-500" />
         <StatCard title="Incidents Actifs" value={stats?.activeIncidents ?? 0} icon={FaIncident} iconColor="text-red-500" />
         <StatCard title="En Pause" value={stats?.pausedMonitors ?? 0} icon={FaPauseCircle} iconColor="text-yellow-500" />

         {/* Exemples adaptés à votre projet (vous pouvez les garder ou les remplacer) */}
         <StatCard title="Projets Créés" value={stats?.projectCount ?? '...'} icon={FaProjectDiagram} iconColor="text-blue-500" />
         <StatCard title="Templates Générés" value={stats?.templatesGenerated ?? '...'} icon={FaCogs} iconColor="text-teal-500" />
         <StatCard title="Dernière Activité" value={stats?.lastActivity ?? '...'} icon={FaClock} iconColor="text-purple-500" />
      </div>

      {/* Section Actions (inchangée pour l'instant) */}
      <h2 className="text-2xl font-semibold mb-5 text-gray-700">Actions Rapides</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"> {/* Plus de colonnes possibles */}
      <ActionCardMinimal
        title="Éditeur JSON"
        linkTo="/generate-json"
        icon={FaFileCode} // Assurez-vous que FaFileCode est importé
        iconColor="text-gray-700" // Couleur plus sobre peut-être?
      />
      <ActionCardMinimal
        title="Générateur Template"
        linkTo="/generate-template"
        icon={FaCogs} // Assurez-vous que FaCogs est importé
        iconColor="text-gray-700"
      />
      {/* Ajoutez d'autres cartes si nécessaire */}
      {/* <ActionCardMinimal title="Autre Action" linkTo="/autre" icon={FaAutreIcone} /> */}
    </div>
      

    </DashboardLayout>
  );
};

export default DashboardPage;