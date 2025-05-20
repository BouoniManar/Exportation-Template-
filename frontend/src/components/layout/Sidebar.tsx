// src/components/layout/Sidebar.tsx
import React from 'react';
// MODIFICATION 1: Importer useNavigate
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt, FaFileCode, FaCogs, FaCog, FaSignOutAlt, FaUserEdit, FaUserCircle ,FaListAlt
} from 'react-icons/fa';
import { IconType } from 'react-icons';
import { useAuth } from '../../context/AuthContext';
import { faListAlt } from '@fortawesome/free-solid-svg-icons';
interface NavLinkItem {
  name: string;
  icon: IconType;
  path: string;
}

const navigationLinks: NavLinkItem[] = [
  { name: 'Dashboard', icon: FaTachometerAlt, path: '/dashboard' },
  { name: 'Editeur JSON', icon: FaFileCode, path: '/generate-json' },
  { name: 'Générateur Template', icon: FaCogs, path: '/generate-template' },
  { name: 'Mes Templates', icon: FaListAlt, path: '/my-templates' },
  { name: 'Paramètres', icon: FaCog, path: '/settings' },
  { name: 'Gérer Profil', icon: FaUserEdit, path: '/profile' },
];
const API_BASE_URL = "http://127.0.0.1:8001";


const Sidebar = () => {
  const { user, logout, isLoading } = useAuth();
  // MODIFICATION 2: Initialiser useNavigate
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Appel de la fonction logout du contexte
    // MODIFICATION 3: Naviguer vers /login
    navigate('/login');
  };

  const baseLinkClasses = "flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 group";
  const activeLinkClasses = "bg-gray-700 text-white font-semibold";
  const iconBaseClasses = "mr-3 h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-300 transition-colors duration-200";
  const iconActiveClasses = "text-white";

  const renderSidebarAvatar = () => {
    const avatarContainerClasses = "w-16 h-16 mb-2";
    const avatarInitialFontSize = "text-xl";

    if (isLoading) {
      return <div className={`${avatarContainerClasses} rounded-full bg-gray-700 animate-pulse`}></div>;
    }

    if (user) {
      if (user.avatarUrl) {
       const fullAvatarUrl = user.avatarUrl.startsWith('http') || user.avatarUrl.startsWith('blob:')
          ? user.avatarUrl
          : `${API_BASE_URL}${user.avatarUrl}`;
           return (
          <img
            key={fullAvatarUrl} // Ajout d'une key
            src={fullAvatarUrl}
            alt={`Avatar de ${user.name || 'Utilisateur'}`}
            onError={(e) => { /* ta logique onError */ }}
            className={`${avatarContainerClasses} rounded-full object-cover border-2 border-gray-600 bg-gray-700`}
          />
        );
      } else if (user.name) {
        const initials = user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        return (
           <span className={`flex items-center justify-center ${avatarContainerClasses} rounded-full bg-blue-600 text-white ${avatarInitialFontSize} font-semibold border-2 border-gray-600`}>
              {initials}
           </span>
         );
      }
    }
    return <FaUserCircle className={`${avatarContainerClasses} text-gray-500`} />;
  };

  return (
    <div className="hidden md:flex md:flex-col md:w-64 bg-gray-800 text-white flex-shrink-0 h-full shadow-lg">
      <div className="flex items-center justify-center h-14 border-b border-gray-700 flex-shrink-0 px-3">
        <Link to="/dashboard" className="text-lg font-bold text-white hover:text-gray-200 truncate">
           JsonToUI
        </Link>
      </div>

      <div className="p-3 mt-2 mb-1 flex flex-col items-center text-center border-b border-gray-700 pb-3 flex-shrink-0">
        {renderSidebarAvatar()}
        {isLoading ? (
          <p className="text-xs text-gray-400">Chargement...</p>
        ) : user ? (
          <>
            <p className="text-sm font-semibold text-gray-100 mt-1 truncate w-full" title={user.name || undefined}>
              {user.name || 'Welcome'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5 truncate w-full" title={user.email || undefined}>
              {user.email || 'Aucun email'}
            </p>
          </>
        ) : (
          <p className="text-xs text-gray-400">Non connecté</p>
        )}
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-1.5 space-y-0.5">
          {navigationLinks.map((link) => {
            const LinkIcon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    {LinkIcon && (
                      <LinkIcon
                        className={`${iconBaseClasses} ${isActive ? iconActiveClasses : ''}`}
                        aria-hidden="true"
                      />
                    )}
                    <span className="truncate text-sm">{link.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="px-2 py-2.5 mt-auto border-t border-gray-700 flex-shrink-0">
           {(() => {
              if (isLoading || !user) {
                  return null;
              }
              const LogoutIcon = FaSignOutAlt;
              return (
                 <button
                    onClick={handleLogout} // handleLogout contient maintenant la navigation
                    className={`${baseLinkClasses} w-full text-left`}
                  >
                    {LogoutIcon && (
                      <LogoutIcon
                        className={`${iconBaseClasses}`}
                        aria-hidden="true"
                      />
                    )}
                    <span className="truncate text-sm">Déconnexion</span>
                  </button>
              );
           })()}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;