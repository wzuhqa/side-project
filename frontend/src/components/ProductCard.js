import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar, FiEye } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './ProductCard.css';

// Lightweight placeholder
const placeholderImg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ccircle cx='200' cy='180' r='60' fill='%23d1d5db'/%3E%3Crect x='160' y='260' width='80' height='20' rx='4' fill='%239ca3af'/%3E%3C/svg%3E`;

function ProductCard({ product }) {
  const { addToCart, loading } = useCart();
  const { isAuthenticated } = useAuth();

  const {
    _id,
    name,
    slug,
    price,
    compareAtPrice,
    image,
    rating,
    reviewCount,
    brand
  } = product;

  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Simple intersection observer for visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const imageUrl = imageError ? placeholderImg : (image || placeholderImg);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }

    try {
      await api.addToWishlist(_id);
      toast.success('Added to wishlist');
    } catch (err) {
      toast.error('Failed to add to wishlist');
    }
  };

  // Calculate discount
  const discountPercentage = compareAtPrice && compareAtPrice > price 
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) 
    : 0;
  const isOnSale = discountPercentage > 0;
  const isInStock = product.quantity > 0 || product.allowBackorders;

  const productRating = rating || 0;
  const productReviewCount = reviewCount || 0;

  const maxNameLength = 50;
  const truncatedName = name?.length > maxNameLength ? name.substring(0, maxNameLength) + '...' : name;

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      ref={cardRef}
      className={`product-card ${isInView ? 'visible' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${slug}`} className="product-card-link">
        {/* Badges */}
        <div className="product-badges">
          {isOnSale && (
            <span className="badge badge-danger">
              -{discountPercentage}%
            </span>
          )}
          {!isInStock && (
            <span className="badge badge-warning">Out of Stock</span>
          )}
        </div>

        {/* Actions */}
        <div className={`product-actions ${isHovered ? 'visible' : ''}`}>
          <button 
            className="product-action-btn"
            onClick={handleAddToWishlist}
            title="Add to Wishlist"
          >
            <FiHeart />
          </button>
          <button 
            className="product-action-btn"
            title="Quick View"
          >
            <FiEye />
          </button>
        </div>

        {/* Image */}
        <div className="product-image">
          <img 
            src={imageUrl} 
            alt={name}
            loading="lazy"
            onError={handleImageError}
          />
        </div>

        {/* Content */}
        <div className="product-content">
          {brand && (
            <p className="product-brand">
              {brand}
            </p>
          )}
          <h3 className="product-name">
            {truncatedName}
          </h3>
          
          {/* Rating */}
          <div className="product-rating">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <FiStar 
                  key={i}
                  size={14} 
                  fill={i < Math.floor(productRating) ? '#f59e0b' : 'none'}
                  color="#f59e0b"
                />
              ))}
            </div>
            <span className="rating-count">({productReviewCount})</span>
          </div>

          {/* Price */}
          <div className="product-price">
            <span className="price">${price?.toFixed(2)}</span>
            {compareAtPrice && compareAtPrice > price && (
              <span className="price-original">${compareAtPrice.toFixed(2)}</span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button 
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={!isInStock || loading}
          >
            <FiShoppingCart size={18} />
            {isInStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </Link>
    </div>
  );
}

export default ProductCard;
