import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import './BundlePage.css';

const BundlePage = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  
  const [bundle, setBundle] = useState(null);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const response = await api.get('/bundles');
        setBundles(response.data.bundles);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch bundles:', error);
        setLoading(false);
      }
    };

    fetchBundles();
  }, []);

  useEffect(() => {
    if (slug && bundles.length > 0) {
      const selected = bundles.find(b => b.slug === slug);
      setBundle(selected);
    } else if (bundles.length > 0 && !slug) {
      setBundle(bundles[0]);
    }
  }, [slug, bundles]);

  const handleAddBundleToCart = async () => {
    if (!isAuthenticated) {
      alert(t('auth.loginRequired'));
      return;
    }

    setAddingToCart(true);
    
    try {
      // Add each product in the bundle to cart
      for (const item of bundle.products) {
        await addToCart(item.product._id, item.quantity);
      }
      alert(t('bundle.addedToCart'));
    } catch (error) {
      alert(error.message);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="bundle-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bundle-page">
      {/* Bundle Navigation */}
      <nav className="bundle-nav">
        {bundles.map(b => (
          <a
            key={b._id}
            href={`/bundles/${b.slug}`}
            className={`bundle-nav-item ${bundle?._id === b._id ? 'active' : ''}`}
          >
            {b.name}
          </a>
        ))}
      </nav>

      {bundle ? (
        <div className="bundle-content">
          {/* Bundle Header */}
          <header className="bundle-header">
            <div className="bundle-badge">
              {bundle.displaySettings?.badge || 'Bundle Deal'}
            </div>
            <h1>{bundle.name}</h1>
            {bundle.shortDescription && (
              <p className="bundle-short-desc">{bundle.shortDescription}</p>
            )}
          </header>

          <div className="bundle-layout">
            {/* Products List */}
            <section className="bundle-products">
              <h2>{t('bundle.whatsIncluded')}</h2>
              
              {bundle.products.map((item, index) => (
                <div key={index} className="bundle-item">
                  <div className="item-image">
                    <img 
                      src={item.product.images?.[0]?.url || '/placeholder.png'}
                      alt={item.product.name}
                    />
                    {item.discountValue > 0 && (
                      <span className="item-discount">
                        -{item.discountValue}% {item.discountType === 'percentage' ? 'OFF' : ''}
                      </span>
                    )}
                  </div>
                  
                  <div className="item-details">
                    <h3>{item.product.name}</h3>
                    <div className="item-price">
                      <span className="original">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                      <span className="discounted">
                        ${((item.product.price * item.quantity) * (1 - item.discountValue / 100)).toFixed(2)}
                      </span>
                    </div>
                    <span className="item-quantity">
                      Qty: {item.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </section>

            {/* Bundle Summary */}
            <aside className="bundle-summary">
              <div className="bundle-card">
                <div className="bundle-pricing">
                  <div className="original-price">
                    <span className="label">{t('bundle.separately')}</span>
                    <span className="amount">${bundle.pricing.originalPrice.toFixed(2)}</span>
                  </div>
                  <div className="bundle-price">
                    <span className="label">{t('bundle.bundlePrice')}</span>
                    <span className="amount">${bundle.pricing.bundlePrice.toFixed(2)}</span>
                  </div>
                  <div className="savings-badge">
                    {t('bundle.save')} ${bundle.pricing.savingsAmount.toFixed(2)} ({bundle.pricing.savingsPercentage}%)
                  </div>
                </div>

                {/* Stock Status */}
                {bundle.inventory && (
                  <div className="stock-status">
                    {bundle.inventory.totalStock > bundle.inventory.lowStockThreshold ? (
                      <span className="in-stock">✓ {t('bundle.inStock')}</span>
                    ) : (
                      <span className="low-stock">
                        ⚠ {t('bundle.onlyLeft', { count: bundle.inventory.totalStock })}
                      </span>
                    )}
                  </div>
                )}

                <button
                  className="add-bundle-btn"
                  onClick={handleAddBundleToCart}
                  disabled={addingToCart || bundle.status !== 'active'}
                >
                  {addingToCart ? t('common.adding') : t('bundle.addBundleToCart')}
                </button>

                {/* Trust Badges */}
                <div className="trust-badges">
                  <div className="badge">
                    <span>🔒</span> {t('bundle.securePayment')}
                  </div>
                  <div className="badge">
                    <span>📦</span> {t('bundle.freeShipping')}
                  </div>
                  <div className="badge">
                    <span>↩️</span> {t('bundle.easyReturns')}
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* Bundle Description */}
          {bundle.description && (
            <section className="bundle-description">
              <h2>{t('bundle.aboutBundle')}</h2>
              <p>{bundle.description}</p>
            </section>
          )}
        </div>
      ) : (
        <div className="no-bundles">
          <h2>📦 {t('bundle.noBundles')}</h2>
          <p>{t('bundle.checkBackLater')}</p>
        </div>
      )}

      {/* More Bundles */}
      {bundles.length > 1 && (
        <section className="more-bundles">
          <h2>{t('bundle.moreBundles')}</h2>
          <div className="bundles-grid">
            {bundles.filter(b => b._id !== bundle?._id).slice(0, 3).map(b => (
              <a key={b._id} href={`/bundles/${b.slug}`} className="bundle-card-small">
                <div className="card-image">
                  <img 
                    src={b.images?.[0]?.url || '/placeholder.png'}
                    alt={b.name}
                  />
                </div>
                <div className="card-content">
                  <h3>{b.name}</h3>
                  <div className="card-pricing">
                    <span className="price">${b.pricing.bundlePrice.toFixed(2)}</span>
                    <span className="savings">Save {b.pricing.savingsPercentage}%</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BundlePage;
