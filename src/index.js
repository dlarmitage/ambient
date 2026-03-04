import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import App from "./App";
import ProjectShowcase from "./ProjectShowcase";
import Privacy from "./Privacy";
import Disclosures from "./Disclosures";
import "./App.css";
import "./ProjectShowcase.css";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";

const AdminRoot = () => {
  // Simple token management in memory/localStorage for this demo
  const [token, setToken] = React.useState(localStorage.getItem('adminToken'));

  const navigate = useNavigate();

  const handleSetToken = (newToken) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('adminToken', newToken);
    } else {
      localStorage.removeItem('adminToken');
    }
  };

  const handleLogout = () => {
    handleSetToken(null);
    navigate('/'); // Redirect to home
  };

  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/projects" element={<ProjectShowcase />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/disclosures" element={<Disclosures />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLogin setToken={handleSetToken} />} />
      <Route
        path="/admin/dashboard"
        element={token ? <AdminDashboard token={token} onLogout={handleLogout} /> : <AdminLogin setToken={handleSetToken} />}
      />

      {/* Catch-all redirect to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <Router>
    <AdminRoot />
  </Router>
);
