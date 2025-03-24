import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">MonSite</h1>
        <nav>
          <ul className="flex space-x-6">
            {["/", "/about", "/contact"].map((path, index) => {
              const titles = ["Accueil", "À propos", "Contact"];
              return (
                <li key={index}>
                  <Link
                    to={path}
                    className={`px-3 py-2 rounded-lg transition-colors duration-300 ${
                      location.pathname === path
                        ? "bg-white text-blue-600 shadow-md"
                        : "text-white hover:bg-white hover:text-blue-600"
                    }`}
                  >
                    {titles[index]}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                to="/login"
                className=" text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-300 hover:bg-gray-100"
              >
                Connexion
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
