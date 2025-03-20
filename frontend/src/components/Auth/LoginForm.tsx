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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LoginFormValues , LoginResponse} from "../../types/authTypes";
import { login } from "../../services/authService";
import axios from "axios";


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
      email: Yup.string().email("Email invalide").required("Champ requis"),
      password: Yup.string().min(6, "Minimum 6 caractères").required("Champ requis"),
    }),

    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response: LoginResponse = await login(values);
        if (response && response.access_token) {
          localStorage.setItem("token", response.access_token);
          toast.success(" Connexion réussie !");
          setTimeout(() => navigate("/dashboard"), 1500);
        } else {
          throw new Error(response.message || "Réponse inattendue du serveur.");
        }
      } catch (error: any) {
        toast.error(`❌ ${error.response?.data?.detail || "Erreur de connexion."}`);
      } finally {
        setLoading(false);
      }
    
    },  
  });
  
  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 5, p: 3, boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h5" sx={{ textAlign: "center", mb: 2 }}>Connexion</Typography>

      <ToastContainer position="top-right" autoClose={3000} />

      <Button fullWidth variant="outlined" startIcon={<FcGoogle />} onClick={handleGoogleLogin} sx={{ mb: 1 }}>
        Connexion avec Google
      </Button>
      <Button fullWidth variant="contained" startIcon={<FaFacebook />} onClick={handleFacebookLogin} sx={{ mb: 2, backgroundColor: "#1877F2" }}>
        Connexion avec Facebook
      </Button>

      <Typography sx={{ textAlign: "center", my: 1 }}>ou</Typography>

      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth margin="normal" label="Email" name="email" type="email"
          value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />
        <TextField
          fullWidth margin="normal" label="Mot de passe" name="password"
          type={showPassword ? "text" : "password"} value={formik.values.password}
          onChange={formik.handleChange} onBlur={formik.handleBlur}
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
          <Link to="/forgot-password" style={{ textDecoration: "none" }}>Mot de passe oublié ?</Link>
        </Box>
        <Button 
          type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} 
          disabled={loading}
        >
          {loading ? "Connexion..." : "Connexion"}
        </Button>
      </form>

      <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
        Pas encore de compte ? <Link to="/register" style={{ textDecoration: "none" }}>Créer un compte</Link>
      </Typography>
    </Box>
  );
};

export default LoginForm;
