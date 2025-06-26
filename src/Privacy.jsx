import React from "react";
import "./Privacy.css";

const Privacy = () => (
  <main className="privacy-wrapper">
    <section className="privacy-content">
      <h1>Privacy Policy</h1>
      <p>
        <strong>Last updated:</strong> {new Date().toLocaleDateString()}
      </p>
      <p>
        We value your privacy. Ambient Technology does not sell, share, or use your data for advertising or analytics. All information you provide is used solely to deliver our services and improve your experience.
      </p>
      <ul>
        <li>We do not track you across the web.</li>
        <li>We do not use your data to train AI models.</li>
        <li>We do not share your information with third parties.</li>
        <li>All data is stored securely and only for as long as necessary.</li>
      </ul>
      <p>
        If you have any questions about your privacy, please contact us at <a href="mailto:privacy@ambient.technology">privacy@ambient.technology</a>.
      </p>
    </section>
  </main>
);

export default Privacy; 