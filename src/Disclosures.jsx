import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Disclosures.css";
import Seo from "./Seo";

const Disclosures = () => {
  useEffect(() => {
    // Load the Typebot script dynamically
    const script = document.createElement('script');
    script.type = 'module';
    script.innerHTML = `
      import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0/dist/web.js';
      Typebot.initStandard({ typebot: "my-typebot-bkxrd2c" });
    `;
    document.head.appendChild(script);

    // Cleanup function to remove script when component unmounts
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <main className="disclosures-wrapper">
      <Seo
        title="Disclosures · Ambient Technology"
        description="Disclosures from Ambient Technology."
        path="/disclosures"
      />
      <section className="disclosures-content">
        <nav className="disclosures-breadcrumb">
          <Link to="/" className="disclosures-home-link">Home</Link>
          <span className="disclosures-separator">›</span>
          <span className="disclosures-current">Disclosures</span>
        </nav>
        <div className="typebot-container">
          <typebot-standard style={{height: '85vh'}}></typebot-standard>
        </div>
      </section>
    </main>
  );
};

export default Disclosures;
