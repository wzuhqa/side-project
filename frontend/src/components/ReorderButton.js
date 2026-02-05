import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

function ReorderButton({ order, variant = 'button', size = 'md' }) {
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState(null);

  const handleReorder = async () => {
    setLoading(true);
    
    try {
      // Check availability of all items
      const availabilityCheck = await checkAvailability();
      const unavailableItems = availabilityCheck.filter(a => !a.available);

      if (unavailableItems.length > 0) {
        // Show confirmation dialog
        const confirm = window.confirm(
          `${unavailableItems.length} item(s) are currently unavailable. ` +
          `Would you like to add the available items only?`
        );
        
        if (!confirm) {
          setLoading(false);
          return;
        }
      }

      // Add available items to cart
      let addedCount = 0;
      for (const item of availabilityCheck) {
        if (item.available) {
          await addToCart(item.product, item.quantity, item.variant);
          addedCount++;
        }
      }

      if (addedCount > 0) {
        toast.success(`Added ${addedCount} item(s) to cart`);
      } else {
        toast.error('No items available');
      }
    } catch (error) {
      console.error('Reorder failed:', error);
      toast.error('Failed to reorder. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    try {
      const checks = await Promise.all(
        order.items.map(async (item) => {
          try {
            const response = await api.get(`/products/${item.product._id}/availability`, {
              params: { quantity: item.quantity }
            });
            return {
              ...item,
              available: response.data.data.available
            };
          } catch {
            return { ...item, available: false };
          }
        })
      );
      setAvailability(checks);
      return checks;
    } catch (error) {
      console.error('Availability check failed:', error);
      // Assume all available if check fails
      return order.items.map(item => ({ ...item, available: true }));
    }
  };

  const unavailableCount = availability?.filter(a => !a.available).length || 0;
  const allAvailable = availability && unavailableCount === 0;

  if (order.status === 'cancelled' || order.status === 'refunded') {
    return null;
  }

  if (variant === 'icon') {
    return (
      <motion.button
        className="reorder-btn-icon"
        onClick={handleReorder}
        disabled={loading}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Order Again"
        aria-label="Order again"
      >
        <motion.div
          animate={loading ? { rotate: 360 } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <FiRefreshCw size={18} />
        </motion.div>
      </motion.button>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.button
        className="reorder-btn-compact"
        onClick={handleReorder}
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <FiRefreshCw size={14} />
        <span>Order Again</span>
      </motion.button>
    );
  }

  return (
    <motion.button
      className={`reorder-btn ${variant} ${size} ${allAvailable === false ? 'partial' : ''}`}
      onClick={handleReorder}
      disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
    >
      <motion.div
        className="btn-icon"
        animate={loading ? { rotate: 360 } : {}}
        transition={{ repeat: Infinity, duration: 1 }}
      >
        <FiRefreshCw />
      </motion.div>
      
      <div className="btn-content">
        <span className="btn-text">
          {loading ? 'Checking...' : 'Order Again'}
        </span>
        
        {availability && !loading && (
          <span className="btn-subtext">
            {unavailableCount > 0 ? (
              <>
                <FiAlertTriangle size={12} />
                {unavailableCount} unavailable
              </>
            ) : (
              <>
                <FiCheck size={12} />
                All available
              </>
            )}
          </span>
        )}
      </div>
    </motion.button>
  );
}

export default ReorderButton;
