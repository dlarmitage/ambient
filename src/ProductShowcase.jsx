import React from "react";
import { Link } from "react-router-dom";
import "./ProductShowcase.css";
import Footer from "./Footer";

const products = [
  {
    id: 1,
    name: "News Check",
    description: "Instantly spot bias & misinformation with AI-driven article analysis and credibility scores.",
    link: "https://news-check.org",
    image: "/images/news-check.webp",
  },
  {
    id: 2,
    name: "Ask Alice",
    description: "AI-powered clinical supervision & role-play assistant for mental-health professionals.",
    link: "https://askalice.app",
    image: "/images/askalice.webp",
  },
  {
    id: 3,
    name: "Crush the Interview",
    description: "AI interview coach offering mock sessions, feedback & confidence boosts before your big day.",
    link: "https://crush-the-interview.com",
    image: "/images/crush-the-interview.webp",
  },
  {
    id: 4,
    name: "PhotoLog",
    description: "PhotoLog combines the best of travel documentation with AI-powered cultural intelligence, creating experiences no other app can match.",
    link: "https://www.photolog.app",
    image: "/images/photolog.webp",
  },
  {
    id: 5,
    name: "Podcast Creator",
    description: "Turn articles & ideas into polished podcast scripts and audio in minutes with AI.",
    link: "https://podcast-creator.com",
    image: "/images/podcast-creator.webp",
  },
  {
    id: 6,
    name: "PracticePerfect",
    description: "Track and gamify your daily practice sessions to hit skill-building goals faster.",
    link: "https://practiceperfect.online",
    image: "/images/practiceperfect.webp",
  },
  {
    id: 7,
    name: "QR Creator",
    description: "Generate high-quality QR codes for contacts & URLs — free, no sign-in.",
    link: "https://qr-creator.us",
    image: "/images/qr-creator.webp",
  },
  {
    id: 8,
    name: "Explore Venao",
    description: "Discover culture, real-estate, and adventure in Playa Venao, Panama.",
    link: "https://www.venao.online",
    image: "/images/venao.webp",
  },

];

const ProductShowcase = () => {
  return (
    <main className="showcase-wrapper">
      <nav className="breadcrumb">
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">Products</span>
      </nav>
      <header className="showcase-header">
        <h1>Ambient Product Showcase</h1>
        <p>
          Explore our growing collection of web apps—all designed
          to feel <em>indistinguishable from magic</em>.
        </p>
      </header>

      <section className="product-grid">
        {products.map((product) => (
          <a
            href={product.link}
            className="product-card"
            key={product.id}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="card-media">
              <img src={product.image} alt={product.name} loading="lazy" />
            </div>
            <div className="card-content">
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <span className="card-cta">Open ↗</span>
            </div>
          </a>
        ))}
      </section>
      <Footer />
    </main>
  );
};


export default ProductShowcase; 