import Header from "./Header";

const About = () => {
  return (
    
    <div className="text-white min-h-screen">
            <Header />
    <div className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center text-white mb-6">
        À propos de nous
      </h2>
      <p className="text-center text-white  mb-8">
        Bienvenue sur <span className="font-semibold">JSONToUI</span>, votre plateforme de conversion de fichiers JSON en projets React fonctionnels. 
      </p>

        <h3 className="text-xl font-semibold text-blue-500 mb-4">Notre mission</h3>
        <p className="text-white  mb-4">
          Nous facilitons la transformation de vos idées en applications web interactives en générant automatiquement des fichiers HTML, CSS et JavaScript à partir de structures JSON.
        </p>

        <h3 className="text-xl font-semibold text-white  mb-4">Pourquoi nous choisir ?</h3>
        <ul className="list-disc list-inside text-white space-y-2">
          <li>Génération automatique et rapide de templates React.</li>
          <li>Facilité d'exportation et d'intégration.</li>
          <li>Interface intuitive et conviviale.</li>
          <li>Utilisation de l'IA pour optimiser le code.</li>
        </ul>

        <h3 className="text-xl font-semibold text-blue-500 mt-6 mb-4">Notre engagement</h3>
        <p className="text-white">
          Nous sommes dédiés à simplifier le développement front-end et à offrir une solution efficace pour les développeurs de tous niveaux.
        </p>
      </div>
    </div>
  
  );
};

export default About;
