import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiAlertTriangle } from 'react-icons/fi';

function StockIndicator({ 
  quantity = 0, 
  allowBackorders = false, 
  lowStockThreshold = 10,
  showText = true,
  showBar = true,
  compact = false 
}) {
  const isInStock = quantity > 0;
  const isLowStock = quantity > 0 && quantity <= lowStockThreshold;
  const isOutOfStock = !isInStock && !allowBackorders;
  const isBackorder = !isInStock && allowBackorders;

  if (compact) {
    return (
      <div className={`stock-indicator-compact ${isOutOfStock ? 'out' : isLowStock ? 'low' : 'in'}`}>
        <motion.div
          className="stock-dot"
          animate={isInStock ? { scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        <span className="stock-text-compact">
          {isOutOfStock ? 'Out' : isLowStock ? 'Low' : 'In'}
        </span>
      </div>
    );
  }

  if (!showText && !showBar) {
    return (
      <div className={`stock-indicator-simple ${isOutOfStock ? 'out' : 'in'}`}>
        <motion.div
          className="stock-dot"
          animate={isInStock ? { scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      </div>
    );
  }

  return (
    <div className="stock-indicator">
      {showText && (
        <div className="stock-text">
          {isInStock && (
            <>
              <motion.div
                className="stock-icon in"
                animate={isLowStock ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <FiCheck size={16} />
              </motion.div>
              <span className="stock-status">
                {isLowStock ? (
                  <>
                    <strong>Only {quantity} left</strong>
                    <motion.span
                      className="urgent-badge"
                      animate={{ x: [0, 3, 0] }}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                    >
                      - Selling fast!
                    </motion.span>
                  </>
                ) : (
                  <strong>In Stock</strong>
                )}
              </span>
            </>
          )}
          
          {isOutOfStock && (
            <>
              <div className="stock-icon out">
                <FiX size={16} />
              </div>
              <span className="stock-status out">
                <strong>Out of Stock</strong>
              </span>
            </>
          )}
          
          {isBackorder && (
            <>
              <div className="stock-icon backorder">
                <FiAlertTriangle size={16} />
              </div>
              <span className="stock-status backorder">
                <strong>Backorder</strong>
                <span className="backorder-note">Ships in 3-5 days</span>
              </span>
            </>
          )}
        </div>
      )}

      {showBar && isInStock && (
        <div className="stock-bar-container">
          <motion.div
            className={`stock-bar ${isLowStock ? 'low' : 'normal'}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((quantity / 100) * 100, 100)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      )}
    </div>
  );
}

// Animated stock counter component
export function StockCounter({ quantity, onQuantityChange, max = 99, min = 1 }) {
  const [count, setCount] = useState(Math.min(quantity, max));

  useEffect(() => {
    setCount(Math.min(quantity, max));
  }, [quantity, max]);

  const increment = () => {
    if (count < Math.min(quantity, max)) {
      const newCount = count + 1;
      setCount(newCount);
      onQuantityChange?.(newCount);
    }
  };

  const decrement = () => {
    if (count > min) {
      const newCount = count - 1;
      setCount(newCount);
      onQuantityChange?.(newCount);
    }
  };

  const isMaxReached = count >= Math.min(quantity, max);
  const isLowStock = quantity <= lowStockThreshold;

  return (
    <div className={`stock-counter ${isLowStock ? 'low-stock' : ''}`}>
      <motion.button
        className="counter-btn"
        onClick={decrement}
        disabled={count <= min}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        -
      </motion.button>
      
      <span className="counter-value">{count}</span>
      
      <motion.button
        className="counter-btn"
        onClick={increment}
        disabled={isMaxReached}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        +
      </motion.button>

      {isMaxReached && (
        <motion.span
          className="max-reached"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Max
        </motion.span>
      )}
    </div>
  );
}

export default StockIndicator;
