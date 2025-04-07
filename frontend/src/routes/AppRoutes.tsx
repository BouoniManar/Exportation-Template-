import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import GoogleCallback from "../pages/GoogleCallback";
import SendEmailPage from "../pages/SendEmailPage";
import HomePage from "../pages/HomePage";
import Contact from "../components/Contact";
import About from "../components/About";
import PricingPage from "../pages/PricingPage";

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/sendemail" element={<SendEmailPage />} />
      <Route path="/auth/callback/google" element={<GoogleCallback />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<About/>} />
      <Route path="/contact" element={<Contact/>} />
      <Route path="/pricing" element={<PricingPage />} />


    </Routes>
  </Router>
);

export default AppRoutes;
