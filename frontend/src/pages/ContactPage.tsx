// src/pages/ContactPage.tsx (ou le chemin correct)
import React from 'react';
import Header from '../components/Header'; // Assurez-vous que le chemin est correct

const ContactPage: React.FC = () => { // Renommé pour la cohérence (optionnel)
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Logique de soumission du formulaire ici (par exemple, appel API)
    alert("Message envoyé (simulation) !"); // Placeholder
    // Réinitialiser le formulaire si nécessaire
    (event.target as HTMLFormElement).reset();
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900"> {/* Fond sombre, comme la page d'accueil */}
      <Header />

      {/* Conteneur principal du contenu de la page Contact */}
      {/* AJOUTÉ padding-top ici pour compenser le header sticky */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-[88px] sm:pt-[96px] pb-16">
        <div className="text-center mb-10 md:mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white">
            Contactez-nous
          </h1>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
            Une question, une suggestion, ou besoin d'assistance ? Nous sommes là pour vous aider.
            Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
          </p>
        </div>

        {/* Formulaire de contact stylisé pour un thème sombre */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg bg-slate-800 shadow-2xl rounded-xl p-6 sm:p-8 space-y-6" // Carte plus sombre, espacement interne
        >
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-indigo-300 mb-1">
              Nom complet
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              className="block w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-gray-200 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
              placeholder="Votre nom complet"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-indigo-300 mb-1">
              Adresse e-mail
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              autoComplete="email"
              className="block w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-gray-200 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
              placeholder="vous@exemple.com"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-indigo-300 mb-1">
              Votre message
            </label>
            <textarea
              name="message"
              id="message"
              rows={5} // Augmenté le nombre de lignes
              required
              className="block w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-gray-200 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors resize-none" // resize-none pour empêcher le redimensionnement manuel
              placeholder="Écrivez votre message ici..."
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 transition-colors"
            >
              Envoyer le Message
            </button>
          </div>
        </form>
      </main>

      <footer className="py-8 text-center text-xs text-gray-400 border-t border-gray-700">
        © {new Date().getFullYear()} JsonToUI. Tous droits réservés.
      </footer>
    </div>
  );
};

export default ContactPage; // Renommé en ContactPage