import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';
import './ProductRecommendations.css';

const ProductRecommendations = ({ 
  type = 'personalized', // personalized, frequentlyBought, similar, trending
  productId = null,
  limit = 4,
  title = null
}) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { t } = useTranslation();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});

  useEffect(() => {
    fetchRecommendations();
  }, [type, productId, limit]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      let endpoint = '/products';
      
      switch (type) {
        case 'personalized':
          if (!isAuthenticated) return setProducts([]);
          endpoint = `/recommendations/personalized?limit=${limit}`;
          break;
        case 'frequentlyBought':
          if (!productId) return setProducts([]);
          endpoint = `/recommendations/frequently-bought/${productId}?limit=${limit}`;
          break;
        case 'similar':
          if (!productId) return setProducts([]);
          endpoint = `/recommendations/similar/${productId}?limit=${limit}`;
          break;
        case 'trending':
          endpoint = `/recommendations/trending?limit=${limit}`;
          break;
        default:
          break;
      }
      
      const response = await api.get(endpoint);
      setProducts(response.data.products || response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    setAddingToCart(prev => ({ ...prev, [product._id]: true }));
    
    try {
      await addToCart(product._id, 1);
    } catch (error) {
      console.error('Add to cart error:', error);
    } finally {
      setAddingToCart(prev => ({ ...prev, [product._id]: false }));
    }
  };

  const getSectionTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'personalized':
        return t('recommendations.personalizedForYou');
      case 'frequentlyBought':
        return t('recommendations.frequentlyBought');
      case 'similar':
        return t('recommendations.similarProducts');
      case 'trending':
        return t('recommendations.trending');
      default:
        return t('recommendations.recommended');
    }
  };

  if (loading) {
    return (
      <section className="recommendations-section">
        <div className="section-header">
          <h2>{getSectionTitle()}</h2>
        </div>
        <div className="recommendations-grid loading">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="recommendation-skeleton">
              <div className="skeleton-image"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text short"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!products.length) {
    return null;
  }

  return (
    <section className="recommendations-section">
      <div className="section-header">
        <h2>{getSectionTitle()}</h2>
        <Link to="/products" className="view-all-link">
          {t('common.viewAll')} →
        </Link>
      </div>
      
      <div className="recommendations-grid">
        {products.slice(0, limit).map(product => (
          <article key={product._id} className="recommendation-card">
            <Link to={`/product/${product.slug}`} className="product-link">
              <div className="product-image">
                <img 
                  src={product.images?.[0]?.url || '/placeholder.png'}
                  alt={product.name}
                />
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="sale-badge">
                    -{Math.round((1 - product.price / product.compareAtPrice) * 100)}%
                  </span>
                )}
              </div>
              
              <div className="product-info">
                <h3>{product.name}</h3>
                
                <div className="rating">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`star ${i < Math.round(product.rating || 0) ? 'filled' : ''}`}>
                      ★
                    </span>
                  ))}
                  {product.reviewCount > 0 && (
                    <span className="review-count">({product.reviewCount})</span>
                  )}
                </div>
                
                <div className="price-section">
                  <span className="current-price">${product.price.toFixed(2)}</span>
                  {product.compareAtPrice && (
                    <span className="original-price">${product.compareAtPrice.toFixed(2)}</span>
                  )}
                </div>
              </div>
            </Link>
            
            <button
              className="quick-add-btn"
              onClick={(e) => {
                e.preventDefault();
                handleAddToCart(product);
              }}
              disabled={addingToCart[product._id]}
            >
              {addingToCart[product._id] ? t('common.adding') : t('common.addToCart')}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ProductRecommendations;
