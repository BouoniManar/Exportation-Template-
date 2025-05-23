// src/pages/SettingsPage.tsx
import React, { useState, useEffect } from 'react'; // Ajout de useEffect
import { FaCog, FaPalette, FaBell, FaShieldAlt, FaLanguage, FaMoon, FaSun } from 'react-icons/fa';
import AdminLayout from '../../components/layout/AdminLayout';

interface SettingSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

const SettingSection: React.FC<SettingSectionProps> = ({ title, icon: Icon, children }) => {
  return (
    // Ajout de la classe 'dark:bg-gray-800' pour le mode sombre sur les sections
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-8">
      {/* Ajout de la classe 'dark:text-gray-200' pour le titre en mode sombre */}
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6 flex items-center">
        <Icon className="mr-3 text-blue-500 h-5 w-5" />
        {title}
      </h2>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

// Textes pour la simulation de la langue
const T_SETTINGS_TITLE = {
  fr: "Paramètres",
  en: "Settings",
};
const T_APPEARANCE_SECTION = {
  fr: "Apparence",
  en: "Appearance",
};
const T_DARK_MODE_TITLE = {
  fr: "Mode Sombre",
  en: "Dark Mode",
};
const T_DARK_MODE_DESC = {
  fr: "Activez pour une interface plus sombre.",
  en: "Enable for a darker interface.",
};
const T_LANGUAGE_TITLE = {
  fr: "Langue",
  en: "Language",
};
const T_LANGUAGE_DESC = {
  fr: "Choisissez la langue de l'application.",
  en: "Choose the application language.",
};
// ... ajoutez d'autres textes si besoin


const  AdminSettingsComponent = () => {
  // --- Mode Sombre ---
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Lire la préférence depuis localStorage au chargement initial
    if (typeof window !== 'undefined') { // S'assurer que window est défini (pour SSR/Next.js etc.)
      const storedPreference = localStorage.getItem('theme');
      if (storedPreference) {
        return storedPreference === 'dark';
      }
      // Sinon, vérifier la préférence système
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false; // Défaut si window n'est pas défini
  });

  // --- Langue ---
  type Language = 'fr' | 'en'; // Définir les langues supportées
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const storedLang = localStorage.getItem('language') as Language | null;
      return storedLang || 'fr'; // Défaut 'fr'
    }
    return 'fr';
  });

  // Effet pour appliquer la classe 'dark' et sauvegarder le thème
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Effet pour sauvegarder la langue (pas d'effet visuel direct sans i18n library)
  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
    // Ici, avec une vraie librairie i18n, vous appelleriez i18n.changeLanguage(currentLanguage);
    console.log(`Langue changée en : ${currentLanguage}`);
  }, [currentLanguage]);

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentLanguage(event.target.value as Language);
  };

  return (
    // Assurez-vous que votre DashboardLayout et les éléments parents gèrent aussi la classe 'dark'
    // Par exemple, le body ou un wrapper principal pourrait avoir dark:bg-gray-900
    <AdminLayout>
      {/* Titre de la page, sensible à la langue et au mode sombre */}
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">
        {T_SETTINGS_TITLE[currentLanguage]}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <SettingSection title={T_APPEARANCE_SECTION[currentLanguage]} icon={FaPalette}>
            <div className="flex items-center justify-between">
              <div>
                {/* Textes sensibles à la langue et au mode sombre */}
                <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">{T_DARK_MODE_TITLE[currentLanguage]}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{T_DARK_MODE_DESC[currentLanguage]}</p>
              </div>
              <button
                onClick={toggleDarkMode}
                aria-pressed={isDarkMode} // Pour l'accessibilité
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isDarkMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600' // Style du toggle en mode sombre
                }`}
              >
                <span className="sr-only">Activer le mode sombre</span>
                <span
                  className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
                {isDarkMode ? <FaMoon className="absolute left-1 top-1/2 -translate-y-1/2 h-3 w-3 text-yellow-300" /> : <FaSun className="absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 text-yellow-500" /> }
              </button>
            </div>

            <div>
              {/* Textes sensibles à la langue et au mode sombre */}
              <label htmlFor="language" className="block text-md font-medium text-gray-700 dark:text-gray-300">
                {T_LANGUAGE_TITLE[currentLanguage]}
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{T_LANGUAGE_DESC[currentLanguage]}</p>
              <select
                id="language"
                name="language"
                value={currentLanguage} // Contrôler la valeur du select
                onChange={handleLanguageChange} // Gérer le changement
                // Style du select en mode sombre
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
          </SettingSection>

          {/* Les autres sections peuvent aussi être adaptées pour le mode sombre et la langue si nécessaire */}
          <SettingSection title="Notifications" icon={FaBell}>
            <div>
              <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Notifications par Email</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Recevoir des mises à jour importantes par email.</p>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600 dark:bg-gray-700 dark:border-gray-600 rounded border-gray-300 focus:ring-blue-500" />
                <span className="dark:text-gray-300">Activer les notifications par email</span>
              </label>
            </div>
          </SettingSection>

          <SettingSection title="Sécurité" icon={FaShieldAlt}>
            <div>
              <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Authentification à deux facteurs (2FA)</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Améliorez la sécurité de votre compte.</p>
              <button className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                Configurer 2FA (Non implémenté)
              </button>
            </div>
          </SettingSection>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Informations</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cette page vous permet de personnaliser votre expérience et de gérer les aspects clés de votre compte.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Aide</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Besoin d'aide ? Consultez notre <a href="/faq" className="text-blue-600 dark:text-blue-400 hover:underline">FAQ</a> ou <a href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">contactez le support</a>.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default  AdminSettingsComponent;