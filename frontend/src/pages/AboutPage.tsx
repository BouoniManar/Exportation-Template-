// src/pages/AboutPage.tsx (ou le chemin correct vers votre fichier)
import React from 'react';
import Header from '../components/Header'; // Assurez-vous que le chemin vers Header est correct

const AboutPage: React.FC = () => { // Renommé en AboutPage pour la cohérence (optionnel)
  return (
    // CORRECTION: Changement de la classe de fond principale et application du padding pour le header
    <div className="flex flex-col min-h-screen bg-gray-800">
      <Header />

      {/* Conteneur principal du contenu de la page About */}
      {/* AJOUTÉ padding-top ici pour compenser le header sticky */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 pt-[88px] sm:pt-[96px] pb-16">
        {/* Vous pouvez optionnellement envelopper le contenu dans une "carte" pour le contraster */}
        <div className="max-w-3xl mx-auto text-center"> {/* Centrer tout le bloc de contenu */}
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8 mt-4">
                À Propos de <span className="text-indigo-400">JSONToUI</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-12 leading-relaxed">
                Nous transformons la complexité du JSON en simplicité d'interfaces utilisateur.
                Notre mission est de vous fournir les outils pour passer de la donnée à une application web fonctionnelle, rapidement et sans effort.
            </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="bg-slate-700 p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold text-indigo-400 mb-4">Notre Vision</h3>
                <p className="text-gray-300 leading-relaxed">
                    Chez JSONToUI, nous croyons que chaque développeur, quel que soit son niveau,
                    devrait pouvoir concrétiser ses idées rapidement. Nous visons à éliminer les tâches répétitives
                    de création d'UI à partir de structures de données, vous permettant de vous concentrer
                    sur la logique métier et l'innovation.
                </p>
            </div>

            <div className="bg-slate-700 p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold text-indigo-400 mb-4">Pourquoi JSONToUI ?</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-3 pl-2 leading-relaxed">
                    <li>
                        <span className="font-medium text-gray-100">Gain de Temps Massif :</span>
                        Générez des squelettes d'interfaces en quelques secondes.
                    </li>
                    <li>
                        <span className="font-medium text-gray-100">Flexibilité d'Export :</span>
                        Obtenez du code HTML/CSS/JS ou des composants React prêts à l'emploi.
                    </li>
                    <li>
                        <span className="font-medium text-gray-100">Convivialité :</span>
                        Une interface simple pour un processus complexe.
                    </li>
                    <li>
                        <span className="font-medium text-gray-100">Optimisation IA (Prochainement) :</span>
                        Suggestions intelligentes pour améliorer votre code et vos designs.
                    </li>
                </ul>
            </div>
        </div>

        <div className="max-w-3xl mx-auto text-center mt-12">
            <h3 className="text-2xl font-semibold text-indigo-400 mb-4">Notre Engagement envers Vous</h3>
            <p className="text-gray-300 leading-relaxed">
                Votre succès est notre priorité. Nous nous engageons à fournir un outil fiable,
                performant et en constante amélioration, soutenu par une communauté active et un support réactif.
                Rejoignez-nous dans l'aventure JSONToUI et redéfinissons ensemble la création d'interfaces web.
            </p>
        </div>
      </main>

      {/* Footer optionnel pour la cohérence, si vous en avez un global, retirez celui-ci */}
      <footer className="py-8 text-center text-xs text-gray-400 border-t border-gray-700">
        © {new Date().getFullYear()} JsonToUI. Tous droits réservés.
      </footer>
    </div>
  );
};

export default AboutPage; // Renommé en AboutPage