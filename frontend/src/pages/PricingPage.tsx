import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const prices = {
    basic: isAnnual ? 9 : 12,
    pro: isAnnual ? 39 : 45,
    enterprise: isAnnual ? 199 : 220,
  };

  return (
    <div className="bg-gray-100 min-h-screen text-gray-800">
      <Header />

      <section className="bg-gray-800 text-white text-center py-20">
        <h1 className="text-4xl font-bold mb-4">Générez votre site web en quelques secondes</h1>
        <p className="text-lg">Choisissez votre forfait et commencez notre essai gratuit de 30 jours !</p>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center gap-4 mb-8">
          <span className="font-semibold">PAIEMENT ANNUEL</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={!isAnnual} onChange={() => setIsAnnual(!isAnnual)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-500"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
          </label>
          <span className="font-semibold">PAIEMENT MENSUEL</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-2">Basique</h3>
            <p className="text-sm text-gray-500 mb-4">Pour petits sites web</p>
            <div className="text-3xl font-bold">${prices.basic}<span className="text-sm">/mois</span></div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-4 border-green-500">
            <h3 className="text-xl font-bold mb-2">Professionnel</h3>
            <p className="text-sm text-gray-500 mb-4">Meilleur rapport qualité-prix</p>
            <div className="text-3xl font-bold">${prices.pro}<span className="text-sm">/mois</span></div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-2">Entreprise</h3>
            <p className="text-sm text-gray-500 mb-4">Pour grandes entreprises</p>
            <div className="text-3xl font-bold">${prices.enterprise}<span className="text-sm">/mois</span></div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricingPage;
