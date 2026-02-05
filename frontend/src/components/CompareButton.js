import React from 'react';
import { motion } from 'framer-motion';
import { FiGitCompare } from 'react-icons/fi';
import { useCompare } from '../context/CompareContext';

function CompareButton({ product, variant = 'icon', showCount = true }) {
  const { addToCompare, removeFromCompare, isInCompare, getCompareCount, canAddMore, MAX_COMPARE_ITEMS } = useCompare();
  
  const productId = product?._id || product?.id;
  const inCompare = isInCompare(productId);
  const count = getCompareCount();

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inCompare) {
      removeFromCompare(productId);
    } else {
      const result = addToCompare(product);
      if (!result.success) {
        // Error handled in context
      }
    }
  };

  if (variant === 'icon') {
    return (
      <motion.button
        className={`compare-btn-icon ${inCompare ? 'active' : ''}`}
        onClick={handleClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title={inCompare ? 'Remove from comparison' : `Compare (${count}/${MAX_COMPARE_ITEMS})`}
        aria-label={inCompare ? 'Remove from comparison' : `Compare product, ${count} of ${MAX_COMPARE_ITEMS} selected`}
        disabled={!inCompare && !canAddMore()}
      >
        <FiGitCompare size={18} />
        {showCount && count > 0 && (
          <motion.span
            className="compare-count"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            key={count}
          >
            {count}
          </motion.span>
        )}
      </motion.button>
    );
  }

  if (variant === 'button') {
    return (
      <motion.button
        className={`compare-btn ${inCompare ? 'btn-secondary' : 'btn-outline'}`}
        onClick={handleClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={!inCompare && !canAddMore()}
      >
        <FiGitCompare />
        {inCompare ? 'In Comparison' : 'Compare'}
        {showCount && !inCompare && count > 0 && (
          <span className="count-badge">{count}</span>
        )}
      </motion.button>
    );
  }

  if (variant === 'full') {
    return (
      <motion.button
        className={`compare-btn-full ${inCompare ? 'active' : ''}`}
        onClick={handleClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={!inCompare && !canAddMore()}
      >
        <FiGitCompare size={20} />
        <div className="btn-text">
          <span className="btn-title">{inCompare ? 'Compared' : 'Compare'}</span>
          <span className="btn-subtitle">
            {!canAddMore() 
              ? 'Maximum reached' 
              : inCompare 
                ? `Remove from comparison` 
                : `${MAX_COMPARE_ITEMS - count} more available`
            }
          </span>
        </div>
      </motion.button>
    );
  }

  return null;
}

export default CompareButton;
