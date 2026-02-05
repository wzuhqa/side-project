import React, { useState, useEffect } from 'react';
import { useFlashSale } from '../context/FlashSaleContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { useTranslation } from 'react-i18next';
import './FlashSalePage.css';

const FlashSalePage = () => {
  const { flashSales, loading, timeRemaining, getStockPercentage } = useFlashSale();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [selectedSale, setSelectedSale] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});

  useEffect(() => {
    if (flashSales.length > 0) {
      setSelectedSale(flashSales[0]);
    }
  }, [flashSales]);

  const handleAddToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      alert(t('auth.loginRequired'));
      return;
    }

    setAddingToCart(prev => ({ ...prev, [product._id]: true }));
    
    try {
      await addToCart(product._id, quantity);
      alert(t('cart.addedToCart'));
    } catch (error) {
      alert(error.message);
    } finally {
      setAddingToCart(prev => ({ ...prev, [product._id]: false }));
    }
  };

  const formatTime = (time) => {
    if (!time) return { days: '00', hours: '00', minutes: '00', seconds: '00' };
    return {
      days: String(time.days || 0).padStart(2, '0'),
      hours: String(time.hours || 0).padStart(2, '0'),
      minutes: String(time.minutes || 0).padStart(2, '0'),
      seconds: String(time.seconds || 0).padStart(2, '0')
    };
  };

  const currentTime = selectedSale ? timeRemaining[selectedSale._id] : null;
  const time = formatTime(currentTime);

  if (loading) {
    return (
      <div className="flash-sale-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!flashSales.length) {
    return (
      <div className="flash-sale-page">
        <div className="no-sales">
          <h2>🔕 {t('flashSales.noActive')}</h2>
          <p>{t('flashSales.checkBack')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flash-sale-page">
      {/* Hero Section */}
      <section className="flash-hero">
        <div className="flash-hero-content">
          <span className="flash-badge">⚡ {t('flashSale.title')}</span>
          {selectedSale && (
            <div className="countdown-timer">
              <div className="timer-block">
                <span className="timer-value">{time.days}</span>
                <span className="timer-label">{t('time.days')}</span>
              </div>
              <div className="timer-separator">:</div>
              <div className="timer-block">
                <span className="timer-value">{time.hours}</span>
                <span className="timer-label">{t('time.hours')}</span>
              </div>
              <div className="timer-separator">:</div>
              <div className="timer-block">
                <span className="timer-value">{time.minutes}</span>
                <span className="timer-label">{t('time.minutes')}</span>
              </div>
              <div className="timer-separator">:</div>
              <div className="timer-block">
                <span className="timer-value">{time.seconds}</span>
                <span className="timer-label">{t('time.seconds')}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Sale Navigation */}
      <nav className="flash-nav">
        {flashSales.map(sale => (
          <button
            key={sale._id}
            className={`flash-nav-item ${selectedSale?._id === sale._id ? 'active' : ''}`}
            onClick={() => setSelectedSale(sale)}
          >
            {sale.name}
          </button>
        ))}
      </nav>

      {/* Products Grid */}
      <section className="flash-products">
        {selectedSale?.products.map(item => {
          const stockPercent = getStockPercentage(item.stock, item.soldCount);
          const isLowStock = stockPercent >= 80;
          const isSoldOut = item.stock <= 0;

          return (
            <div key={item.product._id} className="flash-product-card">
              <div className="flash-discount-badge">
                -{item.discountPercentage}%
              </div>
              
              <div className="product-image">
                <img 
                  src={item.product.images?.[0]?.url || '/placeholder.png'} 
                  alt={item.product.name}
                />
                {isLowStock && !isSoldOut && (
                  <span className="stock-warning">
                    {t('flashSale.sellingFast')}
                  </span>
                )}
                {isSoldOut && (
                  <span className="sold-out-badge">
                    {t('flashSale.soldOut')}
                  </span>
                )}
              </div>

              <div className="product-info">
                <h3>{item.product.name}</h3>
                
                <div className="price-section">
                  <span className="flash-price">${item.flashPrice.toFixed(2)}</span>
                  <span className="original-price">${item.originalPrice.toFixed(2)}</span>
                </div>

                {/* Stock Progress Bar */}
                <div className="stock-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${stockPercent}%` }}
                    ></div>
                  </div>
                  <span className="stock-text">
                    {isSoldOut ? t('flashSale.soldOut') : `${item.stock} left`}
                  </span>
                </div>

                <button
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(item.product, 1)}
                  disabled={isSoldOut || addingToCart[item.product._id]}
                >
                  {addingToCart[item.product._id] 
                    ? t('common.adding') 
                    : isSoldOut 
                      ? t('flashSale.soldOut')
                      : t('flashSale.buyNow')
                  }
                </button>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default FlashSalePage;
