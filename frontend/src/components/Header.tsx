import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const routes = ["/", "/about", "/pricing", "/contact"];
  const titles = ["Accueil", "À propos", "Tarifs", "Contact"];

  // Définissons les classes pour les boutons CTA pour la cohérence
  const ctaButtonClasses = "bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg inline-block text-center shadow-md transition-colors duration-200 ease-in-out no-underline";
  // Pour un style de bouton "secondaire" (Connexion), si vous voulez une légère variation
  const secondaryButtonClasses = "bg-transparent hover:bg-slate-700 text-slate-200 font-semibold py-2 px-4 rounded-lg inline-block text-center border border-slate-600 hover:border-slate-500 transition-colors duration-200 ease-in-out no-underline";


  return (
    // Header sombre (bg-gray-800 est ok, ou vous pouvez utiliser bg-slate-900 pour un bleu plus profond)
    <header className="bg-slate-900 text-white py-4 px-6 shadow-lg sticky top-0 z-50 min-h-[72px] flex items-center"> {/* Ajusté padding et hauteur */}
      <div className="container mx-auto flex justify-between items-center w-full px-2 sm:px-4 lg:px-6">
        <Link to="/" className="text-2xl sm:text-3xl font-bold no-underline text-white inline-block hover:opacity-80 transition-opacity">
          JSONToUI
        </Link>
        <nav className="flex items-center">
          <ul className="flex space-x-3 sm:space-x-5 items-center"> {/* Espacement ajusté */}
            {routes.map((path, index) => (
              <li key={index}>
                <Link
                  to={path}
                  className={`px-2 sm:px-3 py-2 rounded-md text-sm sm:text-base font-medium no-underline transition-colors duration-200 ease-in-out ${
                    location.pathname === path
                      ? "text-white bg-slate-700 font-semibold" // Actif
                      : "text-slate-300 hover:text-white hover:bg-slate-700/60" // Inactif
                  }`}
                >
                  {titles[index]}
                </Link>
              </li>
            ))}
            {/* Optionnel: séparateur plus visible sur fond sombre */}
            <li className="hidden sm:block h-6 w-px bg-slate-600 mx-2"></li>

            <li className="ml-1 sm:ml-2">
              {/* Bouton Connexion : peut être différent du CTA principal */}
              <Link
                to="/login"
                // Vous pouvez choisir de le garder différent ou d'utiliser ctaButtonClasses
                className={secondaryButtonClasses} // Ou ctaButtonClasses si vous voulez qu'il soit vert aussi
                // Exemple si vous voulez le bouton Connexion vert aussi :
                // className={ctaButtonClasses}
              >
                Connexion
              </Link>
            </li>
            <li>
              <Link
                to="/register" // Assurez-vous que "Essai Gratuit" mène à l'inscription
                className={ctaButtonClasses} // Utilisation des classes CTA définies
              >
                Essai Gratuit
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;