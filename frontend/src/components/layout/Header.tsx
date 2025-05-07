// src/components/layout/Header.tsx
import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaCalendarAlt, FaBell, FaUserCircle, FaSignOutAlt, FaCog, FaChevronDown } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // Optionnel pour animations
import { useAuth } from '../../context/AuthContext'; // <--- 1. Importer useAuth

const Header = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate(); // Gardé si d'autres navigations sont nécessaires

  // --- 2. Utiliser useAuth pour obtenir user, logout, isLoading ---
  const { user, logout, isLoading } = useAuth();
  // -------------------------------------------------------------

  // --- L'objet user factice est maintenant inutile ---
  // const user_factice = {
  //   name: "Manar Bouoni",
  //   avatarUrl: "/images/default-avatar.png",
  // };
  // -----------------------------------------------

  // --- Notifications (Exemple Factice - Reste comme dans votre code) ---
  const notifications = [
    { id: 1, text: "Nouveau template généré !", time: "10 min ago", read: false },
    { id: 2, text: "Projet 'Site Vitrine' mis à jour.", time: "1 heure ago", read: true },
    { id: 3, text: "Erreur de génération pour 'Test API'.", time: "Hier", read: false },
  ];
  const unreadCount = notifications.filter(n => !n.read).length;
  // ---

  // Fermer les menus si on clique en dehors (Inchangé)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handleLogout = () => {
    console.log("Déconnexion depuis Header...");
    logout(); // Appel de la fonction logout du contexte (qui devrait vider le token et l'état user)
    setIsUserMenuOpen(false); // Ferme le menu déroulant localement
    navigate('/login'); // <-- REDIRECTION EXPLICITE VERS LA PAGE DE LOGIN
  };

  const handleNotificationClick = (id: number) => {
    console.log(`Notification ${id} cliquée`);
    setIsNotificationsOpen(false);
  };

  // Fonction pour générer l'avatar ou les initiales (Utilise 'user' du contexte)
  const renderAvatar = () => {
    const avatarBaseClasses = "w-8 h-8 rounded-full object-cover";
    if (isLoading) return <div className={`${avatarBaseClasses} bg-gray-300 animate-pulse`}></div>;
    // --- 3. Utilise 'user' du contexte ---
    if (user && user.avatarUrl) {
      return <img src={user.avatarUrl} onError={(e) => (e.currentTarget.src = '/images/default-avatar.png')} alt="Avatar" className={`${avatarBaseClasses} bg-gray-300`} />;
    } else if (user && user.name) {
      const initials = user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
      return <span className={`flex items-center justify-center ${avatarBaseClasses} bg-blue-500 text-white text-xs font-semibold`}>{initials}</span>;
    }
    // ----------------------------------
    return <FaUserCircle className="w-8 h-8 text-gray-400" />; // Fallback si pas d'user ou d'infos
  };

  // Styles pour les éléments des menus déroulants (Inchangé)
  const menuItemClasses = "flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900";


  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 md:px-6 flex-shrink-0 border-b border-gray-200 z-20 relative"> {/* z-index maintenu */}

      {/* Côté Gauche: Recherche et Sélecteur de Date (CONSERVÉ) */}
      <div className="flex items-center space-x-4">
        <div className="relative hidden md:block"> {/* Caché sur mobile */}
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-4 w-4 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Search..."
            className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" // ring-1 ajouté pour style focus
          />
        </div>
        <button className="flex items-center text-sm text-gray-600 hover:text-gray-800 p-2 rounded-md hover:bg-gray-100 whitespace-nowrap">
           <FaCalendarAlt className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
           <span className="truncate">April 29, 2025 - May 6, 2025</span> {/* Valeur factice */}
           <FaChevronDown className="ml-1 h-3 w-3 text-gray-400 flex-shrink-0"/>
        </button>
      </div>

      {/* Côté Droit: Notifications et Menu Utilisateur */}
      <div className="flex items-center space-x-3 md:space-x-4"> {/* Espace ajusté */}

        {/* --- Dropdown Notifications (Affiché si connecté et non en chargement) --- */}
        {!isLoading && user && (
            <div ref={notificationsRef} className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(prev => !prev)}
                  className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none relative"
                  aria-label="Notifications"
                >
                    <FaBell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-red-500"></span>
                    )}
                </button>

                {/* Contenu Dropdown Notifications */}
                <AnimatePresence>
                    {isNotificationsOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.15 }}
                          className="origin-top-right absolute right-0 mt-2 w-72 md:w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-30"
                        >
                           <div className="border-b border-gray-200 px-4 py-3">
                             <p className="text-sm font-medium text-gray-900">Notifications</p>
                           </div>
                           <div className="py-1 max-h-80 overflow-y-auto">
                             {notifications.length > 0 ? notifications.map((notif) => (
                                <button
                                  key={notif.id}
                                  onClick={() => handleNotificationClick(notif.id)}
                                  className={`block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 ${notif.read ? 'text-gray-500' : 'text-gray-800'}`}
                                >
                                  <p className={`truncate ${!notif.read ? 'font-semibold' : 'font-medium'}`}>{notif.text}</p>
                                  <p className="text-xs text-gray-400 mt-0.5">{notif.time}</p>
                                </button>
                             )) : (
                               <p className="text-center text-sm text-gray-500 py-6 px-4">Aucune notification</p>
                             )}
                           </div>
                           {notifications.length > 0 && (
                             <div className="border-t border-gray-200 px-4 py-2">
                               <Link to="/notifications" className="block text-center text-sm font-medium text-indigo-600 hover:text-indigo-500" onClick={() => setIsNotificationsOpen(false)}>
                                 Voir toutes
                               </Link>
                             </div>
                           )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        )}

        {/* Séparateur Vertical */}
        {!isLoading && user && <div className="hidden md:block h-6 w-px bg-gray-300"></div>}

        {/* --- Dropdown Menu Utilisateur (Affiché si connecté et non en chargement) --- */}
        {!isLoading && user && (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setIsUserMenuOpen(prev => !prev)}
                className="flex items-center p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-label="Menu utilisateur"
              >
                {renderAvatar()} {/* Affiche l'avatar/initiales dynamiques */}
                {/* Affiche le nom dynamique provenant du contexte */}
                <span className="hidden lg:block ml-2 text-sm font-medium text-gray-700 hover:text-gray-900 truncate" title={user?.name || undefined}>{user?.name ?? ''}</span>
                <FaChevronDown className="hidden lg:block ml-1 h-3 w-3 text-gray-400 flex-shrink-0"/>
              </button>

               {/* Contenu Dropdown */}
               <AnimatePresence>
                 {isUserMenuOpen && (
                   <motion.div
                     initial={{ opacity: 0, y: -5 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -5 }}
                     transition={{ duration: 0.15 }}
                     className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-30"
                   >
                     {/* En-tête avec infos user dynamiques */}
                     <div className="px-4 py-3 border-b border-gray-100">
                       <p className="text-sm font-semibold text-gray-900 truncate">{user?.name ?? ''}</p>
                       <p className="text-xs text-gray-500 truncate">{user?.email || 'Email non disponible'}</p>
                     </div>
                     {/* Liens d'action */}
                     <div className="py-1">
                       <Link to="/profile" className={menuItemClasses} onClick={() => setIsUserMenuOpen(false)}>
                          <FaUserCircle className="mr-3 h-4 w-4 text-gray-400 flex-shrink-0" /> Mon Profil
                       </Link>
                       <Link to="/settings" className={menuItemClasses} onClick={() => setIsUserMenuOpen(false)}>
                          <FaCog className="mr-3 h-4 w-4 text-gray-400 flex-shrink-0"/> Paramètres
                       </Link>
                     </div>
                     {/* Séparateur */}
                      <div className="border-t border-gray-100"></div>
                      <div className="py-1">
                         <button onClick={handleLogout} className={`${menuItemClasses} w-full`}>
                            <FaSignOutAlt className="mr-3 h-4 w-4 text-gray-400 flex-shrink-0"/> Déconnexion
                         </button>
                      </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
        )}
         {/* Bouton Connexion (Affiché si pas authentifié ET pas en chargement) */}
  
      </div>
    </header>
  );
};

export default Header;