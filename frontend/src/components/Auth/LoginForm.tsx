// src/components/Auth/LoginForm.tsx
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa"; // Changé pour FaFacebookF pour une icône plus adaptée au bouton
import { toast } from "react-toastify"; // ToastContainer sera dans LoginPage
// import "react-toastify/dist/ReactToastify.css"; // Importé dans LoginPage
import { LoginFormValues , LoginResponse} from "../../types/authTypes"; // Adaptez le chemin
import { login } from "../../services/authService"; // Adaptez le chemin
import axios from "axios"; // Gardé pour les appels OAuth directs

// Supprimez l'import de loginImage ici, il sera géré par LoginPage.tsx

const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  const handleGoogleLogin = async () => {
    try {
      const response = await axios.get<{ auth_url: string }>("http://127.0.0.1:8001/auth/google");
      window.location.href = response.data.auth_url;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'URL Google OAuth :", error);
    }
  };

  const handleFacebookLogin = () => {
    window.location.href = "http://127.0.0.1:8001/auth/facebook";
  };

  const formik = useFormik<LoginFormValues>({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Email invalide").required("L'email est requis"),
      password: Yup.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").required("Le mot de passe est requis"),
    }),

    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response: LoginResponse = await login(values); // authService
        if (response && response.access_token) {
          localStorage.setItem("token", response.access_token); // Ou utilisez votre AuthContext pour gérer le token
          toast.success("Connexion réussie ! Redirection...");
          setTimeout(() => navigate("/dashboard"), 1500);
        } else {
          // Cette condition ne devrait pas être atteinte si login() lève une erreur en cas d'échec
          throw new Error(response.message || "Réponse inattendue du serveur.");
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.detail || error.message || "Erreur de connexion. Veuillez vérifier vos identifiants.";
        toast.error(`❌ ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    // La structure Grid et Card de Material UI est supprimée.
    // Nous retournons directement le formulaire et les boutons,
    // qui seront stylés par Tailwind CSS dans LoginPage.tsx.
    <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Boutons de connexion sociale */}
        <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center py-2.5 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
            <FcGoogle className="w-5 h-5 mr-3" />
            Continuer avec Google
        </button>
        <button
            type="button"
            onClick={handleFacebookLogin}
            className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
            <FaFacebookF className="w-5 h-5 mr-3" /> {/* Utilisation de FaFacebookF */}
            Continuer avec Facebook
        </button>

        {/* Séparateur "ou" */}
        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-300" />
            </div>
            <div className="relative flex justify-center">
                <span className="bg-white px-3 text-sm text-slate-500">ou</span>
            </div>
        </div>

        {/* Champ Email */}
        <div>
            <label htmlFor="email-login" className="block text-sm font-medium text-slate-700 mb-1"> {/* id unique */}
                Adresse e-mail
            </label>
            <input
                id="email-login"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`appearance-none block w-full px-3.5 py-2.5 border rounded-md shadow-sm placeholder-slate-400 focus:outline-none sm:text-sm transition-colors ${
                    formik.touched.email && formik.errors.email
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
                placeholder="vous@exemple.com"
            />
            {formik.touched.email && formik.errors.email ? (
                <p className="mt-1.5 text-xs text-red-600">{formik.errors.email}</p>
            ) : null}
        </div>

        {/* Champ Mot de passe */}
        <div>
            <label htmlFor="password-login" className="block text-sm font-medium text-slate-700 mb-1">  {/* id unique */}
                Mot de passe
            </label>
            <div className="relative">
                <input
                    id="password-login"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`appearance-none block w-full px-3.5 py-2.5 border rounded-md shadow-sm placeholder-slate-400 focus:outline-none sm:text-sm transition-colors ${
                        formik.touched.password && formik.errors.password
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                    placeholder="Votre mot de passe"
                />
                <button
                    type="button"
                    onClick={handleTogglePassword}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-slate-500 hover:text-slate-700 focus:outline-none"
                    aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                >
                    {showPassword ? <MdVisibilityOff className="h-5 w-5" /> : <MdVisibility className="h-5 w-5" />}
                </button>
            </div>
            {formik.touched.password && formik.errors.password ? (
                <p className="mt-1.5 text-xs text-red-600">{formik.errors.password}</p>
            ) : null}
        </div>

        {/* Option mot de passe oublié - déjà géré par LoginPage.tsx */}
        {/*
        <div className="flex items-center justify-end text-sm">
            <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                Mot de passe oublié ?
            </Link>
        </div>
        */}

        {/* Bouton de Soumission */}
        <div>
            <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
                {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    'Se Connecter'
                )}
            </button>
        </div>
    </form>
    // Le lien "Pas encore de compte ?" sera géré par LoginPage.tsx
  );
};

export default LoginForm;