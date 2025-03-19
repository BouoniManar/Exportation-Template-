import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { 
  TextField, Button, Box, Typography, IconButton, InputAdornment 
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const handleTogglePassword = () => setShowPassword((prev) => !prev);
  const handleToggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  // Simuler la connexion avec Google et Facebook
  const handleGoogleLogin = () => {
    window.location.href = "http://127.0.0.1:8000/auth/google";
  };
  
  const handleFacebookLogin = () => {
    window.location.href = "http://127.0.0.1:8000/auth/facebook";
  };
  

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      username: Yup.string().required("Le nom d'utilisateur est requis"),
      email: Yup.string().email("Email invalide").required("L'email est requis"),
      password: Yup.string().min(6, "Au moins 6 caractères").required("Mot de passe requis"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Les mots de passe doivent correspondre")
        .required("Confirmez le mot de passe"),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        const response = await axios.post("http://127.0.0.1:8001/users/", values);
        console.log(" Inscription réussie :", response.data);
        
        // Afficher un toast de succès
        toast.success("🎉 Inscription réussie ! Redirection vers la connexion...");
    
        // ✅ Redirection après 2 secondes
        setTimeout(() => navigate("/login"), 2000);
      } catch (error) {
        console.error("Erreur lors de l'inscription :", error);
        
        // Afficher un toast d'erreur
        toast.error("Erreur d'inscription, essayez un autre email.");
        setErrors({ email: "Erreur d'inscription, essayez un autre email." });
      } finally {
        setSubmitting(false);
      }
        
    },
    
  });

  return (
    <Box sx={{ width: 400, mx: "auto", mt: 5, p: 3, boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>Inscription</Typography>
      
      {/* Boutons de connexion Google & Facebook */}
      <Button 
        fullWidth 
        variant="outlined" 
        startIcon={<FcGoogle />} 
        onClick={handleGoogleLogin} 
        sx={{ mb: 1, textTransform: "none" }}
      >
        S'inscrire avec Google
      </Button>
      
      <Button 
        fullWidth 
        variant="contained" 
        startIcon={<FaFacebook />} 
        onClick={handleFacebookLogin} 
        sx={{ mb: 2, backgroundColor: "#1877F2", textTransform: "none" }}
      >
        S'inscrire avec Facebook
      </Button>

      <Typography sx={{ textAlign: "center", my: 1 }}>ou</Typography>

      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          margin="normal"
          label="Nom"
          {...formik.getFieldProps("username")}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Email"
          type="email"
          {...formik.getFieldProps("email")}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Mot de passe"
          type={showPassword ? "text" : "password"}
          {...formik.getFieldProps("password")}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleTogglePassword} edge="end">
                  {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Confirmer le mot de passe"
          type={showConfirmPassword ? "text" : "password"}
          {...formik.getFieldProps("confirmPassword")}
          error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
          helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleToggleConfirmPassword} edge="end">
                  {showConfirmPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          S'inscrire
        </Button>
      </form>
      <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
        Déjà un compte ?{" "}
        <Link to="/login" style={{ color: "#1976d2", textDecoration: "none" }}>
          Se connecter
        </Link>
      </Typography>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </Box>
  );
};

export default RegisterForm;
