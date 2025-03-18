import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
      
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
