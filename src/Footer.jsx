import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => (
  <footer className="site-footer">
    <div className="footer-content">
      <span>© {new Date().getFullYear()} Ambient Technology</span>
      <span className="footer-separator">·</span>
      <Link to="/privacy" className="footer-link">Privacy</Link>
    </div>
  </footer>
);

export default Footer; 