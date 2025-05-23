// src/components/layout/AdminHeader.tsx // Assurez-vous que le nom du fichier est correct
import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaCalendarAlt, FaBell, FaUserCircle, FaSignOutAlt, FaCog, FaChevronDown, FaClock } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext'; // Assurez-vous que le chemin est correct

// CORRECTION DU CHEMIN D'IMPORTATION
import defaultUserAvatar from '../../assets/images/admin.jpg'; // <-- CHEMIN CORRIGÉ

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8001";

const AdminHeader = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();

  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const notifications = [
    { id: 1, text: "Nouveau template généré !", time: "10 min ago", read: false },
    { id: 2, text: "Projet 'Site Vitrine' mis à jour.", time: "1 heure ago", read: true },
    { id: 3, text: "Erreur de génération pour 'Test API'.", time: "Hier", read: false },
  ];
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

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
    logout();
    setIsUserMenuOpen(false);
    navigate('/login');
  };

  const handleNotificationClick = (id: number) => {
    console.log(`Notification ${id} cliquée`);
    setIsNotificationsOpen(false);
  };

  const formatDateForHeader = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit', month: 'short', year: 'numeric'
    };
    return date.toLocaleDateString('fr-FR', options).replace(/\.$/, '');
  };

  const formatTimeForHeader = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit', minute: '2-digit', hour12: false
    };
    return date.toLocaleTimeString('fr-FR', options);
  };

  const renderAvatar = () => {
    const avatarBaseClasses = "w-8 h-8 rounded-full object-cover";
    const avatarInitialFontSize = "text-xs";

    if (isLoading) {
      return <div className={`${avatarBaseClasses} bg-gray-300 dark:bg-gray-700 animate-pulse`}></div>;
    }
    
    if (user) {
      if (user.avatarUrl) {
        const fullAvatarUrl = user.avatarUrl.startsWith('http') || user.avatarUrl.startsWith('blob:')
          ? user.avatarUrl
          : `${API_BASE_URL}${user.avatarUrl}`;
        return (
          <img 
            key={fullAvatarUrl}
            src={fullAvatarUrl} 
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                const target = e.currentTarget as HTMLImageElement;
                if (target.src !== defaultUserAvatar) {
                    target.onerror = null; 
                    target.src = defaultUserAvatar;
                    target.alt = "Avatar par défaut";
                }
            }}
            alt={user.name ? `Avatar de ${user.name}` : "Avatar utilisateur"} 
            className={`${avatarBaseClasses} bg-gray-300 dark:bg-gray-700`}
          />
        );
      } else if (user.name) {
        const initials = user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        return (
          <span className={`flex items-center justify-center ${avatarBaseClasses} bg-indigo-500 text-white ${avatarInitialFontSize} font-semibold`}>
            {initials}
          </span>
        );
      }
    }
    // Si pas d'utilisateur OU si utilisateur existe mais n'a ni avatar_url ni nom (devrait afficher l'avatar par défaut)
    return (
        <img 
            key="default-avatar"
            src={defaultUserAvatar} // Utilise l'image importée
            alt="Avatar par défaut" 
            className={`${avatarBaseClasses} bg-gray-300 dark:bg-gray-700`}
        />
    );
  };
  
  const menuItemClasses = "flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white";

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm h-16 flex items-center justify-between px-4 md:px-6 flex-shrink-0 border-b border-gray-200 dark:border-gray-700 z-20 relative">
      {/* ... reste du JSX ... */}
      <div className="flex items-center space-x-4">
        <div className="relative hidden md:block">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </span>
          <input
            type="text"
            placeholder="Search..."
            className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 whitespace-nowrap cursor-default">
           <FaCalendarAlt className="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
           <span className="truncate font-medium">{formatDateForHeader(currentDateTime)}</span>
           <FaClock className="ml-2.5 mr-1.5 h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
           <span className="truncate font-medium">{formatTimeForHeader(currentDateTime)}</span>
        </div>
      </div>

      <div className="flex items-center space-x-3 md:space-x-4">
        {!isLoading && user && (
            <div ref={notificationsRef} className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(prev => !prev)}
                  className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none relative"
                  aria-label="Notifications"
                >
                    <FaBell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-red-500"></span>
                    )}
                </button>
                <AnimatePresence>
                    {isNotificationsOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.15 }}
                          className="origin-top-right absolute right-0 mt-2 w-72 md:w-80 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-30 border border-gray-200 dark:border-gray-700"
                        >
                           <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                             <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Notifications</p>
                           </div>
                           <div className="py-1 max-h-80 overflow-y-auto">
                             {notifications.length > 0 ? notifications.map((notif) => (
                                <button
                                  key={notif.id}
                                  onClick={() => handleNotificationClick(notif.id)}
                                  className={`block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${notif.read ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}
                                >
                                  <p className={`truncate ${!notif.read ? 'font-semibold' : 'font-medium'}`}>{notif.text}</p>
                                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{notif.time}</p>
                                </button>
                             )) : (
                               <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-6 px-4">Aucune notification</p>
                             )}
                           </div>
                           {notifications.length > 0 && (
                             <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
                               <Link to="/notifications" className="block text-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300" onClick={() => setIsNotificationsOpen(false)}>
                                 Voir toutes
                               </Link>
                             </div>
                           )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        )}

        {!isLoading && user && <div className="hidden md:block h-6 w-px bg-gray-300 dark:bg-gray-600"></div>}

        {!isLoading && user && (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setIsUserMenuOpen(prev => !prev)}
                className="flex items-center p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-label="Menu utilisateur"
              >
                {renderAvatar()}
                <span className="hidden lg:block ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white truncate" title={user?.name || undefined}>{user?.name ?? ''}</span>
                <FaChevronDown className="hidden lg:block ml-1 h-3 w-3 text-gray-400 dark:text-gray-500 flex-shrink-0"/>
              </button>
               <AnimatePresence>
                 {isUserMenuOpen && (
                   <motion.div
                     initial={{ opacity: 0, y: -5 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -5 }}
                     transition={{ duration: 0.15 }}
                     className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-30 border border-gray-200 dark:border-gray-700"
                   >
                     <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                       <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user?.name ?? ''}</p>
                       <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || 'Email non disponible'}</p>
                     </div>
                     <div className="py-1">
                       <Link to="/profile" className={menuItemClasses} onClick={() => setIsUserMenuOpen(false)}>
                          <FaUserCircle className="mr-3 h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" /> Mon Profil
                       </Link>
                       <Link to="/settings" className={menuItemClasses} onClick={() => setIsUserMenuOpen(false)}>
                          <FaCog className="mr-3 h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0"/> Paramètres
                       </Link>
                     </div>
                      <div className="border-t border-gray-100 dark:border-gray-700"></div>
                      <div className="py-1">
                         <button onClick={handleLogout} className={`${menuItemClasses} w-full`}>
                            <FaSignOutAlt className="mr-3 h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0"/> Déconnexion
                         </button>
                      </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;