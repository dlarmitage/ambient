import React from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

const App = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/products");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" || e.key === " ") handleNavigate();
  };

  return (
    <div
      className="hero-container"
      onClick={handleNavigate}
      role="button"
      tabIndex={0}
      onKeyPress={handleKeyPress}
    >
      <video
        className="hero-video"
        src="/hero.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />
      <div className="hero-overlay">
        <h1 className="hero-title">Ambient Technology</h1>
        <h2 className="hero-subheading">indistinguishable from magic</h2>
      </div>
    </div>
  );
};

export default App;
