import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import GoogleCallback from "../pages/GoogleCallback";
import SendEmailPage from "../pages/SendEmailPage";

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/sendemail" element={<SendEmailPage />} />
      <Route path="/auth/callback/google" element={<GoogleCallback />} />
    </Routes>
  </Router>
);

export default AppRoutes;
