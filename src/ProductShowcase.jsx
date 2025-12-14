import React from "react";
import { Link } from "react-router-dom";
import "./ProductShowcase.css";
import Footer from "./Footer";
import ProductCard from "./components/ProductCard";

const ProductShowcase = () => {
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    fetch('/api/apps')
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch apps:", err);
        setError("Failed to load apps. Please ensure the backend server is running.");
        setLoading(false);
      });
  }, []);

  return (
    <main className="showcase-wrapper">
      <nav className="breadcrumb">
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">Products</span>
      </nav>

      <header className="showcase-header">
        <h1>Ambient Products</h1>
      </header>

      <section className="product-grid">
        {loading && <p>Loading apps...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
      <Footer />
    </main>
  );
};


export default ProductShowcase; 