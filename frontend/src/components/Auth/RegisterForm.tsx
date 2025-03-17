import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { 
  TextField, Button, Box, Typography, IconButton, InputAdornment 
} from "@mui/material";
import { Link } from "react-router-dom";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleTogglePassword = () => setShowPassword((prev) => !prev);
  const handleToggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  // Simuler la connexion avec Google et Facebook
  const handleGoogleLogin = () => {
    alert("Connexion avec Google !");
  };

  const handleFacebookLogin = () => {
    alert("Connexion avec Facebook !");
  };

  const formik = useFormik({
    initialValues: {
      username: "",
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
    onSubmit: (values) => {
      console.log("Form Values:", values);
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
          label="Nom d'utilisateur"
          {...formik.getFieldProps("username")}
          error={formik.touched.username && Boolean(formik.errors.username)}
          helperText={formik.touched.username && formik.errors.username}
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
    </Box>
  );
};

export default RegisterForm;
