// src/pages/PricingPage.tsx (ou le chemin correct)
import React, { useState } from "react";
import Header from "../components/Header"; // Assurez-vous que le chemin est correct
import Footer from "../components/Footer"; // Assurez-vous que le chemin est correct
import { Link } from "react-router-dom";

const PricingPage: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Basique",
      description: "Idéal pour les projets personnels et les petits sites web.",
      priceMonthly: 12,
      priceAnnually: 9,
      features: [
        "1 Projet",
        "Exportations Limitées",
        "Templates de base",
        "Support Communautaire",
      ],
      ctaText: "Commencer l'Essai",
      isPopular: false,
    },
    {
      name: "Professionnel",
      description: "Parfait pour les freelances et les petites équipes.",
      priceMonthly: 45,
      priceAnnually: 39,
      features: [
        "10 Projets",
        "Exportations Illimitées",
        "Accès à tous les templates",
        "Support Prioritaire",
        "Optimisation IA",
      ],
      ctaText: "Choisir Pro",
      isPopular: true,
    },
    {
      name: "Entreprise",
      description: "Solution complète pour les agences et grandes entreprises.",
      priceMonthly: 220,
      priceAnnually: 199,
      features: [
        "Projets Illimités",
        "Exportations Illimitées",
        "Templates Personnalisés",
        "Support Dédié 24/7",
        "Fonctionnalités Avancées IA",
        "Gestion d'équipe",
      ],
      ctaText: "Nous Contacter",
      isPopular: false,
    },
  ];

  return (
    // CORRECTION: Changement de la classe de fond principale
    <div className="flex flex-col min-h-screen bg-slate-900"> {/* Fond sombre */}
      <Header />

      {/* Section Hero pour la page de tarification */}
      {/* AJOUTÉ padding-top ici pour compenser le header sticky */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white text-center pt-[120px] sm:pt-[140px] pb-16 sm:pb-20 px-4"> {/* Padding top important ici */}
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">
          Des Tarifs Adaptés à Vos Besoins
        </h1>
        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
          Choisissez le plan qui vous convient et commencez à transformer vos JSON en UI en quelques minutes.
          Bénéficiez de notre essai gratuit de 30 jours sur tous les plans !
        </p>
      </section>

      {/* Section des cartes de prix */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Sélecteur Annuel/Mensuel */}
        <div className="flex justify-center items-center gap-3 sm:gap-4 mb-10 sm:mb-12">
          <span className={`text-sm sm:text-base font-semibold transition-colors ${isAnnual ? 'text-indigo-400' : 'text-slate-400'}`}>
            Paiement Annuel (Économisez ~20%)
          </span>
          <label htmlFor="billingToggle" className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="billingToggle"
              checked={!isAnnual}
              onChange={() => setIsAnnual(!isAnnual)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-slate-700 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 peer-focus:ring-offset-2 peer-focus:ring-offset-slate-900 peer-checked:bg-indigo-600 transition-colors"></div>
            <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-7"></div>
          </label>
          <span className={`text-sm sm:text-base font-semibold transition-colors ${!isAnnual ? 'text-indigo-400' : 'text-slate-400'}`}>
            Paiement Mensuel
          </span>
        </div>

        {/* Grille des plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-xl p-6 sm:p-8 flex flex-col transition-all duration-300 ease-in-out hover:shadow-2xl ${
                plan.isPopular ? 'border-4 border-indigo-500 relative ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900' : 'border border-gray-200'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                  Populaire
                </div>
              )}
              <h3 className="text-2xl font-bold text-slate-800 mb-2">{plan.name}</h3>
              <p className="text-sm text-slate-500 mb-6 min-h-[40px]">{plan.description}</p>

              <div className="my-4">
                <span className="text-4xl sm:text-5xl font-extrabold text-slate-900">
                  ${isAnnual ? plan.priceAnnually : plan.priceMonthly}
                </span>
                <span className="text-sm text-slate-500">/mois</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                {isAnnual ? `Facturé ${plan.priceAnnually * 12}$ annuellement` : "Facturé mensuellement"}
              </p>

              <ul className="space-y-3 text-left text-slate-600 mb-8 flex-grow">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start">
                    <svg className="flex-shrink-0 w-5 h-5 text-indigo-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                to={plan.name === "Entreprise" ? "/contact" : "/register"} // Lien différent pour Entreprise
                className={`w-full mt-auto block text-center px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ease-in-out
                  ${plan.isPopular
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                    : 'bg-slate-100 text-indigo-600 hover:bg-slate-200 border border-slate-300'
                  }`}
              >
                {plan.ctaText}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricingPage;