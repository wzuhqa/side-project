import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiMinus, FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const COMPARISON_FIELDS = [
  { key: 'price', label: 'Price', format: (v) => `$${v?.toFixed(2)}`, highlight: true },
  { key: 'compareAtPrice', label: 'Original Price', format: (v) => v ? `$${v.toFixed(2)}` : '-' },
  { key: 'discountPercentage', label: 'Discount', format: (v) => v ? `${v}%` : '-', highlight: true },
  { key: 'rating', label: 'Rating', format: (v) => v ? `${v.toFixed(1)} ★` : '-' },
  { key: 'reviewCount', label: 'Reviews', format: (v) => v || 0 },
  { key: 'quantity', label: 'Availability', format: (v) => v > 0 ? 'In Stock' : 'Out of Stock', highlight: true },
  { key: 'brand', label: 'Brand' },
  { key: 'sku', label: 'SKU' },
];

function ComparePage() {
  const { compareItems, removeFromCompare, clearCompare, loading } = useCompare();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [highlightDiffs, setHighlightDiffs] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [compareItems]);

  const fetchProducts = async () => {
    if (compareItems.length === 0) {
      setProducts([]);
      return;
    }

    try {
      const ids = compareItems.map(item => item._id || item.id).join(',');
      const response = await api.get(`/products/compare?ids=${ids}`);
      setProducts(response.data.data?.products || compareItems);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts(compareItems);
    }
  };

  const handleAddToCart = async (product) => {
    await addToCart(product, 1);
  };

  const handleRemove = (productId) => {
    removeFromCompare(productId);
  };

  const handleClearAll = () => {
    clearCompare();
  };

  const getFieldValue = (product, key) => {
    if (key.includes('.')) {
      const keys = key.split('.');
      let value = product;
      for (const k of keys) {
        value = value?.[k];
      }
      return value;
    }
    return product[key];
  };

  const findBestValue = (key) => {
    const values = products.map(p => {
      const v = getFieldValue(p, key);
      if (typeof v === 'number' && key === 'price') return { product: p, value: v, type: 'min' };
      if (typeof v === 'number' && (key === 'rating' || key === 'discountPercentage')) return { product: p, value: v, type: 'max' };
      if (key === 'quantity') return { product: p, value: v > 0 ? 1 : 0, type: 'max' };
      return { product: p, value: v, type: 'any' };
    });

    if (key === 'price') return values.reduce((min, curr) => curr.value < min.value ? curr : min, values[0])?.product?._id;
    if (key === 'quantity') return values.find(v => v.value === 1)?.product?._id;
    return values.reduce((max, curr) => curr.value > max.value ? curr : max, values[0])?.product?._id;
  };

  const bestProductId = products.length > 0 ? findBestValue('price') : null;

  if (compareItems.length === 0) {
    return (
      <>
        <Helmet>
          <title>Compare Products - ShopNow</title>
        </Helmet>
        
        <motion.div
          className="compare-page empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="empty-state">
            <motion.div
              className="empty-icon"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              📊
            </motion.div>
            <h2>No products to compare</h2>
            <p>Add products to your comparison list to see them side by side</p>
            <motion.a
              href="/shop"
              className="btn btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Browse Products
            </motion.a>
          </div>
        </motion.div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Compare Products ({compareItems.length}) - ShopNow</title>
      </Helmet>

      <motion.div
        className="compare-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="compare-header">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Compare Products
            <span className="count">({compareItems.length})</span>
          </motion.h1>

          <div className="compare-actions">
            <label className="highlight-toggle">
              <input
                type="checkbox"
                checked={highlightDiffs}
                onChange={(e) => setHighlightDiffs(e.target.checked)}
              />
              <span>Highlight differences</span>
            </label>

            {compareItems.length > 0 && (
              <motion.button
                className="clear-btn"
                onClick={handleClearAll}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiTrash2 /> Clear All
              </motion.button>
            )}
          </div>
        </div>

        <div className="compare-table-wrapper">
          <motion.table
            className="compare-table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <thead>
              <tr>
                <th className="label-col">
                  <span>Products</span>
                </th>
                {products.map((product) => (
                  <motion.th
                    key={product._id}
                    className="product-col"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: products.indexOf(product) * 0.1 }}
                  >
                    <div className="product-header">
                      <motion.button
                        className="remove-btn"
                        onClick={() => handleRemove(product._id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Remove from comparison"
                      >
                        <FiX />
                      </motion.button>
                      
                      <a href={`/product/${product.slug}`} className="product-link">
                        <img
                          src={product.images?.[0]?.url || '/placeholder.jpg'}
                          alt={product.name}
                          className="product-image"
                        />
                        <h3>{product.name}</h3>
                      </a>

                      <motion.button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAddToCart(product)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Add to Cart
                      </motion.button>
                    </div>
                  </motion.th>
                ))}
              </tr>
            </thead>

            <tbody>
              {COMPARISON_FIELDS.map((field, index) => {
                const bestId = highlightDiffs ? findBestValue(field.key) : null;
                
                return (
                  <motion.tr
                    key={field.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="label-cell">
                      {field.label}
                      {field.highlight && bestId && (
                        <span className="best-badge">Best</span>
                      )}
                    </td>
                    {products.map((product) => {
                      const value = getFieldValue(product, field.key);
                      const formatted = field.format ? field.format(value) : value;
                      const isBest = bestId === product._id;
                      const isLowStock = field.key === 'quantity' && value > 0 && value < 5;

                      return (
                        <td
                          key={product._id}
                          className={`value-cell ${isBest && highlightDiffs ? 'best' : ''} ${isLowStock ? 'low-stock' : ''}`}
                        >
                          {formatted}
                          {isBest && highlightDiffs && field.highlight && (
                            <FiCheck className="check-icon" />
                          )}
                        </td>
                      );
                    })}
                  </motion.tr>
                );
              })}
            </tbody>
          </motion.table>
        </div>

        {/* Mobile Card View */}
        <div className="compare-mobile">
          {products.map((product, index) => (
            <motion.div
              key={product._id}
              className="compare-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                className="remove-btn"
                onClick={() => handleRemove(product._id)}
              >
                <FiX />
              </button>
              
              <img
                src={product.images?.[0]?.url || '/placeholder.jpg'}
                alt={product.name}
              />
              
              <h3>{product.name}</h3>
              
              <div className="card-fields">
                {COMPARISON_FIELDS.slice(0, 4).map((field) => (
                  <div key={field.key} className="card-field">
                    <span className="field-label">{field.label}</span>
                    <span className="field-value">
                      {field.format 
                        ? field.format(getFieldValue(product, field.key))
                        : getFieldValue(product, field.key)
                      }
                    </span>
                  </div>
                ))}
              </div>

              <motion.button
                className="btn btn-primary"
                onClick={() => handleAddToCart(product)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Add to Cart
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </>
  );
}

export default ComparePage;
