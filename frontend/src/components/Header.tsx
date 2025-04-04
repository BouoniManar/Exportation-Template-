import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const routes = ["/", "/about", "/pricing", "/contact"];
  const titles = ["Accueil", "À propos", "Tarifs", "Contact"];

  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold no-underline text-white inline-block">
          JSONToUI
        </Link>        
        <nav>
          <ul className="flex space-x-6">
            {routes.map((path, index) => (
              <li key={index}>
                <Link
                  to={path}
                  className={`inline-block px-3 py-2 rounded-lg transition-colors duration-300 font-bold no-underline ${
                    location.pathname === path
                      ? "text-white"
                      : "text-white hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {titles[index]}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/login" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg inline-block text-center"
              >
                Connexion
              </Link>
            </li>
            <li>
            <Link 
                to="/login" 
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg inline-block text-center"
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
