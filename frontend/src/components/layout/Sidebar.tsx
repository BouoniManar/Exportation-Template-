// src/components/layout/Sidebar.tsx
import React from 'react'; // React est nécessaire
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt, FaFileCode, FaCogs, FaCog, FaSignOutAlt, FaUserEdit, FaUserCircle // Ajout FaUserCircle pour fallback avatar
} from 'react-icons/fa';
import { IconType } from 'react-icons';
import { useAuth } from '../../context/AuthContext'; // <--- Importer le hook useAuth

// Interface et liens (inchangés)
interface NavLinkItem { name: string; icon: IconType; path: string; }
const navigationLinks: NavLinkItem[] = [
  { name: 'Dashboard', icon: FaTachometerAlt, path: '/dashboard' },
  { name: 'Editeur JSON', icon: FaFileCode, path: '/generate-json' },
  { name: 'Générateur Template', icon: FaCogs, path: '/generate-template' },
  { name: 'Paramètres', icon: FaCog, path: '/settings' },
  { name: 'Gérer Profil', icon: FaUserEdit, path: '/profile' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  // --- Utilisation du Contexte d'Authentification ---
  const { user, logout, isLoading } = useAuth(); // Récupère les données et fonctions du contexte
  // -------------------------------------------------

  const handleLogout = () => {
    logout(); // Appelle la fonction logout du contexte
    // La redirection est gérée par le contexte ou les routes protégées
  };

  // Styles (inchangés)
  const linkClasses = "flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200";
  const activeLinkClasses = "bg-gray-700 text-white font-semibold";

  // Fonction pour afficher l'avatar ou un fallback
  const renderSidebarAvatar = () => {
      // Afficher un placeholder pendant le chargement
      if (isLoading) {
        return <div className="w-20 h-20 rounded-full mb-3 bg-gray-700 animate-pulse"></div>;
      }
      // Si l'utilisateur est chargé
      if (user) {
        if (user.avatarUrl) {
          return (
            <img
              src={user.avatarUrl}
              alt={`Avatar de ${user.name}`}
              onError={(e) => (e.currentTarget.src = '/images/default-avatar.png')} // Fallback image par défaut
              className="w-20 h-20 rounded-full mb-3 object-cover border-2 border-gray-600 bg-gray-700"
            />
          );
        } else if (user.name) {
          // Afficher les initiales si pas d'avatar mais un nom
          const initials = user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
          return (
             <span className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-600 text-white text-2xl font-semibold mb-3 border-2 border-gray-600">
                {initials}
             </span>
           );
        }
      }
      // Fallback ultime: icône générique si pas d'user ou pas d'infos
      return <FaUserCircle className="w-20 h-20 text-gray-500 mb-3" />;
  };

  return (
    <div className="hidden md:flex md:flex-col md:w-64 bg-gray-800 text-white flex-shrink-0 h-full">
      {/* Logo / Titre */}
      <div className="flex items-center justify-center h-16 border-b border-gray-700 flex-shrink-0 px-4">
        <Link to="/dashboard" className="text-xl font-bold text-white hover:text-gray-200 truncate">
           Mon Projet
        </Link>
      </div>

      {/* Carte Profil Utilisateur (Dynamique) */}
      <div className="p-4 mt-4 mb-2 flex flex-col items-center text-center border-b border-gray-700 pb-4 flex-shrink-0">
        {renderSidebarAvatar()} {/* Utilise la fonction pour l'avatar */}
        <p className="text-sm font-semibold text-gray-100">
          {isLoading ? 'Chargement...' : user ? 'Bienvenue !' : 'Non connecté'}
        </p>
        {/* Affiche le nom seulement si user existe et n'est pas en chargement */}
        {!isLoading && user && (
            <p className="text-xs text-gray-400 mt-1 truncate">{user.name}</p>
        )}
      </div>

      {/* Conteneur Navigation + Déconnexion */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Navigation Principale */}
        <nav className="flex-1 px-2 py-2 space-y-1">
          {navigationLinks.map((link) => {
            const LinkIcon = link.icon as React.ElementType;
            return (
              <NavLink key={link.name} /* ... */ to={''} /* ... */ >
                {LinkIcon && <LinkIcon /* ... */ />}
                <span className="truncate">{link.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bouton Déconnexion */}
        <div className="px-2 py-4 border-t border-gray-700 flex-shrink-0">
           {(() => {
              const LogoutIcon = FaSignOutAlt as React.ElementType;
              // Affiche le bouton seulement si l'utilisateur est authentifié et pas en chargement
              return !isLoading && user ? (
                 <button onClick={handleLogout} className={`${linkClasses} w-full text-left`} >
                    {LogoutIcon && <LogoutIcon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />}
                    <span className="truncate">Déconnexion</span>
                  </button>
              ) : null; // Ne rien afficher si non connecté ou en chargement
           })()}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;