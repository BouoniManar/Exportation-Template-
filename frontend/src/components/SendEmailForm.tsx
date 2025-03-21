import { useState } from "react";
import { sendEmail } from "../services/emailService";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SendEmailForm: React.FC = () => {
  console.log("✅ SendEmailForm chargé !");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendEmail({ 
        to_email: email, 
        subject: "Réinitialisation du mot de passe", 
        body: "Cliquez sur le lien suivant pour réinitialiser votre mot de passe." 
      });

      toast.success(" Email envoyé avec succès !");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      toast.error("Une erreur est survenue !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-[400px] text-center">
        
        {/* Logo */}
        <h1 className="text-3xl font-bold text-indigo-700 mb-2">Bonjour</h1>
        <p className="text-sm text-gray-500 mb-6">Mot de passe oublié ?</p>

        {/* Texte explicatif */}
        <p className="text-gray-600 text-sm mb-6">
          Renseignez votre adresse email afin de recevoir les instructions pour le réinitialiser.
        </p>

        <ToastContainer position="top-right" autoClose={3000} />

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <label className="block text-gray-700 font-medium text-sm mb-1">Adresse e-mail</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="exemple@email.com"
          />

          {/* Bouton principal */}
          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white py-2 rounded-md font-medium hover:bg-indigo-700 transition-all duration-300"
            disabled={loading}
          >
            {loading ? "Envoi..." : "Continuer"}
          </button>
        </form>

        {/* Lien de retour */}
        <button 
          type="button" 
          onClick={() => navigate(-1)} 
          className="mt-4 text-indigo-600 text-sm hover:underline"
        >
          Retour à la connexion
        </button>

      </div>
    </div>
  );
};

export default SendEmailForm;
