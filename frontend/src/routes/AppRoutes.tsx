import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import GoogleCallback from "../pages/GoogleCallback";
import SendEmailPage from "../pages/SendEmailPage";
import HomePage from "../pages/HomePage";
import Contact from "../components/Contact";
import About from "../components/About";
import PricingPage from "../pages/PricingPage";
import DashboardPage from "../pages/DashboardPage"; 
import FormulaireForm from "../AppContent";
import GenerateTemplatePage from "../pages/GenerateTemplatePage";
import ProfilePage from "../pages/ProfilePage";
import SettingsPage from "../pages/SettingsPage";
import MyTemplatesPage from "../pages/MyTemplatesPage";
import AboutPage from "../pages/AboutPage";
import ContactPage from "../pages/ContactPage";
import AdminPage from "../pages/admin/AdminPage";
import ManageUsersPage from "../pages/admin/ManageUsersPage";
import adminSettings from "../pages/admin/adminSettings";
import adminProfile from "../pages/admin/adminProfile";
import AdminProfileComponent from "../pages/admin/adminProfile";
import AdminSettingsComponent from "../pages/admin/adminSettings";

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/sendemail" element={<SendEmailPage />} />
      <Route path="/auth/callback/google" element={<GoogleCallback />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage/>} />
      <Route path="/contact" element={<ContactPage/>} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/generate-json" element={<FormulaireForm />} />
      <Route path="/generate-template" element={<GenerateTemplatePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/my-templates" element={<MyTemplatesPage />} /> 
      <Route path="/admin" element={<AdminPage />} /> 
      <Route path="/manage-users" element={<ManageUsersPage />} />

      <Route path="/admin-settings" element={<AdminSettingsComponent/>} /> 
      <Route path="/admin-profile" element={<AdminProfileComponent />} /> 










    </Routes>
  </Router>
);

export default AppRoutes;
