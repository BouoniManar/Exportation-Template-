// src/pages/RegisterPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header'; // Votre header public
import RegisterForm from '../components/Auth/RegisterForm'; // Votre formulaire d'inscription (qui utilise MUI)
// Utilisez la MÊME illustration que la page de connexion pour la cohérence, ou une spécifique si vous préférez
import authIllustration from '../assets/images/login-illustration.png'; // Assurez-vous que ce chemin est correct
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RegisterPage: React.FC = () => {
  return (
    // Même structure et classes de fond que LoginPage
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-100">
      <Header />

      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl lg:max-w-5xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden md:flex">
          {/* Section Gauche: Illustration - Identique à LoginPage */}
          <div className="hidden md:w-1/2 lg:w-[55%] md:flex items-center justify-center p-8 lg:p-12 bg-indigo-600 relative overflow-hidden"> {/* Même fond indigo */}
            {/* Mêmes motifs décoratifs */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-12 -right-12 w-56 h-56 bg-purple-500 rounded-full opacity-30 animate-ping_slow"></div> {/* Assurez-vous que animate-ping_slow est défini globalement */}
            <img
              src={authIllustration} // Utiliser la même image pour la cohérence ou une image spécifique pour l'inscription
              alt="Illustration d'authentification"
              className="max-w-sm lg:max-w-md w-full h-auto object-contain relative z-10"
            />
          </div>

          {/* Section Droite: Formulaire d'Inscription */}
          <div className="w-full md:w-1/2 lg:w-[45%] p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
            <div className="mb-8 text-center md:text-left">
              {/* Titre spécifique à la page d'inscription */}
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
                Créer votre compte
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Rejoignez JsonToUI et donnez vie à vos idées en quelques clics.
              </p>
            </div>

            {/* Votre composant RegisterForm (qui utilise Material UI) */}
            {/* Assurez-vous que RegisterForm.tsx a été simplifié pour ne pas avoir son propre layout externe */}
            <RegisterForm />

            {/* Lien pour se connecter si l'utilisateur a déjà un compte */}
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-600">
                Vous avez déjà un compte ?{' '}
                <Link
                  to="/login" // Lien vers la page de connexion
                  className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  Connectez-vous
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" hideProgressBar={false} newestOnTop />
      <footer className="py-8 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} JsonToUI. Tous droits réservés.
      </footer>
      {/* L'animation animate-ping_slow doit être définie dans votre CSS global (ex: src/index.css) */}
    </div>
  );
};

export default RegisterPage;