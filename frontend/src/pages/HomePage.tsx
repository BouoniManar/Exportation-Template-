// src/pages/HomePage.tsx (ou le chemin correct)
import React from "react";
import Header from "../components/Header"; // Assurez-vous que le chemin est correct
import Footer from "../components/Footer"; // Assurez-vous que le chemin est correct
import { Link } from "react-router-dom";
import { FaBolt, FaPaintBrush, FaFileArchive, FaArrowRight } from 'react-icons/fa'; // Ajout d'icônes

const HomePage: React.FC = () => {
  const features = [
    {
      icon: FaBolt,
      title: "Génération Automatique",
      description: "Convertissez vos JSON en templates web dynamiques en quelques secondes, sans écrire une ligne de code.",
      color: "text-indigo-400", // Couleur pour l'icône
    },
    {
      icon: FaPaintBrush,
      title: "Personnalisation Intuitive",
      description: "Adaptez facilement les styles, les couleurs et la structure pour qu'ils correspondent parfaitement à votre identité de marque.",
      color: "text-emerald-400", // Couleur pour l'icône
    },
    {
      icon: FaFileArchive,
      title: "Exportation Flexible",
      description: "Téléchargez vos projets sous forme d'archives ZIP prêtes à être déployées ou intégrées.",
      color: "text-sky-400", // Couleur pour l'icône
    },
  ];

  return (
    // CORRECTION: Changement de la classe de fond principale et flex pour le footer
    <div className="flex flex-col min-h-screen bg-slate-900 text-white">
      <Header />

      {/* Hero Section */}
      {/* AJOUTÉ padding-top ici pour compenser le header sticky */}
      <main className="flex-grow"> {/* flex-grow pour pousser le footer en bas */}
        <section className="text-center pt-[100px] sm:pt-[120px] pb-16 sm:pb-20 px-4 bg-gradient-to-b from-slate-900 to-slate-800"> {/* Dégradé subtil */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
            Générez et Exportez Vos Templates Web <span className="block sm:inline">en un Clic !</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Avec <span className="font-semibold text-indigo-400">JSONToUI</span>, transformez vos structures de données JSON
            en sites web réactifs, modernes et entièrement personnalisables, sans effort.
          </p>

          <Link
            to="/register" // Ou "/dashboard" si l'utilisateur est déjà connecté et que vous voulez l'envoyer vers l'outil
            className="inline-flex items-center justify-center mt-6 bg-emerald-500 px-8 py-3.5 rounded-lg text-lg font-semibold hover:bg-emerald-600 text-white shadow-lg transition-transform duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Commencer l'Exportation
            <FaArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-12 sm:mb-16">
            Pourquoi choisir JSONToUI ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {features.map((feature, index) => (
              <div key={index} className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-slate-700/50 transition-shadow duration-300 flex flex-col items-center text-center">
                <div className={`mb-5 p-4 rounded-full bg-slate-700`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
        {/* D'autres sections peuvent être ajoutées ici (Témoignages, CTA secondaire, etc.) */}
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;