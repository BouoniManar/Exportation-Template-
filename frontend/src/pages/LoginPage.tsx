import LoginForm from ".././components/Auth/LoginForm";
import { Link } from "react-router-dom";

const LoginPage = () => {
  return (
    <div>
      {/* Logo JSONToUI */}
      <Link to="/" className="text-3xl font-bold mb-6 text-grey-900 no-underline">
        JSONToUI
      </Link>

      {/* Formulaire de connexion */}
      <LoginForm />
   </div>
  );
};

export default LoginPage;
