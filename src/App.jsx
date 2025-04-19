import React from "react";
import "./App.css";

const App = () => {
  return (
    <div className="hero-container">
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
