import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import ProductShowcase from "./ProductShowcase";
import "./App.css";
import "./ProductShowcase.css";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/products" element={<ProductShowcase />} />
    </Routes>
  </Router>
);
