import Header from "../components/Header";
import Footer from "../components/Footer";

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center py-20 px-4">
          <h2 className="text-4xl font-bold mb-4">Bienvenue sur MonSite</h2>
          <p className="text-lg">
            Transformez vos fichiers JSON en projets React en quelques clics.
          </p>
          <button className="mt-6 bg-white text-blue-600 px-6 py-2 rounded-lg shadow-md hover:bg-gray-100 transition-colors">
            Commencer
          </button>
        </section>

        {/* À propos */}
        <section className="container mx-auto my-10 text-center px-4">
          <h3 className="text-3xl font-semibold mb-4">À propos de nous</h3>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Notre plateforme utilise l'intelligence artificielle pour générer automatiquement
            des projets React structurés à partir de fichiers JSON. Grâce à notre solution,
            vous pouvez obtenir un projet prêt à l'emploi sans effort supplémentaire.
          </p>
        </section>

        {/* Fonctionnalités */}
        <section className="bg-gray-100 py-10 px-4">
          <div className="container mx-auto text-center">
            <h3 className="text-3xl font-semibold mb-6">Nos Fonctionnalités</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Fonctionnalité 1 */}
              <div className="bg-white p-6 shadow-md rounded-lg">
                <h4 className="text-xl font-bold mb-2 text-indigo-600">Conversion Rapide</h4>
                <p className="text-gray-600">
                  Transformez vos JSON en projets React en quelques secondes.
                </p>
              </div>
              {/* Fonctionnalité 2 */}
              <div className="bg-white p-6 shadow-md rounded-lg">
                <h4 className="text-xl font-bold mb-2 text-indigo-600">Personnalisable</h4>
                <p className="text-gray-600">
                  Ajustez vos composants et styles selon vos besoins.
                </p>
              </div>
              {/* Fonctionnalité 3 */}
              <div className="bg-white p-6 shadow-md rounded-lg">
                <h4 className="text-xl font-bold mb-2 text-indigo-600">Support IA</h4>
                <p className="text-gray-600">
                  Gagnez du temps grâce à l’intelligence artificielle qui vous assiste.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
