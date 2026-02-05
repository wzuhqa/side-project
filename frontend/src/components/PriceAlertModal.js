import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { usePriceAlert } from '../context/PriceAlertContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function PriceAlertModal({ product, isOpen, onClose }) {
  const { user, isAuthenticated } = useAuth();
  const { createAlert, checkAlertExists, getAlertForProduct, loading: alertsLoading } = usePriceAlert();
  
  const [targetPrice, setTargetPrice] = useState('');
  const [alertType, setAlertType] = useState('price_drop');
  const [loading, setLoading] = useState(false);
  const [suggestedPrice, setSuggestedPrice] = useState('');

  useEffect(() => {
    if (product?.price) {
      const suggestion = (product.price * 0.9).toFixed(2);
      setTargetPrice(suggestion);
      setSuggestedPrice(suggestion);
    }
  }, [product]);

  const existingAlert = getAlertForProduct(product?._id);
  const hasAlert = checkAlertExists(product?._id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to set price alerts');
      return;
    }

    if (!targetPrice || parseFloat(targetPrice) >= product.price) {
      toast.error('Target price must be lower than current price');
      return;
    }

    setLoading(true);
    try {
      await createAlert(product._id, parseFloat(targetPrice), alertType);
      onClose();
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSet = (percentage) => {
    const price = (product.price * (1 - percentage / 100)).toFixed(2);
    setTargetPrice(price);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="price-alert-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="alert-modal-title"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="modal-header">
              <h2 id="alert-modal-title">
                <FiBell className="modal-icon" />
                Price Alert
              </h2>
              <motion.button
                className="close-btn"
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close modal"
              >
                <FiX />
              </motion.button>
            </div>

            <div className="modal-body">
              {product && (
                <div className="product-preview">
                  <img src={product.images?.[0]?.url} alt={product.name} />
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="current-price">
                      Current Price: <strong>${product.price.toFixed(2)}</strong>
                    </p>
                  </div>
                </div>
              )}

              {hasAlert || existingAlert ? (
                <motion.div
                  className="alert-active"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <FiCheck className="success-icon" />
                  <div>
                    <p className="alert-active-title">Alert Active</p>
                    <p className="alert-active-info">
                      We'll notify you when the price drops below 
                      <strong> ${existingAlert?.targetPrice?.toFixed(2)}</strong>
                    </p>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="targetPrice">
                      Target Price
                      <span className="helper-text">(We'll notify you when price drops to this level)</span>
                    </label>
                    <div className="price-input-wrapper">
                      <span className="currency-symbol">$</span>
                      <input
                        type="number"
                        id="targetPrice"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        max={product?.price}
                        required
                        className="price-input"
                      />
                    </div>
                    <p className="savings-info">
                      {targetPrice && parseFloat(targetPrice) < product?.price && (
                        <span className="savings">
                          You'll save <strong>${(product?.price - parseFloat(targetPrice)).toFixed(2)}</strong>
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="quick-select">
                    <label>Quick Select</label>
                    <div className="quick-options">
                      {[10, 15, 20, 25].map((percent) => (
                        <motion.button
                          key={percent}
                          type="button"
                          className={`quick-btn ${parseFloat(targetPrice) >= suggestedPrice * (1 + percent / 100) ? 'active' : ''}`}
                          onClick={() => handleQuickSet(percent)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          -{percent}%
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="alert-types">
                    <label>Alert Type</label>
                    <div className="type-options">
                      <motion.label
                        className={`type-option ${alertType === 'price_drop' ? 'active' : ''}`}
                        whileHover={{ scale: 1.02 }}
                      >
                        <input
                          type="radio"
                          name="alertType"
                          value="price_drop"
                          checked={alertType === 'price_drop'}
                          onChange={(e) => setAlertType(e.target.value)}
                        />
                        <FiBell />
                        <span>Price Drop</span>
                      </motion.label>
                      <motion.label
                        className={`type-option ${alertType === 'price_below' ? 'active' : ''}`}
                        whileHover={{ scale: 1.02 }}
                      >
                        <input
                          type="radio"
                          name="alertType"
                          value="price_below"
                          checked={alertType === 'price_below'}
                          onChange={(e) => setAlertType(e.target.value)}
                        />
                        <FiAlertCircle />
                        <span>Price Below</span>
                      </motion.label>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    className="btn btn-primary btn-full"
                    disabled={loading || !isAuthenticated || alertsLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <span className="btn-loading">Creating...</span>
                    ) : (
                      <>
                        <FiBell /> Create Price Alert
                      </>
                    )}
                  </motion.button>

                  {!isAuthenticated && (
                    <p className="login-prompt">
                      <a href="/login">Login</a> to create price alerts
                    </p>
                  )}
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default PriceAlertModal;
