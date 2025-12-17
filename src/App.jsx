import React from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import Footer from "./Footer";

import AmbientLogo from "./components/AmbientLogo";

const App = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/projects");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" || e.key === " ") handleNavigate();
  };

  return (
    <>
      <div
        className="hero-container"
        onClick={handleNavigate}
        role="button"
        tabIndex={0}
        onKeyPress={handleKeyPress}
      >
        <div className="hero-background">
          <AmbientLogo />
        </div>
        <div className="hero-overlay">
          <h1 className="hero-title">Ambient Technology</h1>
          <h2 className="hero-subheading">indistinguishable from magic</h2>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default App;
