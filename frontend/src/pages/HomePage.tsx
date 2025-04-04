import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <header className="text-center py-20">
        <h2 className="text-5xl font-extrabold mb-4">
          Générez et exportez vos templates web en un clic !
        </h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Avec <span className="font-bold">JSONToUI</span>, transformez vos fichiers JSON en sites web 
          réactifs et modernes sans effort.
        </p>

        <Link 
          to="/register" 
          className="mt-6 bg-green-500 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-green-600 text-white"
        >
          Commencer l'exportation
        </Link>

      </header>

      {/* Features Section */}
      <section className="container mx-auto py-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold">Génération Automatique</h3>
          <p className="text-gray-400 mt-2">
            Convertissez facilement des fichiers JSON en templates HTML/CSS/JS en quelques secondes.
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold">Personnalisation Facile</h3>
          <p className="text-gray-400 mt-2">
            Adaptez les styles et les composants à vos besoins grâce à un export flexible.
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold">Exportation en ZIP</h3>
          <p className="text-gray-400 mt-2">
            Téléchargez vos templates sous forme d’archive prête à l’emploi.
          </p>
        </div>
      </section>

      {/* Footer */}
  
      <Footer />
    </div>
  );
};

export default HomePage;
