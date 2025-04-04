import { Link } from "react-router-dom";
import RegisterForm from "../components/Auth/RegisterForm";

const RegisterPage = () =>
{
    return (
        <div>
    <Link to="/" className="text-3xl font-bold mb-6 text-grey-900 no-underline">
    JSONToUI
  </Link>

     <RegisterForm />;
     </div>
    )
};
export default RegisterPage;
