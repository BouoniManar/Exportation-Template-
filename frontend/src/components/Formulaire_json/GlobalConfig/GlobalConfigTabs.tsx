// src/components/GlobalConfig/GlobalConfigTabs.tsx
import React from 'react';
import './Forms.css'; // Assurez-vous d'importer les styles nécessaires
import '../../../styles.css';

interface GlobalConfigTabsProps {
    activeTab: string; // L'ID de l'onglet actuellement actif
    onTabChange: (tabId: string) => void; // Fonction à appeler lors du clic
}

// --- CORRECTION : Mettre à jour la liste des onglets ---
const tabs = [
    // Garde les onglets existants
    { id: 'site-info', label: 'Configuration Globale', icon: 'fas fa-globe' },
    { id: 'theme', label: 'Thème & Styles', icon: 'fas fa-palette' },

    // Remplace les anciens 'header' et 'navigation' par le nouveau 'header-nav'
    { id: 'header-nav', label: 'Header & Navigation', icon: 'fas fa-window-maximize' }, // <<< NOUVEL ONGLET COMBINÉ

    // Garde les onglets suivants
    { id: 'footer', label: 'Footer', icon: 'fas fa-shoe-prints' },
    { id: 'pages-components', label: 'Pages & Composants', icon: 'fas fa-file-alt' },
    { id: 'output', label: 'Sortie JSON & ZIP', icon: 'fas fa-code' }
];
// --- FIN CORRECTION ---


const GlobalConfigTabs: React.FC<GlobalConfigTabsProps> = ({ activeTab, onTabChange }) => {
    return (
        <div className="app-tabs">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    // Appelle onTabChange avec l'ID correct ('header-nav' pour le combiné)
                    onClick={() => onTabChange(tab.id)}
                >
                    {tab.icon && <i className={tab.icon} style={{ marginRight: '8px' }}></i>}
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default GlobalConfigTabs;