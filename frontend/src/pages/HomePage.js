import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ProductRecommendations from '../components/ProductRecommendations';
import './HomePage.css';

// Simple lightweight SVG placeholder
const simplePlaceholder = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ccircle cx='200' cy='180' r='60' fill='%23d1d5db'/%3E%3Crect x='160' y='260' width='80' height='20' rx='4' fill='%239ca3af'/%3E%3C/svg%3E`;

const categories = [
  { id: 'electronics', name: 'Electronics', icon: '📱', count: 10, color: '#667eea' },
  { id: 'fashion', name: 'Fashion', icon: '👗', count: 8, color: '#ff6b9d' },
  { id: 'home-garden', name: 'Home & Garden', icon: '🏠', count: 6, color: '#4ecdc4' },
  { id: 'sports-outdoors', name: 'Sports & Outdoors', icon: '⚽', count: 5, color: '#45b7d1' },
  { id: 'beauty-personal-care', name: 'Beauty', icon: '💄', count: 5, color: '#f7b731' },
  { id: 'books-media', name: 'Books & Media', icon: '📚', count: 4, color: '#a55eea' },
  { id: 'toys-games', name: 'Toys & Games', icon: '🎮', count: 4, color: '#fc5c65' },
  { id: 'automotive', name: 'Automotive', icon: '🚗', count: 3, color: '#26de81' },
  { id: 'health-wellness', name: 'Health', icon: '💪', count: 3, color: '#fd79a8' },
  { id: 'food-beverages', name: 'Food & Beverages', icon: '🍕', count: 2, color: '#e17055' }
];

// Lightweight sample products with inline SVG placeholders
const sampleProducts = [
  { _id: '1', name: 'Apple iPhone 15 Pro Max', slug: 'apple-iphone-15-pro-max', price: 1199.99, compareAtPrice: 1299.99, rating: 4.8, reviewCount: 245, category: 'electronics', image: simplePlaceholder },
  { _id: '2', name: 'Samsung Galaxy S24 Ultra', slug: 'samsung-galaxy-s24-ultra', price: 1299.99, compareAtPrice: 1399.99, rating: 4.7, reviewCount: 189, category: 'electronics', image: simplePlaceholder },
  { _id: '3', name: 'MacBook Pro 16-inch M3', slug: 'apple-macbook-pro-16-m3-max', price: 3499.99, compareAtPrice: 3799.99, rating: 4.9, reviewCount: 156, category: 'electronics', image: simplePlaceholder },
  { _id: '4', name: 'Sony WH-1000XM5 Headphones', slug: 'sony-wh-1000xm5', price: 399.99, compareAtPrice: 449.99, rating: 4.6, reviewCount: 421, category: 'electronics', image: simplePlaceholder },
  { _id: '5', name: 'AirPods Pro 2nd Gen', slug: 'apple-airpods-pro-2', price: 249.99, compareAtPrice: 279.99, rating: 4.5, reviewCount: 892, category: 'electronics', image: simplePlaceholder },
  { _id: '6', name: 'Nintendo Switch OLED', slug: 'nintendo-switch-oled', price: 349.99, rating: 4.6, reviewCount: 567, category: 'electronics', image: simplePlaceholder },
  { _id: '7', name: 'Dyson V15 Detect Vacuum', slug: 'dyson-v15-detect-absolute', price: 749.99, compareAtPrice: 849.99, rating: 4.5, reviewCount: 234, category: 'electronics', image: simplePlaceholder },
  { _id: '8', name: 'iPad Pro 12.9-inch M2', slug: 'ipad-pro-12-9-m2', price: 1099.99, compareAtPrice: 1199.99, rating: 4.7, reviewCount: 312, category: 'electronics', image: simplePlaceholder },
  { _id: '9', name: 'Nike Air Force 1', slug: 'nike-air-force-1-07', price: 110.00, rating: 4.6, reviewCount: 1245, category: 'fashion', image: simplePlaceholder },
  { _id: '10', name: "Levi's 501 Original Jeans", slug: 'levis-501-original-fit', price: 79.50, rating: 4.5, reviewCount: 892, category: 'fashion', image: simplePlaceholder },
  { _id: '11', name: 'Adidas Originals Hoodie', slug: 'adidas-originals-hoodie', price: 65.00, compareAtPrice: 80.00, rating: 4.4, reviewCount: 456, category: 'fashion', image: simplePlaceholder },
  { _id: '12', name: 'Ray-Ban Aviator Classic', slug: 'ray-ban-aviator-classic', price: 183.00, rating: 4.7, reviewCount: 678, category: 'fashion', image: simplePlaceholder },
  { _id: '13', name: 'Instant Pot Duo 7-in-1', slug: 'instant-pot-duo-7-in-1', price: 99.99, compareAtPrice: 129.99, rating: 4.7, reviewCount: 2456, category: 'home-garden', image: simplePlaceholder },
  { _id: '14', name: 'Kindle Paperwhite', slug: 'kindle-paperwhite-signature', price: 189.99, compareAtPrice: 209.99, rating: 4.6, reviewCount: 456, category: 'books-media', image: simplePlaceholder },
  { _id: '15', name: 'PlayStation 5 Console', slug: 'playstation-5-console', price: 499.99, compareAtPrice: 549.99, rating: 4.7, reviewCount: 1234, category: 'toys-games', image: simplePlaceholder },
  { _id: '16', name: 'Vitamix 5200 Blender', slug: 'vitamix-5200-blender', price: 449.99, compareAtPrice: 549.99, rating: 4.8, reviewCount: 1234, category: 'food-beverages', image: simplePlaceholder }
];

// Marquee text for animated banner
const marqueeText = [
  '🎉 UP TO 40% OFF | FREE SHIPPING $50+ | 🎉 NEW YEAR SALE',
  '🔥 HOT DEALS | LIMITED TIME OFFERS | 🔥 PREMIUM QUALITY',
  '⚡ FLASH SALE | UP TO 50% OFF | ⚡ FREE RETURNS',
  '💎 BEST PRICES GUARANTEED | 💎 TOP BRANDS | 💎 SHOP NOVA'
];

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Faster loading with minimal delay
    const timer = setTimeout(() => {
      setFeaturedProducts(sampleProducts.slice(0, 8));
      setNewArrivals(sampleProducts.slice(8, 16));
      setDeals(sampleProducts.filter(p => p.compareAtPrice).slice(0, 4));
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="home-page">
      {/* Animated Marquee Banner */}
      <div className="marquee-banner">
        <div className="marquee-content">
          <div className="marquee-track">
            {[...marqueeText, ...marqueeText].map((text, index) => (
              <span key={index} className="marquee-text">
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <span className="hero-badge">New Year Sale</span>
          <h1>Up to 40% Off</h1>
          <p>Premium products across all categories</p>
          <div className="hero-cta">
            <Link to="/products?category=deals" className="cta-btn primary">
              Shop Deals
            </Link>
            <Link to="/products" className="cta-btn secondary">
              Browse All
            </Link>
          </div>
        </div>
        <div className="hero-features">
          <div className="feature">
            <span>🚚</span>
            <span>Free Shipping</span>
          </div>
          <div className="feature">
            <span>↩️</span>
            <span>Easy Returns</span>
          </div>
          <div className="feature">
            <span>🔒</span>
            <span>Secure Payment</span>
          </div>
          <div className="feature">
            <span>💬</span>
            <span>24/7 Support</span>
          </div>
        </div>
      </section>

      {/* Promo Banners */}
      <section className="promo-banners">
        <Link to="/products?category=electronics" className="promo-banner electronics">
          <span className="promo-icon">📱</span>
          <div className="promo-info">
            <h3>Electronics</h3>
            <p>Up to 30% Off</p>
          </div>
        </Link>
        <Link to="/products?category=fashion" className="promo-banner fashion">
          <span className="promo-icon">👗</span>
          <div className="promo-info">
            <h3>Fashion</h3>
            <p>New Season Styles</p>
          </div>
        </Link>
        <Link to="/products?category=home-garden" className="promo-banner home">
          <span className="promo-icon">🏠</span>
          <div className="promo-info">
            <h3>Home & Garden</h3>
            <p>Fresh Arrivals</p>
          </div>
        </Link>
      </section>

      {/* Categories Grid */}
      <section className="categories-section">
        <h2 className="section-title">Shop by Category</h2>
        <div className="categories-grid">
          {categories.map(cat => (
            <Link 
              key={cat.id} 
              to={`/products?category=${cat.id}`}
              className="category-card"
              style={{ '--category-color': cat.color }}
            >
              <span className="category-icon">{cat.icon}</span>
              <span className="category-name">{cat.name}</span>
              <span className="category-count">{cat.count} products</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="products-section">
        <div className="section-header">
          <h2 className="section-title">Featured Products</h2>
          <Link to="/products" className="view-all">
            View All →
          </Link>
        </div>
        {loading ? (
          <div className="loading-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="product-skeleton">
                <div className="skeleton-image"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text short"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="products-grid">
            {featuredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Deals Section */}
      <section className="deals-section">
        <div className="section-header">
          <h2 className="section-title">Hot Deals 🔥</h2>
          <Link to="/products?category=deals" className="view-all">
            View All →
          </Link>
        </div>
        <div className="deals-grid">
          {deals.map(product => {
            const discount = product.compareAtPrice 
              ? Math.round((1 - product.price / product.compareAtPrice) * 100)
              : 0;
            return (
              <Link key={product._id} to={`/product/${product.slug}`} className="deal-card">
                <span className="deal-badge">-{discount}%</span>
                <div className="deal-image-wrapper">
                  <img 
                    src={product.image || simplePlaceholder} 
                    alt={product.name} 
                    loading="lazy"
                  />
                </div>
                <h3>{product.name}</h3>
                <div className="deal-pricing">
                  <span className="deal-price">${product.price?.toFixed(2)}</span>
                  <span className="deal-original">${product.compareAtPrice?.toFixed(2)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recommendations */}
      <ProductRecommendations type="trending" limit={4} title="Trending Now" />

      {/* New Arrivals */}
      <section className="products-section">
        <div className="section-header">
          <h2 className="section-title">New Arrivals ✨</h2>
          <Link to="/products?sort=newest" className="view-all">
            View All →
          </Link>
        </div>
        <div className="products-grid">
          {newArrivals.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="newsletter-cta">
        <div className="newsletter-content">
          <h2>Stay Updated</h2>
          <p>Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
          <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert('Thanks for subscribing!'); }}>
            <input type="email" placeholder="Enter your email" required />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
