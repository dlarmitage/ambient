import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Disclosures.css";

const Disclosures = () => {
  useEffect(() => {
    // Load the Typebot script dynamically
    const script = document.createElement('script');
    script.type = 'module';
    script.innerHTML = `
      import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0/dist/web.js';
      Typebot.initStandard({});
    `;
    document.head.appendChild(script);

    // Cleanup function to remove script when component unmounts
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <main className="disclosures-wrapper">
      <section className="disclosures-content">
        <nav className="disclosures-breadcrumb">
          <Link to="/" className="disclosures-home-link">Home</Link>
          <span className="disclosures-separator">›</span>
          <span className="disclosures-current">Disclosures</span>
        </nav>
        <div className="typebot-container">
          <typebot-standard style={{height: '100vh'}}></typebot-standard>
        </div>
      </section>
    </main>
  );
};

export default Disclosures;
