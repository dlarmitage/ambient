import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import App from "./App";
import ProductShowcase from "./ProductShowcase";
import Privacy from "./Privacy";
import Disclosures from "./Disclosures";
import "./App.css";
import "./ProductShowcase.css";
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
      <Route path="/products" element={<ProductShowcase />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/disclosures" element={<Disclosures />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLogin setToken={handleSetToken} />} />
      <Route
        path="/admin/dashboard"
        element={token ? <AdminDashboard token={token} onLogout={handleLogout} /> : <AdminLogin setToken={handleSetToken} />}
      />
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
