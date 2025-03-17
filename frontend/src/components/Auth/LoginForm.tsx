import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { 
  TextField, Button, Box, Typography, IconButton, InputAdornment 
} from "@mui/material";
import { login } from "../../services/authService";
import { LoginFormValues } from "../../types/authTypes";
import { Link } from "react-router-dom";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  const handleGoogleLogin = () => {
    alert("Connexion avec Google !");
  };

  const handleFacebookLogin = () => {
    alert("Connexion avec Facebook !");
  };

  const formik = useFormik<LoginFormValues>({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Email invalide").required("Champ requis"),
      password: Yup.string().min(6, "Minimum 6 caractères").required("Champ requis"),
    }),
    onSubmit: async (values) => {
      try {
        await login(values);
        alert("Connexion réussie !");
      } catch (error) {
        alert("Erreur de connexion");
      }
    },
  });

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 5, p: 3, boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h5" sx={{ textAlign: "center", mb: 2 }}>Connexion</Typography>

      {/* Boutons Google & Facebook */}
      <Button 
        fullWidth 
        variant="outlined" 
        startIcon={<FcGoogle />} 
        onClick={handleGoogleLogin} 
        sx={{ mb: 1, textTransform: "none" }}
      >
        Connexion avec Google
      </Button>
      
      <Button 
        fullWidth 
        variant="contained" 
        startIcon={<FaFacebook />} 
        onClick={handleFacebookLogin} 
        sx={{ mb: 2, backgroundColor: "#1877F2", textTransform: "none" }}
      >
        Connexion avec Facebook
      </Button>

      <Typography sx={{ textAlign: "center", my: 1 }}>ou</Typography>

      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          margin="normal"
          label="Email"
          name="email"
          type="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Mot de passe"
          name="password"
          type={showPassword ? "text" : "password"}
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
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
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
          <Link to="/forgot-password" style={{ color: "#1976d2", textDecoration: "none" }}>
            Mot de passe oublié ?
          </Link>
        </Box>
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Connexion
        </Button>
      </form>
      
      <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
        Pas encore de compte ?{" "}
        <Link to="/register" style={{ color: "#1976d2", textDecoration: "none" }}>
          Créer un compte
        </Link>
      </Typography>
    </Box>
  );
};

export default LoginForm;
