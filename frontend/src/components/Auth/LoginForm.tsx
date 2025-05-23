// src/components/Auth/LoginForm.tsx
import React, { useState, useEffect } from "react"; // Ajout de useEffect
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom"; // Réintroduire useNavigate
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import { toast } from "react-toastify";
import { LoginFormValues } from "../../types/authTypes";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: contextLogin, user, isAuthenticated, isLoading: authIsLoading } = useAuth(); // Récupérer user, isAuthenticated, authIsLoading

  const [loginAttempted, setLoginAttempted] = useState(false); // Pour savoir si on doit vérifier la redirection

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  const handleGoogleLogin = async () => {
    try {
      const response = await axios.get<{ auth_url: string }>("http://127.0.0.1:8001/auth/google");
      window.location.href = response.data.auth_url;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'URL Google OAuth :", error);
      toast.error("Impossible de démarrer la connexion Google.");
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
      setLoginAttempted(false); // Réinitialiser
      try {
        await contextLogin(values.email, values.password);
        // AuthContext gère le token.
        // On va attendre que le useEffect ci-dessous réagisse à la mise à jour de 'user'
        toast.success("Connexion réussie ! Redirection en cours...");
        setLoginAttempted(true); // Indiquer qu'on peut essayer de rediriger
      } catch (error: any) {
        const errorMessage = error.response?.data?.detail || error.message || "Erreur de connexion. Veuillez vérifier vos identifiants.";
        toast.error(`❌ ${errorMessage}`);
        setLoading(false); // Assurez-vous que loading est false en cas d'erreur aussi
      }
      // Ne pas mettre setLoading(false) ici si la redirection est gérée par useEffect,
      // sinon, le mettre dans le finally si on veut que le bouton redevienne actif immédiatement.
      // Pour cet exemple, on le laisse ici pour que le spinner s'arrête si contextLogin échoue vite.
    },
  });

  // useEffect pour gérer la redirection APRES que le contexte ait mis à jour l'utilisateur
  useEffect(() => {
    // Ne rien faire si auth est encore en train de charger, ou si on n'a pas tenté de se connecter,
    // ou si on n'est pas authentifié, ou si user n'est pas encore défini
    if (authIsLoading || !loginAttempted || !isAuthenticated || !user) {
      if (loginAttempted && !authIsLoading && !isAuthenticated) {
        // Si la tentative de login a eu lieu, que auth n'est plus en chargement,
        // mais qu'on n'est toujours pas authentifié, cela signifie que login a échoué silencieusement dans le contexte
        // ou que fetchUser a échoué. setLoading ici est pour le cas où onSubmit n'a pas appelé setLoading(false)
        setLoading(false);
        setLoginAttempted(false);
      }
      return;
    }

    // Si on arrive ici, loginAttempted = true, isAuthenticated = true, user est défini
    console.log("LoginForm useEffect: User role for redirection:", user.role);
    if (user.role === 'admin') {
      navigate("/admin", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
    setLoading(false); // Arrêter le spinner après la redirection
    setLoginAttempted(false); // Réinitialiser pour la prochaine connexion

  }, [user, isAuthenticated, loginAttempted, navigate, authIsLoading]);


  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* ... (JSX du formulaire reste le même que votre code original) ... */}
        {/* Champ Email */}
        <div>
            <label htmlFor="email-login" className="block text-sm font-medium text-slate-700 mb-1">
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
            <label htmlFor="password-login" className="block text-sm font-medium text-slate-700 mb-1">
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

        {/* Bouton de Soumission */}
        <div>
            <button
                type="submit"
                disabled={loading || authIsLoading} // Désactiver aussi si auth est en chargement
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
                {(loading || authIsLoading) ? ( // Afficher spinner si loading OU authIsLoading
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
  );
};

export default LoginForm;