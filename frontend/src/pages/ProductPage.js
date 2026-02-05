import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiStar, FiHeart, FiShare2, FiShoppingCart, FiMinus, FiPlus, FiCheck, FiChevronRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import ProductRecommendations from '../components/ProductRecommendations';
import toast from 'react-hot-toast';
import { getProductImage } from '../utils/imageHelpers';

function ProductPage() {
  const { slug } = useParams();
  const { addToCart, loading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    setImageError(false);
    try {
      const response = await api.getProduct(slug);
      setProduct(response.data.data);
      
      // Fetch related products
      if (response.data.data?._id) {
        const relatedResponse = await api.getRelatedProducts(response.data.data._id);
        setRelatedProducts(relatedResponse.data.data || []);
        
        // Fetch reviews
        const reviewsResponse = await api.getProductReviews(response.data.data._id, { limit: 5 });
        setReviews(reviewsResponse.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant);
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }
    try {
      await api.addToWishlist(product._id);
      toast.success('Added to wishlist');
    } catch (err) {
      toast.error('Failed to add to wishlist');
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="product-loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>Product not found</h2>
          <Link to="/products" className="btn btn-primary">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const primaryImage = images[selectedImage]?.url || product.image;
  
  const imageUrl = imageError 
    ? 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%23e0e0e0" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E'
    : (primaryImage || getProductImage(product));

  // Calculate discount
  const discountPercentage = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <>
      <Helmet>
        <title>{product.name} - ShopNova</title>
        <meta name="description" content={product.shortDescription || product.description?.slice(0, 160)} />
      </Helmet>

      <div className="product-page">
        <div className="container">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <FiChevronRight />
            <Link to="/products">Shop</Link>
            <FiChevronRight />
            <span>{product.name}</span>
          </div>

          <div className="product-layout">
            {/* Image Gallery */}
            <div className="product-gallery">
              <div className="main-image">
                <img 
                  src={imageUrl} 
                  alt={product.name}
                  onError={handleImageError}
                />
                {discountPercentage > 0 && (
                  <span className="image-badge">-{discountPercentage}%</span>
                )}
              </div>
              {(images.length > 1 || (images.length === 0 && product.image)) && (
                <div className="thumbnail-list">
                  {images.length > 0 ? (
                    images.map((img, index) => (
                      <button
                        key={index}
                        className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                        onClick={() => setSelectedImage(index)}
                      >
                        <img 
                          src={img.url} 
                          alt={`${product.name} ${index + 1}`}
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3C/svg%3E';
                          }}
                        />
                      </button>
                    ))
                  ) : (
                    <button
                      className={`thumbnail active`}
                      onClick={() => setSelectedImage(0)}
                    >
                      <img 
                        src={product.image}
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3C/svg%3E';
                        }}
                      />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="product-info">
              {product.brand && <span className="product-brand">{product.brand}</span>}
              
              <h1 className="product-title">{product.name}</h1>

              {/* Rating */}
              <div className="product-rating">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <FiStar 
                      key={i} 
                      size={18} 
                      fill={i < Math.floor(product.rating || product.ratings?.average || 0) ? '#f59e0b' : 'none'}
                      color="#f59e0b"
                    />
                  ))}
                </div>
                <span className="rating-text">
                  {(product.rating || product.ratings?.average || 0).toFixed(1)} ({product.reviewCount || product.ratings?.count || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="product-price-section">
                <span className="current-price">${product.price?.toFixed(2)}</span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <>
                    <span className="original-price">${product.compareAtPrice.toFixed(2)}</span>
                    <span className="discount-badge">
                      -{discountPercentage}%
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="product-description">
                {product.shortDescription || product.description?.slice(0, 300)}
              </p>

              {/* Variants */}
              {product.variants?.length > 0 && (
                <div className="product-variants">
                  <h4>Options</h4>
                  <div className="variant-options">
                    {product.variants.map((variant, index) => (
                      <button
                        key={index}
                        className={`variant-btn ${selectedVariant?.name === variant.name ? 'active' : ''}`}
                        onClick={() => setSelectedVariant(variant)}
                      >
                        {variant.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="quantity-selector">
                <h4>Quantity</h4>
                <div className="quantity-controls">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <FiMinus size={18} />
                  </button>
                  <span className="quantity-value">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= (product.quantity || 100)}
                  >
                    <FiPlus size={18} />
                  </button>
                </div>
                {(product.quantity || 100) <= product.lowStockThreshold && (product.quantity || 100) > 0 && (
                  <span className="stock-warning">Only {product.quantity || 100} left!</span>
                )}
              </div>

              {/* Stock Status */}
              <div className="stock-status">
                {(product.quantity || 100) > 0 ? (
                  <span className="in-stock"><FiCheck size={18} /> In Stock</span>
                ) : (
                  <span className="out-of-stock">Out of Stock</span>
                )}
              </div>

              {/* Actions */}
              <div className="product-actions">
                <button 
                  className="add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={(product.quantity || 100) <= 0 || cartLoading}
                >
                  <FiShoppingCart size={20} />
                  {cartLoading ? 'Adding...' : 'Add to Cart'}
                </button>
                <button className="wishlist-btn" onClick={handleAddToWishlist}>
                  <FiHeart size={20} />
                </button>
                <button className="share-btn">
                  <FiShare2 size={20} />
                </button>
              </div>

              {/* Product Details */}
              <div className="product-meta">
                {product.sku && <p><strong>SKU:</strong> {product.sku}</p>}
                {product.category && (
                  <p><strong>Category:</strong> <Link to={`/products?category=${product.category.slug}`}>{product.category.name}</Link></p>
                )}
                {product.tags?.length > 0 && (
                  <p><strong>Tags:</strong> {product.tags.join(', ')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="product-tabs">
            <div className="tab-buttons">
              <button 
                className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button 
                className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('specifications')}
              >
                Specifications
              </button>
              <button 
                className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews ({product.reviewCount || product.ratings?.count || 0})
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'description' && (
                <div className="description-content">
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                </div>
              )}
              {activeTab === 'specifications' && (
                <div className="specifications-content">
                  {product.specifications?.length > 0 ? (
                    <table className="specs-table">
                      <tbody>
                        {product.specifications.map((spec, index) => (
                          <tr key={index}>
                            <td>{spec.name}</td>
                            <td>{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No specifications available.</p>
                  )}
                </div>
              )}
              {activeTab === 'reviews' && (
                <div className="reviews-content">
                  {reviews.length > 0 ? (
                    reviews.map(review => (
                      <div key={review._id} className="review-item">
                        <div className="review-header">
                          <div className="reviewer-info">
                            <div className="reviewer-avatar">
                              {review.user?.firstName?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="reviewer-name">{review.user?.firstName} {review.user?.lastName}</p>
                              <p className="review-date">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="review-rating">
                            {[...Array(5)].map((_, i) => (
                              <FiStar key={i} size={14} fill={i < review.rating ? '#f59e0b' : 'none'} color="#f59e0b" />
                            ))}
                          </div>
                        </div>
                        <h4 className="review-title">{review.title}</h4>
                        <p className="review-content">{review.content}</p>
                      </div>
                    ))
                  ) : (
                    <p>No reviews yet. Be the first to review this product!</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <ProductRecommendations 
            type="similar" 
            productId={product._id} 
            category={product.category?.slug}
            limit={4} 
            title="You May Also Like" 
          />

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="related-section">
              <h2 className="section-title">Related Products</h2>
              <div className="products-grid">
                {relatedProducts.map(p => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>

        <style jsx>{`
          .product-page {
            padding: 32px 0 64px;
          }

          .breadcrumb {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 24px;
          }

          .breadcrumb a {
            color: #6366f1;
          }

          .product-layout {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 48px;
            margin-bottom: 64px;
          }

          .product-gallery {
            position: sticky;
            top: 100px;
          }

          .main-image {
            background: #f9fafb;
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 16px;
            position: relative;
          }

          .main-image img {
            width: 100%;
            aspect-ratio: 1;
            object-fit: contain;
          }

          .image-badge {
            position: absolute;
            top: 16px;
            left: 16px;
            background: #ef4444;
            color: white;
            padding: 8px 16px;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 700;
          }

          .thumbnail-list {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }

          .thumbnail {
            width: 80px;
            height: 80px;
            padding: 4px;
            border: 2px solid transparent;
            border-radius: 8px;
            overflow: hidden;
            cursor: pointer;
            transition: border-color 0.2s;
            background: none;
          }

          .thumbnail.active,
          .thumbnail:hover {
            border-color: #6366f1;
          }

          .thumbnail img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 4px;
          }

          .product-info {
            padding: 16px 0;
          }

          .product-brand {
            font-size: 13px;
            color: #6366f1;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
            display: block;
          }

          .product-title {
            font-size: 32px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 16px;
            line-height: 1.3;
          }

          .product-rating {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
          }

          .stars {
            display: flex;
            gap: 4px;
          }

          .rating-text {
            font-size: 14px;
            color: #6b7280;
          }

          .product-price-section {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
          }

          .current-price {
            font-size: 28px;
            font-weight: 700;
            color: #1f2937;
          }

          .original-price {
            font-size: 18px;
            color: #9ca3af;
            text-decoration: line-through;
          }

          .discount-badge {
            padding: 4px 10px;
            background: #fef2f2;
            color: #ef4444;
            font-size: 14px;
            font-weight: 600;
            border-radius: 4px;
          }

          .product-description {
            color: #4b5563;
            line-height: 1.8;
            margin-bottom: 24px;
          }

          .product-variants {
            margin-bottom: 24px;
          }

          .product-variants h4,
          .quantity-selector h4 {
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 12px;
          }

          .variant-options {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }

          .variant-btn {
            padding: 10px 20px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            background: white;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 500;
          }

          .variant-btn:hover {
            border-color: #6366f1;
          }

          .variant-btn.active {
            border-color: #6366f1;
            background: #6366f1;
            color: white;
          }

          .quantity-controls {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 12px;
          }

          .quantity-controls button {
            width: 40px;
            height: 40px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            background: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          }

          .quantity-controls button:hover:not(:disabled) {
            border-color: #6366f1;
            color: #6366f1;
          }

          .quantity-controls button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .quantity-value {
            font-size: 18px;
            font-weight: 600;
            min-width: 40px;
            text-align: center;
          }

          .stock-warning {
            color: #ef4444;
            font-size: 14px;
            font-weight: 500;
          }

          .stock-status {
            margin-bottom: 24px;
          }

          .in-stock {
            color: #059669;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .out-of-stock {
            color: #ef4444;
            font-weight: 600;
          }

          .product-actions {
            display: flex;
            gap: 12px;
            margin-bottom: 24px;
          }

          .add-to-cart-btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 16px 32px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            border: none;
            border-radius: 50px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
          }

          .add-to-cart-btn:hover:not(:disabled) {
            box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
            transform: translateY(-2px);
          }

          .add-to-cart-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .wishlist-btn,
          .share-btn {
            width: 50px;
            height: 50px;
            border: 2px solid #e5e7eb;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            color: #6b7280;
          }

          .wishlist-btn:hover {
            border-color: #ef4444;
            color: #ef4444;
          }

          .share-btn:hover {
            border-color: #6366f1;
            color: #6366f1;
          }

          .product-meta {
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
          }

          .product-meta p {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 8px;
          }

          .product-meta a {
            color: #6366f1;
          }

          /* Tabs */
          .product-tabs {
            margin-bottom: 64px;
          }

          .tab-buttons {
            display: flex;
            gap: 8px;
            margin-bottom: 24px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 0;
          }

          .tab-btn {
            padding: 16px 24px;
            background: none;
            border: none;
            font-size: 16px;
            font-weight: 600;
            color: #6b7280;
            cursor: pointer;
            position: relative;
            transition: color 0.2s;
          }

          .tab-btn:hover {
            color: #6366f1;
          }

          .tab-btn.active {
            color: #6366f1;
          }

          .tab-btn.active::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            right: 0;
            height: 2px;
            background: #6366f1;
          }

          .tab-content {
            background: white;
            padding: 32px;
            border-radius: 12px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          }

          .specs-table {
            width: 100%;
          }

          .specs-table td {
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
          }

          .specs-table td:first-child {
            font-weight: 600;
            color: #374151;
            width: 200px;
          }

          .review-item {
            padding: 20px 0;
            border-bottom: 1px solid #e5e7eb;
          }

          .review-item:last-child {
            border-bottom: none;
          }

          .review-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;
          }

          .reviewer-info {
            display: flex;
            gap: 12px;
            align-items: center;
          }

          .reviewer-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
          }

          .reviewer-name {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 2px;
          }

          .review-date {
            font-size: 12px;
            color: #9ca3af;
          }

          .review-title {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 8px;
          }

          .review-content {
            color: #4b5563;
            line-height: 1.6;
          }

          .related-section {
            margin-top: 64px;
          }

          .related-section .section-title {
            margin-bottom: 32px;
          }

          .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 24px;
          }

          @media (max-width: 768px) {
            .product-layout {
              grid-template-columns: 1fr;
              gap: 32px;
            }

            .product-title {
              font-size: 24px;
            }

            .current-price {
              font-size: 24px;
            }

            .product-actions {
              flex-wrap: wrap;
            }

            .add-to-cart-btn {
              width: 100%;
            }

            .wishlist-btn,
            .share-btn {
              flex: 1;
            }
          }
        `}</style>
      </div>
    </>
  );
}

export default ProductPage;
