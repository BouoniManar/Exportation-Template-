// src/pages/LoginPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header'; // Votre header public
import LoginForm from '../components/Auth/LoginForm'; // Assurez-vous que ce composant est bien adapté pour Tailwind
import loginIllustration from '../assets/images/login-illustration.png'; // Assurez-vous que le chemin est correct
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage: React.FC = () => {
  return (
    // CORRECTION: Changement de la classe de fond ici
    <div className="flex flex-col min-h-screen bg-gray-800"> {/* <--- CHANGÉ ICI */}
      <Header />

      {/* MODIFICATION: Ajustement du padding-top pour correspondre à la hauteur du Header */}
      {/* Supposez que votre Header fait environ 72px-80px de haut */}
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8 pt-[88px] sm:pt-[96px]"> {/* <--- AJOUTÉ padding-top ici */}
        {/* La carte reste blanche pour le contraste avec le formulaire */}
        <div className="w-full max-w-4xl lg:max-w-5xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden md:flex">
          {/* Section Gauche: Illustration */}
          <div className="hidden md:w-1/2 lg:w-[55%] md:flex items-center justify-center p-8 lg:p-12 bg-indigo-600 relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-12 -right-12 w-56 h-56 bg-purple-500 rounded-full opacity-30 animate-ping_slow"></div>
            <img
              src={loginIllustration}
              alt="Illustration de connexion sécurisée"
              className="max-w-sm lg:max-w-md w-full h-auto object-contain relative z-10"
            />
          </div>

          {/* Section Droite: Formulaire de Connexion */}
          <div className="w-full md:w-1/2 lg:w-[45%] p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
            <div className="mb-8 text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
                Bienvenue !
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Connectez-vous pour accéder à votre espace JsonToUI.
              </p>
            </div>

            <LoginForm />

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-600">
                Pas encore de compte ?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  Créez un compte
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
                 <Link
                    to="/sendemail" // Assurez-vous que cette route est correcte pour la réinitialisation du MdP
                    className="text-xs text-slate-500 hover:text-indigo-600 hover:underline"
                >
                    Mot de passe oublié ?
                </Link>
            </div>
          </div>
        </div>
      </main>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" hideProgressBar={false} newestOnTop />
      {/* Le footer sera sur fond sombre, ajustez son texte si besoin */}
      <footer className="py-8 text-center text-xs text-gray-400"> {/* Changé text-slate-500 en text-gray-400 */}
        © {new Date().getFullYear()} JsonToUI. Tous droits réservés.
      </footer>
    </div>
  );
};

export default LoginPage;