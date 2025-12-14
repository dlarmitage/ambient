import React from 'react';
import '../ProductShowcase.css';

const ProductCard = ({ product, isAdmin, onDelete, onClick }) => {
    const Wrapper = isAdmin ? 'div' : 'a';
    const props = isAdmin ? {
        className: 'product-card admin-card', // Added admin-card class for specific overrides
        onClick: onClick
    } : {
        href: product.link,
        className: 'product-card',
        target: '_blank',
        rel: 'noopener noreferrer'
    };

    return (
        <Wrapper {...props}>
            <div className="card-media">
                <img src={product.image_url} alt={product.name} />
            </div>
            <div className="card-content">
                <h2>{product.name}</h2>
                <p>{product.description}</p>
                <span className="card-cta">{isAdmin ? 'Edit' : 'Open ↗'}</span>
            </div>
            {isAdmin && onDelete && (
                <button
                    className="card-delete-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(product.id);
                    }}
                    aria-label="Delete app"
                >
                    🗑
                </button>
            )}
        </Wrapper>
    );
};

export default ProductCard;
