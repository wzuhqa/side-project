import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';

function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await api.getWishlist();
      setWishlist(response.data.data || []);
    } catch (err) {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await api.removeFromWishlist(productId);
      setWishlist(wishlist.filter(item => item._id !== productId));
      toast.success('Removed from wishlist');
    } catch (err) {
      toast.error('Failed to remove');
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    // Optionally remove from wishlist
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading"><div className="spinner"></div></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Wishlist - ShopNow</title>
      </Helmet>

      <div className="wishlist-page">
        <div className="container">
          <h1 className="page-title">My Wishlist</h1>
          <p className="page-subtitle">{wishlist.length} items in your wishlist</p>

          {wishlist.length === 0 ? (
            <div className="empty-state">
              <FiHeart size={64} />
              <h2>Your wishlist is empty</h2>
              <p>Save items you love by clicking the heart icon</p>
              <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
            </div>
          ) : (
            <div className="wishlist-grid">
              {wishlist.map(product => (
                <div key={product._id} className="wishlist-item">
                  <ProductCard product={product} />
                  <div className="wishlist-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleAddToCart(product)}
                    >
                      <FiShoppingCart size={18} />
                      Add to Cart
                    </button>
                    <button 
                      className="remove-btn"
                      onClick={() => handleRemoveFromWishlist(product._id)}
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <style jsx>{`
          .wishlist-page {
            padding: 40px 0;
            background: #f9fafb;
            min-height: 80vh;
          }

          .page-title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
          }

          .page-subtitle {
            color: #6b7280;
            margin-bottom: 32px;
          }

          .empty-state {
            text-align: center;
            padding: 80px 20px;
            background: #fff;
            border-radius: 12px;
          }

          .empty-state svg {
            color: #d1d5db;
            margin-bottom: 24px;
          }

          .empty-state h2 {
            margin-bottom: 8px;
          }

          .empty-state p {
            color: #6b7280;
            margin-bottom: 24px;
          }

          .wishlist-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }

          .wishlist-item {
            position: relative;
          }

          .wishlist-actions {
            display: flex;
            gap: 8px;
            margin-top: 12px;
          }

          .wishlist-actions .btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .remove-btn {
            width: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            color: #ef4444;
            transition: all 0.2s;
          }

          .remove-btn:hover {
            background: #fef2f2;
          }

          @media (max-width: 1024px) {
            .wishlist-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }

          @media (max-width: 768px) {
            .wishlist-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 16px;
            }
          }
        `}</style>
      </div>
    </>
  );
}

export default WishlistPage;
