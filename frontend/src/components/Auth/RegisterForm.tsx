// src/components/Auth/RegisterForm.tsx (ou où que soit votre fichier)
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
// Supprimez les imports de Material UI car nous ne les utilisons plus pour les champs
// import { TextField, Button, Box, Typography, IconButton, InputAdornment } from "@mui/material";
import { Box, Typography, IconButton, InputAdornment } from "@mui/material"; // Gardez pour la structure et les icônes d'œil
import { Link, useNavigate } from "react-router-dom";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa"; // Utilisez FaFacebookF pour une icône plus adaptée au bouton
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const handleTogglePassword = () => setShowPassword((prev) => !prev);
  const handleToggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);
  // const [loading, setLoading] = useState(false); // Pas utilisé dans votre logique de soumission actuelle pour RegisterForm

  // Simuler la connexion avec Google et Facebook (logique inchangée)
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

  const formik = useFormik({
    initialValues: {
      name: "", // Gardé 'name' pour la logique
      email: "",
      password: "",
      confirmPassword: "",
    },
    // La logique de validation reste la même, mais le champ 'username' doit correspondre à 'name'
    validationSchema: Yup.object({
      name: Yup.string().required("Le nom est requis"), // Changé 'username' en 'name'
      email: Yup.string().email("Email invalide").required("L'email est requis"),
      password: Yup.string().min(6, "Au moins 6 caractères").required("Mot de passe requis"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Les mots de passe doivent correspondre")
        .required("Confirmez le mot de passe"),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      // La logique de soumission reste la même
      try {
        // NOTE: Si votre backend attend 'username' au lieu de 'name', vous devrez mapper ici:
        // const submissionValues = { ...values, username: values.name };
        // delete submissionValues.name; // Si 'name' ne doit pas être envoyé
        // const response = await axios.post("http://127.0.0.1:8001/users/", submissionValues);

        const response = await axios.post("http://127.0.0.1:8001/users/", values);
        console.log(" Inscription réussie :", response.data);
        toast.success("Inscription réussie ! Redirection vers la connexion...");
        setTimeout(() => navigate("/login"), 2000);
      } catch (error) {
        console.error("Erreur lors de l'inscription :", error);
        toast.error("Erreur d'inscription, essayez un autre email.");
        setErrors({ email: "Erreur d'inscription, essayez un autre email." });
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Wrapper pour les icônes si les erreurs TS persistent (recommandé)
  const MdVisibilityIcon = (props: React.ComponentProps<typeof MdVisibility>) => <MdVisibility {...props} />;
  const MdVisibilityOffIcon = (props: React.ComponentProps<typeof MdVisibilityOff>) => <MdVisibilityOff {...props} />;
  const FcGoogleIcon = (props: React.ComponentProps<typeof FcGoogle>) => <FcGoogle {...props} />;
  const FaFacebookIcon = (props: React.ComponentProps<typeof FaFacebookF>) => <FaFacebookF {...props} />;


  return (
    // Box Material UI pour la structure principale et l'ombre
    <Box sx={{ width: { xs: '90%', sm: 400 }, mx: "auto", mt: 5, p: { xs: 2, sm: 3 }, boxShadow: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
      <Typography variant="h5" sx={{ mb: 2, textAlign: "center", fontWeight: 'bold', color: 'text.primary' }}>
        Créer un compte
      </Typography>

      {/* Boutons de connexion sociale avec style inspiré de LoginForm */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center py-2.5 px-4 mb-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
      >
        <FcGoogleIcon className="w-5 h-5 mr-3" />
        S'inscrire avec Google
      </button>

      <button
        type="button"
        onClick={handleFacebookLogin}
        className="w-full flex items-center justify-center py-2.5 px-4 mb-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        <FaFacebookIcon className="w-5 h-5 mr-3" />
        S'inscrire avec Facebook
      </button>

      {/* Séparateur "ou" */}
      <div className="relative my-4">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-300" />
          </div>
          <div className="relative flex justify-center">
              <span className="bg-white px-3 text-sm text-slate-500">ou continuer avec</span>
          </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-6"> {/* Ajout de space-y-6 pour l'espacement */}
        {/* Champ Nom */}
        <div>
            <label htmlFor="name-register" className="block text-sm font-medium text-slate-700 mb-1">
                Nom complet
            </label>
            <input
                id="name-register"
                type="text"
                autoComplete="name"
                required
                {...formik.getFieldProps("name")} // Simplification pour lier à Formik
                className={`appearance-none block w-full px-3.5 py-2.5 border rounded-md shadow-sm placeholder-slate-400 focus:outline-none sm:text-sm transition-colors ${
                    formik.touched.name && formik.errors.name
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
                placeholder="Votre nom complet"
            />
            {formik.touched.name && formik.errors.name ? (
                <p className="mt-1.5 text-xs text-red-600">{formik.errors.name}</p>
            ) : null}
        </div>

        {/* Champ Email */}
        <div>
            <label htmlFor="email-register" className="block text-sm font-medium text-slate-700 mb-1">
                Adresse e-mail
            </label>
            <input
                id="email-register"
                type="email"
                autoComplete="email"
                required
                {...formik.getFieldProps("email")}
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
            <label htmlFor="password-register" className="block text-sm font-medium text-slate-700 mb-1">
                Mot de passe
            </label>
            <div className="relative">
                <input
                    id="password-register"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    {...formik.getFieldProps("password")}
                    className={`appearance-none block w-full px-3.5 py-2.5 border rounded-md shadow-sm placeholder-slate-400 focus:outline-none sm:text-sm transition-colors ${
                        formik.touched.password && formik.errors.password
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                    placeholder="Créez un mot de passe"
                />
                <button
                    type="button"
                    onClick={handleTogglePassword}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-slate-500 hover:text-slate-700 focus:outline-none"
                    aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                >
                    {showPassword ? <MdVisibilityOffIcon className="h-5 w-5" /> : <MdVisibilityIcon className="h-5 w-5" />}
                </button>
            </div>
            {formik.touched.password && formik.errors.password ? (
                <p className="mt-1.5 text-xs text-red-600">{formik.errors.password}</p>
            ) : null}
        </div>

        {/* Champ Confirmer le mot de passe */}
        <div>
            <label htmlFor="confirmPassword-register" className="block text-sm font-medium text-slate-700 mb-1">
                Confirmer le mot de passe
            </label>
            <div className="relative">
                <input
                    id="confirmPassword-register"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    {...formik.getFieldProps("confirmPassword")}
                    className={`appearance-none block w-full px-3.5 py-2.5 border rounded-md shadow-sm placeholder-slate-400 focus:outline-none sm:text-sm transition-colors ${
                        formik.touched.confirmPassword && formik.errors.confirmPassword
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                    placeholder="Retapez votre mot de passe"
                />
                <button
                    type="button"
                    onClick={handleToggleConfirmPassword}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-slate-500 hover:text-slate-700 focus:outline-none"
                    aria-label={showConfirmPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                >
                    {showConfirmPassword ? <MdVisibilityOffIcon className="h-5 w-5" /> : <MdVisibilityIcon className="h-5 w-5" />}
                </button>
            </div>
            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                <p className="mt-1.5 text-xs text-red-600">{formik.errors.confirmPassword}</p>
            ) : null}
        </div>

        {/* Bouton de Soumission */}
        <button
            type="submit"
            disabled={formik.isSubmitting} // Utiliser formik.isSubmitting
            className="w-full flex justify-center py-3 px-4 mt-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
        >
            {formik.isSubmitting ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                "S'inscrire"
            )}
        </button>
      </form>

      <Typography variant="body2" sx={{ mt: 3, textAlign: "center", color: 'text.secondary' }}>
        Déjà un compte ?{" "}
        <Link to="/login" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: '500' }} className="hover:underline">
          Se connecter
        </Link>
      </Typography>
      <ToastContainer position="bottom-right" autoClose={3000} theme="colored" hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </Box>
  );
};

export default RegisterForm;