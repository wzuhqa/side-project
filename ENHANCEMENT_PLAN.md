# E-Commerce Platform Enhancement Plan

A comprehensive roadmap for upgrading the MERN stack e-commerce website with customer experience, technical, and UI/UX improvements.

---

## Table of Contents

1. [Customer Experience Enhancements](#customer-experience-enhancements)
2. [Technical Enhancements](#technical-enhancements)
3. [UI/UX Improvements](#uiux-improvements)
4. [Implementation Roadmap](#implementation-roadmap)
5. [Priority Matrix](#priority-matrix)

---

## Customer Experience Enhancements

### 1. Advanced Product Search with Filters

**Priority: High | Effort: Medium | Impact: High**

**Current State**: Basic product listing with URL-based filtering

**Enhancement Description**:
Implement Elasticsearch or MongoDB Atlas Search for lightning-fast product discovery with multi-faceted filtering capabilities.

**Technical Implementation**:

```javascript
// backend/routes/productRoutes.js - Enhanced Search Endpoint
router.get('/search', async (req, res) => {
  const {
    q,                    // Search query
    category,
    minPrice, maxPrice,
    brand,
    minRating,
    inStock,
    sortBy,              // relevance, price-asc, price-desc, rating, newest
    page = 1,
    limit = 24
  } = req.query;

  // Build Elasticsearch query
  const query = {
    bool: {
      must: [
        { multi_match: {
            query: q,
            fields: ['name^3', 'description', 'brand^2', 'tags'],
            fuzziness: 'AUTO'
        }}
      ],
      filter: [
        category && { term: { 'category.slug': category } },
        brand && { term: { brand } },
        { range: { price: { gte: minPrice, lte: maxPrice } } },
        inStock === 'true' && { term: { 'quantity': { gt: 0 } } }
      ]
    }
  };

  const searchQuery = {
    index: 'products',
    body: {
      query,
      sort: sortBy === 'relevance' ? ['_score'] : getSortOptions(sortBy),
      from: (page - 1) * limit,
      size: limit,
      aggs: {
        categories: { terms: { field: 'category.name' } },
        brands: { terms: { field: 'brand' } },
        price_ranges: { range: { field: 'price', ranges: priceRanges } },
        ratings: { range: { field: 'ratings.average', ranges: ratingRanges } }
      }
    }
  };

  const results = await elasticClient.search(searchQuery);
  
  res.json({
    success: true,
    data: results.hits.hits.map(h => h._source),
    aggregations: formatAggregations(results.aggregations),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: results.hits.total.value,
      pages: Math.ceil(results.hits.total.value / limit)
    }
  });
});
```

**Frontend Implementation**:

```javascript
// frontend/src/hooks/useProductSearch.js
import { useState, useCallback, useEffect } from 'react';
import api from '../utils/api';

export function useProductSearch() {
  const [results, setResults] = useState([]);
  const [aggregations, setAggregations] = useState({});
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    query: '',
    category: '',
    minPrice: 0,
    maxPrice: 10000,
    brand: '',
    minRating: 0,
    inStock: false,
    sortBy: 'relevance'
  });

  const search = useCallback(async (params = filters) => {
    setLoading(true);
    try {
      const response = await api.get('/products/search', { params });
      setResults(response.data);
      setAggregations(response.data.aggregations);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    search();
  }, [filters]);

  return {
    results,
    aggregations,
    loading,
    filters,
    setFilters,
    search,
    hasResults: results.length > 0
  };
}
```

**Features to Include**:
- Real-time search suggestions with keyboard navigation
- Recent searches history
- Search query autocomplete
- Spell correction and fuzzy matching
- Category-specific search
- Price histogram slider
- Brand cloud with counts
- Rating stars filter
- Availability toggle
- Sort by relevance, price, rating, newest

---

### 2. Product Comparison Feature

**Priority: Medium | Effort: Medium | Impact: Medium**

**Enhancement Description**:
Allow users to compare up to 4 products side-by-side with highlighted differences.

**Technical Implementation**:

```javascript
// backend/routes/productRoutes.js - Comparison Endpoint
router.get('/compare', async (req, res) => {
  const { ids } = req.query;
  
  if (!ids) {
    return res.status(400).json({ 
      success: false, 
      message: 'Product IDs required' 
    });
  }

  const productIds = ids.split(',').slice(0, 4); // Max 4 products
  
  const products = await Product.find({ _id: { $in: productIds } })
    .select('name brand price images ratings specifications attributes');

  // Group attributes for comparison
  const comparisonData = {
    products: products.map(p => ({
      _id: p._id,
      name: p.name,
      slug: p.slug,
      image: p.images[0]?.url,
      price: p.price,
      rating: p.ratings.average,
      reviewCount: p.ratings.count
    })),
    specifications: groupSpecifications(products),
    attributes: extractComparableAttributes(products)
  };

  res.json({ success: true, data: comparisonData });
});

function groupSpecifications(products) {
  const allSpecs = {};
  products.forEach(p => {
    p.specifications?.forEach(spec => {
      if (!allSpecs[spec.name]) {
        allSpecs[spec.name] = {};
      }
      allSpecs[spec.name][p._id] = spec.value;
    });
  });
  return allSpecs;
}
```

**Frontend Component**:

```javascript
// frontend/src/pages/ComparePage.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompare } from '../context/CompareContext';
import ProductCard from '../components/ProductCard';
import { FiX, FiCheck, FiMinus } from 'react-icons/fi';

function ComparePage() {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (compareItems.length === 0) return;
      
      const ids = compareItems.join(',');
      const response = await api.get(`/products/compare?ids=${ids}`);
      setProducts(response.data.data.products);
    };

    fetchProducts();
  }, [compareItems]);

  const comparisonRows = [
    { label: 'Price', key: 'price', format: (v) => `$${v.toFixed(2)}` },
    { label: 'Rating', key: 'rating', format: (v) => `${v} ★` },
    { label: 'Brand', key: 'brand' },
    { label: 'Availability', key: 'quantity', format: (v) => v > 0 ? 'In Stock' : 'Out of Stock' }
  ];

  return (
    <motion.div
      className="compare-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h1>Product Comparison</h1>
      
      <div className="compare-table">
        {/* Product Headers */}
        <div className="compare-row products-row">
          <div className="compare-cell header-cell"></div>
          {products.map(product => (
            <motion.div
              key={product._id}
              className="compare-cell product-cell"
              layout
            >
              <button 
                className="remove-btn"
                onClick={() => removeFromCompare(product._id)}
              >
                <FiX />
              </button>
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <button 
                className="btn btn-primary"
                onClick={() => addToCart(product)}
              >
                Add to Cart
              </button>
            </motion.div>
          ))}
        </div>

        {/* Comparison Rows */}
        {comparisonRows.map((row, index) => (
          <motion.div
            key={row.key}
            className="compare-row"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="compare-cell label-cell">{row.label}</div>
            {products.map((product, i) => (
              <motion.div
                key={product._id}
                className={`compare-cell value-cell ${i === 0 ? 'highlight' : ''}`}
                whileHover={{ backgroundColor: '#f8fafc' }}
              >
                {row.format ? row.format(product[row.key]) : product[row.key]}
              </motion.div>
            ))}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default ComparePage;
```

**Comparison Context**:

```javascript
// frontend/src/context/CompareContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext(null);
const MAX_COMPARE_ITEMS = 4;
const COMPARE_STORAGE_KEY = 'shop_compare';

export function CompareProvider({ children }) {
  const [compareItems, setCompareItems] = useState(() => {
    const saved = localStorage.getItem(COMPARE_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(compareItems));
  }, [compareItems]);

  const addToCompare = (productId) => {
    if (compareItems.includes(productId)) return;
    if (compareItems.length >= MAX_COMPARE_ITEMS) {
      toast.error(`Maximum ${MAX_COMPARE_ITEMS} products can be compared`);
      return false;
    }
    setCompareItems([...compareItems, productId]);
    toast.success('Added to comparison');
    return true;
  };

  const removeFromCompare = (productId) => {
    setCompareItems(compareItems.filter(id => id !== productId));
  };

  const clearCompare = () => {
    setCompareItems([]);
  };

  const isInCompare = (productId) => compareItems.includes(productId);

  return (
    <CompareContext.Provider value={{
      compareItems,
      addToCompare,
      removeFromCompare,
      clearCompare,
      isInCompare,
      compareCount: compareItems.length,
      canAddMore: compareItems.length < MAX_COMPARE_ITEMS
    }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
```

**UI Features**:
- Sticky first column with labels
- Highlight differences toggle
- Remove products directly from table
- Add to cart from comparison
- Responsive mobile view (stack vertically)
- Animated transitions

---

### 3. Wishlist with Price Drop Notifications

**Priority: High | Effort: Medium | Impact: High**

**Enhancement Description**:
Comprehensive wishlist system with email notifications when prices drop.

**Technical Implementation**:

```javascript
// backend/models/PriceAlert.js
const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  targetPrice: {
    type: Number,
    required: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['price_drop', 'back_in_stock', 'on_sale'],
    default: 'price_drop'
  },
  status: {
    type: String,
    enum: ['active', 'triggered', 'cancelled', 'expired'],
    default: 'active'
  },
  triggeredAt: Date,
  expiresAt: Date,
  notificationSent: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Index for efficient querying
priceAlertSchema.index({ user: 1, product: 1, status: 1 });
priceAlertSchema.index({ product: 1, status: 1, targetPrice: 1 });

// Static method to check and trigger alerts
priceAlertSchema.statics.checkPriceDrop = async function(productId, newPrice) {
  const alerts = await this.find({
    product: productId,
    status: 'active',
    targetPrice: { $gte: newPrice }
  }).populate('user');

  for (const alert of alerts) {
    if (newPrice <= alert.targetPrice) {
      await this.triggerAlert(alert, newPrice);
    }
  }
};

priceAlertSchema.statics.triggerAlert = async function(alert, currentPrice) {
  alert.status = 'triggered';
  alert.currentPrice = currentPrice;
  alert.triggeredAt = new Date();
  alert.notificationSent = true;
  await alert.save();

  // Send email notification
  await sendPriceDropEmail(alert.user, alert.product, currentPrice);
};

module.exports = mongoose.model('PriceAlert', priceAlertSchema);

// Backend Job Scheduler (using node-cron)
const cron = require('node-cron');
const PriceAlert = require('../models/PriceAlert');

// Run every hour to check for expired alerts
cron.schedule('0 * * * *', async () => {
  const now = new Date();
  
  // Find and expire alerts
  await PriceAlert.updateMany(
    { 
      status: 'active', 
      expiresAt: { $lt: now } 
    },
    { status: 'expired' }
  );
  
  console.log('Price alerts cleanup completed');
});
```

**API Endpoints**:

```javascript
// backend/routes/priceAlertRoutes.js
const express = require('express');
const router = express.Router();
const PriceAlert = require('../models/PriceAlert');
const { protect } = require('../middleware/auth');

// Create price alert
router.post('/', protect, async (req, res) => {
  const { productId, targetPrice, type = 'price_drop', expiresIn = 30 } = req.body;

  // Check if alert already exists
  const existing = await PriceAlert.findOne({
    user: req.user.id,
    product: productId,
    status: 'active'
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'Alert already exists for this product'
    });
  }

  const product = await require('../models/Product').findById(productId);
  
  const alert = await PriceAlert.create({
    user: req.user.id,
    product: productId,
    targetPrice,
    currentPrice: product.price,
    type,
    expiresAt: new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000)
  });

  res.status(201).json({ success: true, data: alert });
});

// Get user's price alerts
router.get('/', protect, async (req, res) => {
  const alerts = await PriceAlert.find({ user: req.user.id })
    .populate('product', 'name slug price images')
    .sort('-createdAt');

  res.json({ success: true, data: alerts });
});

// Delete price alert
router.delete('/:id', protect, async (req, res) => {
  await PriceAlert.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id
  });

  res.json({ success: true, message: 'Alert deleted' });
});

// Trigger price drop notification (called when product price updates)
router.post('/check/:productId', async (req, res) => {
  const { newPrice } = req.body;
  await PriceAlert.checkPriceDrop(req.params.productId, newPrice);
  res.json({ success: true });
});

module.exports = router;
```

**Frontend Wishlist Page**:

```javascript
// frontend/src/pages/WishlistPage.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiHeart, FiBell, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

function WishlistPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlistAndAlerts();
  }, []);

  const fetchWishlistAndAlerts = async () => {
    try {
      const [wishlistRes, alertsRes] = await Promise.all([
        api.get('/users/wishlist'),
        api.get('/price-alerts')
      ]);
      setWishlist(wishlistRes.data.data || []);
      setAlerts(alertsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await api.post(`/users/wishlist/${productId}`);
      setWishlist(wishlist.filter(p => p._id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove');
    }
  };

  const createPriceAlert = async (productId, targetPrice) => {
    try {
      await api.post('/price-alerts', { productId, targetPrice });
      toast.success('Price alert created');
      fetchWishlistAndAlerts();
    } catch (error) {
      toast.error('Failed to create alert');
    }
  };

  return (
    <>
      <Helmet>
        <title>My Wishlist - ShopNow</title>
      </Helmet>

      <motion.div
        className="wishlist-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h1>My Wishlist</h1>

        {wishlist.length === 0 ? (
          <motion.div
            className="empty-state"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <FiHeart size={48} />
            <h2>Your wishlist is empty</h2>
            <p>Save items you love to your wishlist</p>
            <a href="/shop" className="btn btn-primary">Start Shopping</a>
          </motion.div>
        ) : (
          <div className="wishlist-grid">
            <AnimatePresence>
              {wishlist.map((product, index) => (
                <motion.div
                  key={product._id}
                  className="wishlist-card"
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="product-image">
                    <img src={product.images?.[0]?.url} alt={product.name} />
                    <motion.button
                      className="remove-btn"
                      onClick={() => removeFromWishlist(product._id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiTrash2 />
                    </motion.button>
                  </div>

                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <div className="price-section">
                      <span className="current-price">${product.price.toFixed(2)}</span>
                      {product.compareAtPrice && (
                        <span className="original-price">
                          ${product.compareAtPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="alert-section">
                      {alerts.find(a => a.product._id === product._id) ? (
                        <span className="alert-active">
                          <FiBell /> Alert set: ${alerts.find(a => a.product._id === product._id)?.targetPrice}
                        </span>
                      ) : (
                        <motion.button
                          className="set-alert-btn"
                          onClick={() => {
                            const price = prompt('Set target price:', product.price * 0.9);
                            if (price) createPriceAlert(product._id, parseFloat(price));
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <FiBell /> Set Price Alert
                        </motion.button>
                      )}
                    </div>

                    <motion.button
                      className="btn btn-primary add-to-cart"
                      onClick={() => addToCart(product)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiShoppingCart /> Add to Cart
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </>
  );
}

export default WishlistPage;
```

**Features**:
- Visual price drop indicators
- Animated alerts when price drops
- Configurable alert expiration
- Email notifications via SendGrid/Nodemailer
- Stock availability alerts
- Sale price alerts
- Bulk actions on wishlist

---

### 4. Real-Time Stock Availability

**Priority: High | Effort: Low | Impact: High**

**Enhancement Description**:
Live inventory tracking with backorder support and waitlist functionality.

**Technical Implementation**:

```javascript
// backend/models/Product.js - Enhanced Stock Methods
productSchema.methods.checkStock = async function(quantity = 1) {
  if (this.quantity >= quantity) {
    return { available: true, stock: this.quantity, message: 'In stock' };
  }
  
  if (this.allowBackorders) {
    return {
      available: true,
      stock: this.quantity,
      message: `Backorder available (${Math.abs(this.quantity - quantity)} more needed)`,
      canBackorder: true,
      backorderLimit: this.backorderLimit || 100
    };
  }

  return {
    available: false,
    stock: this.quantity,
    message: 'Out of stock',
    canBackorder: false
  };
};

// Low stock check for admin
productSchema.statics.getLowStock = async function(threshold = 10) {
  return this.find({
    $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
    status: 'active'
  }).populate('category', 'name');
};

// Stock reservation for checkout (using Redis for atomicity)
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

productSchema.statics.reserveStock = async function(productId, quantity, reservationId) {
  const key = `stock:${productId}`;
  
  // Check current stock in Redis
  let currentStock = await redis.get(key);
  if (!currentStock) {
    const product = await this.findById(productId);
    currentStock = product.quantity;
    await redis.set(key, currentStock, 'EX', 300); // 5 min cache
  }

  if (parseInt(currentStock) < quantity) {
    return { success: false, message: 'Insufficient stock' };
  }

  // Reserve stock atomically
  const newStock = await redis.decrby(key, quantity);
  
  if (parseInt(newStock) < 0) {
    await redis.incrby(key, quantity); // Rollback
    return { success: false, message: 'Stock no longer available' };
  }

  // Store reservation with TTL
  await redis.setex(
    `reservation:${reservationId}`,
    900, // 15 minutes
    JSON.stringify({ productId, quantity, expiresAt: Date.now() + 900000 })
  );

  return { success: true, reservationId };
};

productSchema.statics.releaseReservation = async function(reservationId) {
  const reservation = await redis.get(`reservation:${reservationId}`);
  if (reservation) {
    const { productId, quantity } = JSON.parse(reservation);
    await redis.incrby(`stock:${productId}`, quantity);
    await redis.del(`reservation:${reservationId}`);
  }
};

productSchema.statics.confirmReservation = async function(reservationId) {
  await redis.del(`reservation:${reservationId}`);
};
```

**Waitlist Model**:

```javascript
// backend/models/Waitlist.js
const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  position: Number,
  status: {
    type: String,
    enum: ['waiting', 'notified', 'expired', 'converted'],
    default: 'waiting'
  },
  notifiedAt: Date,
  expiresAt: Date
}, { timestamps: true });

// Notify waitlist when stock arrives
waitlistSchema.statics.notifyOnRestock = async function(productId) {
  const waitlist = await this.find({
    product: productId,
    status: 'waiting'
  }).sort('createdAt').limit(50);

  for (const entry of waitlist) {
    await sendRestockNotification(entry.email, productId);
    
    entry.status = 'notified';
    entry.notifiedAt = new Date();
    await entry.save();
  }

  return waitlist.length;
};

module.exports = mongoose.model('Waitlist', waitlistSchema);
```

**Frontend Stock Indicator**:

```javascript
// frontend/src/components/StockIndicator.js
import React from 'react';
import { motion } from 'framer-motion';

function StockIndicator({ product, showText = true }) {
  const { available, stock, message, canBackorder } = product.stockStatus || {
    available: product.quantity > 0,
    stock: product.quantity,
    message: product.quantity > 0 ? 'In stock' : 'Out of stock',
    canBackorder: product.allowBackorders
  };

  if (!showText) {
    return (
      <div className={`stock-indicator ${available ? 'in-stock' : 'out-of-stock'}`}>
        <motion.div
          className="stock-dot"
          animate={available ? { scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      </div>
    );
  }

  return (
    <div className={`stock-indicator ${available ? 'in-stock' : 'out-of-stock'}`}>
      <motion.div
        className="stock-dot"
        animate={available ? { scale: [1, 1.2, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
      />
      <span className="stock-message">
        {available ? (
          <>
            <strong>{stock > 10 ? 'In Stock' : `Only ${stock} left`}</strong>
            {stock < 5 && (
              <motion.span
                className="urgent-badge"
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                - Selling fast!
              </motion.span>
            )}
          </>
        ) : (
          <>
            <strong>{message}</strong>
            {canBackorder && (
              <span className="backorder-badge">Available for backorder</span>
            )}
          </>
        )}
      </span>
    </div>
  );
}

export default StockIndicator;
```

**Features**:
- Real-time stock updates via WebSocket
- Low stock badges
- Backorder support with limits
- Waitlist functionality
- Stock reservation during checkout
- Admin low-stock alerts

---

### 5. Product Recommendation Engine

**Priority: Medium | Effort: High | Impact: High**

**Enhancement Description**:
AI-powered product recommendations based on browsing history, purchase patterns, and collaborative filtering.

**Technical Implementation**:

```javascript
// backend/services/recommendationEngine.js
class RecommendationEngine {
  constructor() {
    this.collaborativeModel = null;
    this.contentBasedModel = null;
  }

  // Content-based filtering using product features
  async getContentBasedRecommendations(userId, limit = 8) {
    const user = await require('../models/User').findById(userId)
      .populate('wishlist', 'category brand tags price')
      .populate('orders.items.product', 'category brand tags');

    if (!user) return [];

    // Build user profile from interactions
    const userProfile = this.buildUserProfile(user);

    // Find similar products
    const recommendations = await require('../models/Product').find({
      status: 'active',
      _id: { $nin: this.getViewedProductIds(user) },
      $or: [
        { category: { $in: userProfile.categories } },
        { brand: { $in: userProfile.brands } },
        { tags: { $in: userProfile.tags } }
      ]
    })
    .sort(this.calculateRelevanceScore(userProfile))
    .limit(limit);

    return recommendations;
  }

  // Collaborative filtering (users who bought this also bought)
  async getCollaborativeRecommendations(productId, limit = 8) {
    // Get products frequently purchased together
    const pipeline = [
      { $match: { 'items.product': productId, status: { $in: ['delivered', 'completed'] } } },
      { $unwind: '$items' },
      { $match: { 'items.product': { $ne: productId } } },
      { $group: {
        _id: '$items.product',
        count: { $sum: '$items.quantity' }
      }},
      { $sort: { count: -1 } },
      { $limit: limit },
      { $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }},
      { $unwind: '$product' },
      { $replaceRoot: { newRoot: '$product' } }
    ];

    const recommendations = await require('../models/Order').aggregate(pipeline);
    return recommendations;
  }

  // Frequently bought together (bundle recommendations)
  async getFrequentlyBoughtTogether(productId, limit = 3) {
    const bundles = await require('../models/Product').findById(productId)
      .select('frequentlyBoughtTogether');

    if (bundles?.frequentlyBoughtTogether?.length > 0) {
      return require('../models/Product').find({
        _id: { $in: bundles.frequentlyBoughtTogether },
        status: 'active'
      }).limit(limit);
    }

    // Fallback to collaborative filtering
    return this.getCollaborativeRecommendations(productId, limit);
  }

  // Recently viewed products
  async getRecentlyViewed(userId, limit = 8) {
    const User = require('../models/User');
    const user = await User.findById(userId).select('recentlyViewed');
    
    if (!user?.recentlyViewed?.length) return [];

    return require('../models/Product').find({
      _id: { $in: user.recentlyViewed.slice(0, 20) },
      status: 'active'
    }).limit(limit);
  }

  // Personalized homepage recommendations
  async getPersonalizedHomepage(userId) {
    const [
      recommendations,
      recentlyViewed,
      trending,
      newArrivals
    ] = await Promise.all([
      this.getContentBasedRecommendations(userId, 8),
      this.getRecentlyViewed(userId, 4),
      this.getTrendingProducts(8),
      this.getNewArrivals(4)
    ]);

    return {
      recommendedForYou: recommendations,
      recentlyViewed,
      trending,
      newArrivals
    };
  }

  // Track user interactions for ML
  async trackInteraction(userId, productId, type, metadata = {}) {
    const Interaction = require('../models/Interaction');
    
    await Interaction.create({
      user: userId,
      product: productId,
      type, // 'view', 'add_to_cart', 'purchase', 'wishlist'
      metadata,
      timestamp: new Date()
    });

    // Update user's recently viewed
    await require('../models/User').findByIdAndUpdate(userId, {
      $push: {
        recentlyViewed: {
          $each: [productId],
          $slice: -20 // Keep last 20
        }
      }
    });
  }

  buildUserProfile(user) {
    const categories = new Set();
    const brands = new Set();
    const tags = new Set();
    let totalSpent = 0;

    // From wishlist
    user.wishlist?.forEach(p => {
      categories.add(p.category?._id?.toString());
      brands.add(p.brand);
      p.tags?.forEach(t => tags.add(t));
    });

    // From orders
    user.orders?.forEach(order => {
      order.items?.forEach(item => {
        if (item.product) {
          categories.add(item.product.category?._id?.toString());
          brands.add(item.product.brand);
          item.product.tags?.forEach(t => tags.add(t));
          totalSpent += item.total;
        }
      });
    });

    return {
      categories: Array.from(categories),
      brands: Array.from(brands),
      tags: Array.from(tags),
      totalSpent,
      orderCount: user.orders?.length || 0
    };
  }
}

module.exports = new RecommendationEngine();

// Interaction Model
const interactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  type: { type: String, enum: ['view', 'add_to_cart', 'purchase', 'wishlist', 'search'] },
  metadata: {
    searchQuery: String,
    category: String,
    price: Number,
    quantity: Number
  },
  sessionId: String,
  device: String,
  location: String
}, { timestamps: true });

interactionSchema.index({ user: 1, product: 1, type: 1 });
interactionSchema.index({ createdAt: -1 });

mongoose.model('Interaction', interactionSchema);
```

**Frontend Recommendation Components**:

```javascript
// frontend/src/components/RecommendedProducts.js
import React from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { useInView } from 'react-intersection-observer';

function RecommendedProducts({ type = 'recommended', limit = 4 }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { ref, inView } = useInView({ triggerOnce: true });

  useEffect(() => {
    if (inView) fetchRecommendations();
  }, [inView, user]);

  const fetchRecommendations = async () => {
    try {
      const endpoint = user 
        ? `/recommendations/${type}`
        : `/products/best-sellers`;
      const response = await api.get(endpoint, { params: { limit } });
      setProducts(response.data.data);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const sectionTitles = {
    recommended: 'Recommended For You',
    trending: 'Trending Now',
    newArrivals: 'New Arrivals',
    recentlyViewed: 'Recently Viewed',
    frequentlyBought: 'Frequently Bought Together'
  };

  return (
    <motion.section
      ref={ref}
      className="recommendations-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: inView ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="section-title">{sectionTitles[type]}</h2>
      
      {loading ? (
        <div className="products-grid">
          {[...Array(limit)].map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          className="products-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.05 }}
        >
          {products.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.section>
  );
}

export default RecommendedProducts;
```

---

### 6. Product Bundles & Flash Sales

**Priority: Medium | Effort: Medium | Impact: High**

**Technical Implementation**:

```javascript
// backend/models/ProductBundle.js
const mongoose = require('mongoose');

const bundleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1 },
    discount: { type: Number, default: 0 } // Percentage discount on this item
  }],
  bundlePrice: {
    type: Number,
    required: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed', 'bogo'],
    default: 'percentage'
  },
  totalSavings: Number,
  image: String,
  stock: Number,
  minPurchase: Number,
  maxPurchase: Number,
  validFrom: Date,
  validUntil: Date,
  status: {
    type: String,
    enum: ['draft', 'active', 'expired', 'scheduled'],
    default: 'draft'
  },
  isFlashSale: { type: Boolean, default: false },
  flashSaleEndsAt: Date,
  totalSold: { type: Number, default: 0 },
  targetAudience: {
    type: String,
    enum: ['all', 'new_users', 'vip', 'specific_users'],
    default: 'all'
  },
  userLimit: Number
}, { timestamps: true });

// Calculate bundle savings
bundleSchema.pre('save', function(next) {
  const originalPrice = this.products.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0);
  
  this.totalSavings = originalPrice - this.bundlePrice;
  next();
});

// Check availability
bundleSchema.methods.checkAvailability = async function(quantity = 1) {
  if (this.stock !== undefined && this.stock < quantity) {
    return { available: false, message: 'Bundle out of stock' };
  }
  
  if (this.validUntil && new Date() > this.validUntil) {
    return { available: false, message: 'Bundle expired' };
  }
  
  if (this.validFrom && new Date() < this.validFrom) {
    return { available: false, message: 'Bundle not yet available' };
  }

  return { available: true, stock: this.stock };
};

module.exports = mongoose.model('ProductBundle', bundleSchema);

// Flash Sale Scheduler
const cron = require('node-cron');
const ProductBundle = require('../models/ProductBundle');

cron.schedule('* * * * *', async () => {
  const now = new Date();
  
  // Activate scheduled bundles
  await ProductBundle.updateMany(
    { 
      status: 'scheduled', 
      validFrom: { $lte: now } 
    },
    { status: 'active' }
  );
  
  // Expire expired bundles
  await ProductBundle.updateMany(
    { 
      status: 'active', 
      $or: [
        { validUntil: { $lt: now } },
        { isFlashSale: true, flashSaleEndsAt: { $lt: now } }
      ]
    },
    { status: 'expired' }
  );
});
```

**Frontend Flash Sale Component**:

```javascript
// frontend/src/components/FlashSaleBanner.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

function FlashSaleBanner() {
  const [flashSale, setFlashSale] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    fetchFlashSale();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchFlashSale = async () => {
    try {
      const response = await api.get('/bundles/flash-sale');
      setFlashSale(response.data.data);
    } catch (error) {
      // No active flash sale
    }
  };

  const updateTimer = () => {
    if (!flashSale?.flashSaleEndsAt) return;
    
    const now = new Date().getTime();
    const end = new Date(flashSale.flashSaleEndsAt).getTime();
    const diff = end - now;

    if (diff <= 0) {
      fetchFlashSale(); // Refresh when expired
      return;
    }

    setTimeLeft({
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000)
    });
  };

  if (!flashSale) return null;

  return (
    <motion.div
      className="flash-sale-banner"
      initial={{ height: 0 }}
      animate={{ height: 'auto' }}
      exit={{ height: 0 }}
    >
      <div className="flash-sale-content">
        <motion.div
          className="flash-badge"
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          ⚡ FLASH SALE
        </motion.div>
        
        <h3>{flashSale.name}</h3>
        
        <div className="countdown-timer">
          {['hours', 'minutes', 'seconds'].map(unit => (
            <motion.div
              key={unit}
              className="time-block"
              animate={{ 
                scale: timeLeft[unit] === 0 ? [1, 1.1, 1] : 1 
              }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <span className="time-value">
                {String(timeLeft[unit] || 0).padStart(2, '0')}
              </span>
              <span className="time-label">{unit}</span>
            </motion.div>
          ))}
        </div>

        <motion.button
          className="btn btn-warning"
          onClick={() => window.location.href = `/flash-sale`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Shop Now - ${flashSale.bundlePrice}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default FlashSaleBanner;
```

---

### 7. Address Autocomplete & Multiple Shipping

**Priority: Medium | Effort: Medium | Impact: Medium**

**Technical Implementation**:

```javascript
// backend/services/addressService.js
const axios = require('axios');

class AddressService {
  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY;
  }

  async autocomplete(input, sessionToken) {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
        {
          params: {
            input,
            types: 'address',
            components: 'country:US', // Restrict to US for now
            key: this.apiKey,
            sessiontoken: sessionToken
          }
        }
      );

      return response.data.predictions.map(prediction => ({
        description: prediction.description,
        placeId: prediction.place_id,
        mainText: prediction.structured_formatting.main_text,
        secondaryText: prediction.structured_formatting.secondary_text,
        types: prediction.types
      }));
    } catch (error) {
      console.error('Address autocomplete error:', error);
      return [];
    }
  }

  async getPlaceDetails(placeId) {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json`,
        {
          params: {
            place_id: placeId,
            fields: 'address_components,geometry',
            key: this.apiKey
          }
        }
      );

      return this.parseAddressComponents(response.data.result.address_components);
    } catch (error) {
      console.error('Place details error:', error);
      return null;
    }
  }

  parseAddressComponents(components) {
    const parsed = {};
    const mapping = {
      street_number: 'streetNumber',
      route: 'street',
      locality: 'city',
      administrative_area_level_1: 'state',
      postal_code: 'zipCode',
      country: 'country'
    };

    components.forEach(component => {
      const type = component.types.find(t => mapping[t]);
      if (type) {
        parsed[mapping[type]] = component.long_name;
      }
    });

    return {
      street: [parsed.streetNumber, parsed.street].filter(Boolean).join(' '),
      city: parsed.city,
      state: parsed.state,
      zipCode: parsed.zipCode,
      country: parsed.country,
      coordinates: {
        lat: components.geometry?.location?.lat,
        lng: components.geometry?.location?.lng
      }
    };
  }
}

module.exports = new AddressService();
```

**Frontend Address Autocomplete**:

```javascript
// frontend/src/components/AddressAutocomplete.js
import React, { useState, useEffect, useCallback } from 'react';
import { usePlacesWidget } from 'react-google-autocomplete';

function AddressAutocomplete({ value, onChange, placeholder, required }) {
  const [suggestions, setSuggestions] = useState([]);
  const [sessionToken, setSessionToken] = useState('');

  useEffect(() => {
    setSessionToken(generateSessionToken());
  }, []);

  const generateSessionToken = () => {
    return 'addr_' + Math.random().toString(36).substr(2, 9);
  };

  const handlePlaceSelect = async (place) => {
    if (place.formatted_address) {
      onChange({
        formatted: place.formatted_address,
        components: parseGoogleAddress(place.address_components)
      });
    }
  };

  const handleInputChange = async (input) => {
    if (!input || input.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=address&components=country:US&key=${process.env.REACT_APP_GOOGLE_API_KEY}`
      );
      const data = await response.json();
      setSuggestions(data.predictions || []);
    } catch (error) {
      console.error('Autocomplete error:', error);
    }
  };

  return (
    <div className="address-autocomplete">
      <input
        type="text"
        value={value.formatted || ''}
        onChange={(e) => {
          handleInputChange(e.target.value);
          onChange({ ...value, formatted: e.target.value });
        }}
        placeholder={placeholder}
        required={required}
        className="address-input"
      />
      
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion) => (
            <motion.li
              key={suggestion.place_id}
              className="suggestion-item"
              onClick={() => {
                handlePlaceSelect(suggestion);
                setSuggestions([]);
              }}
              whileHover={{ backgroundColor: '#f3f4f6' }}
            >
              <span className="main-text">{suggestion.structured_formatting.main_text}</span>
              <span className="secondary-text">
                {suggestion.structured_formatting.secondary_text}
              </span>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Multiple Addresses Management
function useMultipleAddresses(userId) {
  const [addresses, setAddresses] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAddresses();
  }, [userId]);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/users/addresses');
      setAddresses(response.data.data || []);
      setDefaultAddress(response.data.data.find(a => a.isDefault) || null);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (address) => {
    try {
      const response = await api.post('/users/addresses', address);
      setAddresses(response.data.data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  };

  const updateAddress = async (id, address) => {
    try {
      const response = await api.put(`/users/addresses/${id}`, address);
      setAddresses(response.data.data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  };

  const deleteAddress = async (id) => {
    try {
      await api.delete(`/users/addresses/${id}`);
      setAddresses(addresses.filter(a => a._id !== id));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  };

  const setAsDefault = async (id) => {
    try {
      await api.put(`/users/addresses/${id}`, { isDefault: true });
      setAddresses(addresses.map(a => ({
        ...a,
        isDefault: a._id === id
      })));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  };

  return {
    addresses,
    defaultAddress,
    loading,
    addAddress,
    updateAddress,
    deleteAddress,
    setAsDefault,
    refresh: fetchAddresses
  };
}
```

---

### 8. Guest Checkout

**Priority: High | Effort: Medium | Impact: High**

**Technical Implementation**:

```javascript
// backend/middleware/auth.js - Updated for guest checkout
const protect = (req, res, next) => {
  // Check for token or guest session
  const token = req.headers.authorization?.replace('Bearer ', '');
  const guestId = req.cookies.guestId;

  if (token) {
    // Authenticated user
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token' 
        });
      }
      req.user = await User.findById(decoded.id);
      next();
    });
  } if (guestId) {
    // Guest user - verify guest session
    const guest = await GuestSession.findById(guestId);
    if (!guest || guest.expiresAt < new Date()) {
      return res.status(401).json({ 
        success: false, 
        message: 'Guest session expired' 
      });
    }
    req.guest = guest;
    next();
  } else {
    // No auth - create temporary guest session
    const guestSession = await GuestSession.create({
      cart: [],
      tempEmail: req.body.email // For order confirmation
    });
    
    res.cookie('guestId', guestSession._id.toString(), {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: process.env.NODE_ENV === 'production'
    });
    
    req.guest = guestSession;
    next();
  }
};

// Guest Cart Routes
router.get('/guest-cart', async (req, res) => {
  const guestId = req.cookies.guestId;
  
  if (!guestId) {
    return res.json({ success: true, data: { items: [], subtotal: 0 } });
  }

  const guest = await GuestSession.findById(guestId)
    .populate('items.product', 'name price images quantity');
    
  res.json({ success: true, data: guest?.cart || { items: [], subtotal: 0 } });
});

// Convert guest cart to user cart on registration
router.post('/convert-guest', protect, async (req, res) => {
  const guestId = req.cookies.guestId;
  
  if (!guestId) {
    return res.json({ success: true, message: 'No guest cart to convert' });
  }

  const guest = await GuestSession.findById(guestId);
  if (guest?.items?.length > 0) {
    // Merge with existing user cart
    const userCart = await Cart.findOne({ user: req.user.id });
    
    for (const item of guest.items) {
      const existingIndex = userCart.items.findIndex(
        i => i.product.toString() === item.product._id.toString()
      );
      
      if (existingIndex > -1) {
        userCart.items[existingIndex].quantity += item.quantity;
      } else {
        userCart.items.push(item);
      }
    }
    
    await userCart.save();
    await guest.deleteOne();
  }
  
  res.clearCookie('guestId');
  res.json({ success: true, message: 'Cart converted successfully' });
});
```

---

### 9. Order Tracking with Visual Timeline

**Priority: High | Effort: Medium | Impact: High**

**Frontend Component**:

```javascript
// frontend/src/components/OrderTimeline.js
import React from 'react';
import { motion } from 'framer-motion';

const ORDER_STATUSES = [
  { key: 'pending', label: 'Order Placed', icon: '📋' },
  { key: 'confirmed', label: 'Confirmed', icon: '✓' },
  { key: 'processing', label: 'Processing', icon: '📦' },
  { key: 'shipped', label: 'Shipped', icon: '🚚' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🛵' },
  { key: 'delivered', label: 'Delivered', icon: '✅' }
];

function OrderTimeline({ currentStatus, timeline }) {
  const currentIndex = ORDER_STATUSES.findIndex(s => s.key === currentStatus);
  
  return (
    <div className="order-timeline">
      <div className="timeline-progress">
        <motion.div
          className="progress-bar"
          initial={{ width: 0 }}
          animate={{ width: `${(currentIndex / (ORDER_STATUSES.length - 1)) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      <div className="timeline-steps">
        {ORDER_STATUSES.map((status, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const timelineEntry = timeline?.find(t => t.status === status.key);
          
          return (
            <motion.div
              key={status.key}
              className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="step-indicator">
                {isCompleted ? (
                  <motion.div
                    className="checkmark"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    {status.icon}
                  </motion.div>
                ) : (
                  <div className="step-number">{index + 1}</div>
                )}
              </div>
              
              <div className="step-content">
                <span className="step-label">{status.label}</span>
                {timelineEntry && (
                  <span className="step-date">
                    {new Date(timelineEntry.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                )}
                {timelineEntry?.message && (
                  <span className="step-message">{timelineEntry.message}</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
Status === 'shipped' && (
      
      {current        <TrackingInfo trackingNumber={timeline.find(t => t.status === 'shipped')?.trackingNumber} />
      )}
    </div>
  );
}

function TrackingInfo({ trackingNumber }) {
  if (!trackingNumber) return null;
  
  return (
    <div className="tracking-info">
      <h4>Track Your Package</h4>
      <div className="tracking-number">
        <strong>Tracking #:</strong> {trackingNumber}
      </div>
      <motion.button
        className="btn btn-outline"
        onClick={() => window.open(`https://track.example.com/${trackingNumber}`, '_blank')}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Track Package
      </motion.button>
    </div>
  );
}

export default OrderTimeline;
```

---

### 10. One-Click Reorder

**Priority: Medium | Effort: Low | Impact: Medium**

**Frontend Implementation**:

```javascript
// frontend/src/components/ReorderButton.js
import React from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

function ReorderButton({ order, variant = 'button' }) {
  const { addToCart } = useCart();

  const handleReorder = async () => {
    try {
      // Check availability first
      const availabilityCheck = await Promise.all(
        order.items.map(async (item) => {
          try {
            const response = await api.get(`/products/${item.product._id}/availability`, {
              params: { quantity: item.quantity }
            });
            return { ...item, available: response.data.data.available };
          } catch {
            return { ...item, available: false };
          }
        })
      );

      const unavailableItems = availabilityCheck.filter(i => !i.available);

      if (unavailableItems.length > 0) {
        const confirm = window.confirm(
          `${unavailableItems.length} item(s) are currently unavailable. Add available items only?`
        );
        if (!confirm) return;
      }

      // Add available items to cart
      for (const item of availabilityCheck) {
        if (item.available) {
          await addToCart(item.product, item.quantity, item.variant);
        }
      }

      toast.success('Items added to cart');
    } catch (error) {
      toast.error('Failed to reorder');
    }
  };

  if (variant === 'button') {
    return (
      <motion.button
        className="btn btn-outline"
        onClick={handleReorder}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        disabled={order.status === 'cancelled'}
      >
        <FiRefreshCw /> Order Again
      </motion.button>
    );
  }

  return (
    <motion.button
      className="reorder-icon"
      onClick={handleReorder}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title="Order Again"
    >
      <FiRefreshCw />
    </motion.button>
  );
}

export default ReorderButton;
```

---

### 11. Loyalty Points System

**Priority: Low | Effort: High | Impact: Medium**

**Database Schema**:

```javascript
// backend/models/LoyaltyProgram.js
const mongoose = require('mongoose');

const loyaltyTierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  minPoints: { type: Number, required: true },
  discountPercent: { type: Number, default: 0 },
  freeShipping: { type: Boolean, default: false },
  birthdayBonus: { type: Number, default: 0 },
  exclusiveAccess: { type: Boolean, default: false }
});

const loyaltyTransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  points: { type: Number, required: true },
  type: {
    type: String,
    enum: ['earn', 'redeem', 'expire', 'bonus', 'adjustment'],
    required: true
  },
  source: {
    type: String,
    enum: ['purchase', 'review', 'referral', 'birthday', 'promotion', 'manual'],
    required: true
  },
  sourceId: mongoose.Schema.Types.ObjectId, // Order or review ID
  description: String,
  expiresAt: Date,
  balance: { type: Number, required: true }
}, { timestamps: true });

const loyaltyProgramSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  totalPoints: { type: Number, default: 0 },
  availablePoints: { type: Number, default: 0 },
  lifetimePoints: { type: Number, default: 0 },
  tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
  pointsPerDollar: { type: Number, default: 1 },
  redeemRate: { type: Number, default: 100 }, // 100 points = $1
  nextTierPoints: { type: Number, default: 1000 },
  birthdayBonus: { type: Number, default: 100 },
  lastActivityDate: Date,
  referrals: [{
    referredUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    pointsEarned: Number,
    status: { type: String, enum: ['pending', 'completed', 'expired'] }
  }]
}, { timestamps: true });

// Calculate tier based on lifetime points
loyaltyProgramSchema.methods.calculateTier = function() {
  const tiers = {
    bronze: { minPoints: 0, name: 'Bronze' },
    silver: { minPoints: 1000, name: 'Silver' },
    gold: { minPoints: 5000, name: 'Gold' },
    platinum: { minPoints: 15000, name: 'Platinum' }
  };
  
  for (const [key, tier] of Object.entries(tiers)) {
    if (this.lifetimePoints >= tier.minPoints) {
      this.tier = key;
    }
  }
  
  return this.tier;
};

// Earn points from purchase
loyaltyProgramSchema.methods.earnFromPurchase = async function(orderTotal, orderId) {
  const pointsEarned = Math.floor(orderTotal * this.pointsPerDollar);
  
  // Tier multiplier
  const tierMultipliers = { bronze: 1, silver: 1.25, gold: 1.5, platinum: 2 };
  const adjustedPoints = Math.floor(pointsEarned * tierMultipliers[this.tier]);
  
  this.totalPoints += adjustedPoints;
  this.availablePoints += adjustedPoints;
  this.lifetimePoints += adjustedPoints;
  this.lastActivityDate = new Date();
  
  await this.calculateTier();
  await this.save();
  
  // Record transaction
  await LoyaltyTransaction.create({
    user: this.user,
    points: adjustedPoints,
    type: 'earn',
    source: 'purchase',
    sourceId: orderId,
    description: `Points earned from order #${orderId}`,
    balance: this.availablePoints
  });
  
  return adjustedPoints;
};

// Redeem points
loyaltyProgramSchema.methods.redeemPoints = async function(points, amount) {
  if (points > this.availablePoints) {
    throw new Error('Insufficient points');
  }
  
  const redeemAmount = Math.floor(points / this.redeemRate);
  
  this.availablePoints -= points;
  this.totalPoints -= points;
  
  await this.save();
  
  await LoyaltyTransaction.create({
    user: this.user,
    points: -points,
    type: 'redeem',
    source: 'manual',
    description: `Redeemed ${points} points for $${redeemAmount}`,
    balance: this.availablePoints
  });
  
  return redeemAmount;
};

// Points expiration checker (run daily via cron)
loyaltyProgramSchema.statics.processExpirations = async function() {
  const now = new Date();
  
  const expiredPoints = await LoyaltyTransaction.find({
    expiresAt: { $lte: now },
    type: 'earn',
    expired: { $ne: true }
  }).populate('user');

  for (const transaction of expiredPoints) {
    const program = await this.findOne({ user: transaction.user._id });
    
    if (program.availablePoints >= transaction.points) {
      program.availablePoints -= transaction.points;
      program.save();
      
      transaction.type = 'expire';
      transaction.balance = program.availablePoints;
      transaction.expired = true;
      transaction.save();
      
      // Notify user
      await sendPointsExpirationEmail(transaction.user, transaction.points);
    }
  }
};

const LoyaltyTier = mongoose.model('LoyaltyTier', loyaltyTierSchema);
const LoyaltyTransaction = mongoose.model('LoyaltyTransaction', loyaltyTransactionSchema);
const LoyaltyProgram = mongoose.model('LoyaltyProgram', loyaltyProgramSchema);

module.exports = { LoyaltyTier, LoyaltyTransaction, LoyaltyProgram };
```

---

### 12. Q&A Section

**Priority: Low | Effort: Medium | Impact: Medium**

**Database Schema**:

```javascript
// backend/models/ProductQA.js
const mongoose = require('mongoose');

const productQASchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: String, required: true, maxlength: 1000 },
  answer: { type: String, maxlength: 2000 },
  answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Seller or admin
  answeredAt: Date,
  helpful: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, helpful: Boolean }],
  verifiedPurchase: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  isHidden: { type: Boolean, default: false },
  replies: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    isSeller: Boolean,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Indexes
productQASchema.index({ product: 1, createdAt: -1 });
productQASchema.index({ product: 1, verifiedPurchase: -1 });
productQASchema.index({ 'helpful.helpful': -1 });

// Virtual for helpful count
productQASchema.virtual('helpfulCount').get(function() {
  return this.helpful.filter(h => h.helpful).length;
});

// Virtual for question vote score
productQASchema.virtual('voteScore').get(function() {
  const helpful = this.helpful.filter(h => h.helpful).length;
  const notHelpful = this.helpful.filter(h => !h.helpful).length;
  return helpful - notHelpful;
});

productQASchema.set('toJSON', { virtuals: true });
productQASchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ProductQA', productQASchema);
```

---

## Technical Enhancements

### 1. Next.js Migration

**Priority: High | Effort: High | Impact: High**

**Migration Plan**:

```
1. Create Next.js app structure
   npx create-next-app@latest frontend --typescript
   cd frontend
   npm install next react react-dom

2. Move pages to app directory
   frontend/app/
   ├── layout.tsx
   ├── page.tsx (HomePage)
   ├── shop/
   │   └── page.tsx
   ├── product/
   │   └── [slug]/
   │       └── page.tsx
   ├── cart/
   │   └── page.tsx
   ├── checkout/
   │   └── page.tsx
   ├── account/
   │   └── page.tsx
   └── admin/
       └── page.tsx

3. Convert components to server/client components
   // Use 'use client' for interactive components
   'use client';
   import { motion } from 'framer-motion';
   
   export default function ProductCard({ product }) {
     return <motion.div>...</motion.div>;
   }

4. Implement Server Components for data fetching
   // app/shop/page.tsx
   async function getProducts() {
     const res = await fetch(`${process.env.API_URL}/api/products`, {
       next: { revalidate: 60 } // ISR - revalidate every 60 seconds
     });
     return res.json();
   }
   
   export default async function ShopPage() {
     const products = await getProducts();
     return <ProductGrid products={products.data} />;
   }

5. Implement Static Generation for product pages
   // app/product/[slug]/page.tsx
   export async function generateStaticParams() {
     const products = await fetchProducts();
     return products.data.map((product) => ({
       slug: product.slug
     }));
   }
   
   export async function generateMetadata({ params }) {
     const product = await fetchProduct(params.slug);
     return {
       title: product.name,
       description: product.shortDescription,
       openGraph: { images: [product.images[0]?.url] }
     };
   }

6. Image optimization
   // Replace <img> with Next.js Image component
   import Image from 'next/image';
   
   <Image
     src={product.images[0]?.url}
     alt={product.name}
     width={400}
     height={400}
     placeholder="blur"
     blurDataURL={product.images[0]?.url}
     priority={index < 4} // LCP optimization
   />

7. Font optimization
   // app/layout.tsx
   import { Inter } from 'next/font/google';
   
   const inter = Inter({ subsets: ['latin'] });
   
   export default function RootLayout({ children }) {
     return (
       <html lang="en" className={inter.className}>
         <body>{children}</body>
       </html>
     );
   }
```

**Benefits**:
- 40-70% faster page loads
- Better SEO with SSR
- Automatic image optimization
- Built-in code splitting
- Edge caching support
- Incremental Static Regeneration (ISR)

---

### 2. GraphQL API Layer

**Priority: Medium | Effort: High | Impact: Medium**

**Implementation**:

```javascript
// backend/graphql/schema.js
const { gql } = require('apollo-server-express');
const { GraphQLScalarType, Kind } = require('graphql');

const typeDefs = gql`
  scalar Date
  scalar Upload

  type Query {
    # Products
    products(
      category: String
      brand: String
      minPrice: Float
      maxPrice: Float
      minRating: Float
      search: String
      sort: String
      page: Int
      limit: Int
    ): ProductConnection!
    product(slug: ID!): Product
    featuredProducts(limit: Int): [Product!]!
    searchProducts(query: String!, limit: Int): [Product!]!
    
    # User
    me: User
    myOrders(page: Int, limit: Int): OrderConnection!
    order(id: ID!): Order
    myWishlist: [Product!]!
    myAddresses: [Address!]!
    loyaltyProgram: LoyaltyProgram
    
    # Cart
    cart: Cart
    
    # Admin
    adminStats: AdminStats!
    adminOrders(status: String, page: Int, limit: Int): OrderConnection!
    adminProducts(category: String, page: Int, limit: Int): ProductConnection!
  }

  type Mutation {
    # Auth
    register(input: RegisterInput!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    updateProfile(input: ProfileInput!): User!
    changePassword(currentPassword: String!, newPassword: String!): Boolean!
    
    # Cart
    addToCart(productId: ID!, quantity: Int, variant: JSON): Cart!
    updateCartItem(itemId: ID!, quantity: Int!): Cart!
    removeFromCart(itemId: ID!): Cart!
    applyCoupon(code: String!): Cart!
    
    # Orders
    createOrder(input: CreateOrderInput!): Order!
    cancelOrder(id: ID!): Order!
    
    # Reviews
    createReview(input: ReviewInput!): Review!
    helpfulReview(reviewId: ID!, helpful: Boolean!): Review!
    
    # Wishlist
    addToWishlist(productId: ID!): User!
    removeFromWishlist(productId: ID!): User!
    
    # Admin
    createProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductInput!): Product!
    deleteProduct(id: ID!): Boolean!
    updateOrderStatus(id: ID!, status: String!): Order!
  }

  type Product {
    id: ID!
    name: String!
    slug: String!
    description: String!
    shortDescription: String
    price: Float!
    compareAtPrice: Float
    images: [ProductImage!]!
    category: Category!
    brand: String
    rating: Float
    reviewCount: Int
    reviews: [Review!]
    inStock: Boolean!
    stockQuantity: Int!
    specifications: [Specification!]
    variants: [Variant!]
    relatedProducts: [Product!]
    frequentlyBoughtTogether: [Product!]
  }

  type ProductConnection {
    edges: [Product!]!
    pageInfo: PageInfo!
    totalCount: Int!
    aggregations: ProductAggregations
  }

  type Cart {
    id: ID!
    items: [CartItem!]!
    subtotal: Float!
    discount: Float!
    total: Float!
    itemCount: Int!
  }

  type Order {
    id: ID!
    orderNumber: String!
    status: String!
    items: [OrderItem!]!
    shippingAddress: Address!
    billingAddress: Address
    pricing: OrderPricing!
    timeline: [OrderTimelineEntry!]!
    createdAt: Date!
  }

  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    phone: String
    avatar: String
    addresses: [Address!]!
    wishlist: [Product!]!
    loyaltyProgram: LoyaltyProgram
  }

  type AuthPayload {
    token: String!
    user: User!
  }
`;

// Resolvers
const resolvers = {
  Query: {
    products: async (_, { category, brand, minPrice, maxPrice, minRating, search, sort, page = 1, limit = 12 }) => {
      const query = { status: 'active' };
      
      if (category) query.category = await getCategoryId(category);
      if (brand) query.brand = brand;
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = minPrice;
        if (maxPrice) query.price.$lte = maxPrice;
      }
      if (minRating) query['ratings.average'] = { $gte: minRating };
      if (search) query.$text = { $search: search };

      const [products, total] = await Promise.all([
        Product.find(query)
          .sort(getSortOptions(sort))
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Product.countDocuments(query)
      ]);

      return {
        edges: products,
        pageInfo: {
          hasNextPage: (page * limit) < total,
          hasPreviousPage: page > 1,
          currentPage: page,
          totalPages: Math.ceil(total / limit)
        },
        totalCount: total
      };
    }
  },

  Mutation: {
    addToCart: async (_, { productId, quantity, variant }, { user }) => {
      const cart = await Cart.findOne({ user: user._id });
      // ... cart logic
      return cart;
    }
  }
};

module.exports = { typeDefs, resolvers };
```

---

### 3. Redis Caching

**Priority: High | Effort: Medium | Impact: High**

**Implementation**:

```javascript
// backend/utils/cache.js
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

class Cache {
  constructor() {
    this.defaultTTL = 3600; // 1 hour
  }

  // Product caching
  async getProduct(productId) {
    const cached = await redis.get(`product:${productId}`);
    return cached ? JSON.parse(cached) : null;
  }

  async setProduct(productId, data, ttl = 3600) {
    await redis.setex(`product:${productId}`, ttl, JSON.stringify(data));
  }

  async invalidateProduct(productId) {
    await redis.del(`product:${productId}`);
  }

  // Category caching
  async getCategories() {
    const cached = await redis.get('categories:all');
    return cached ? JSON.parse(cached) : null;
  }

  async setCategories(data, ttl = 86400) { // 24 hours
    await redis.setex('categories:all', ttl, JSON.stringify(data));
  }

  // User session caching
  async getUserSession(userId) {
    const cached = await redis.get(`session:${userId}`);
    return cached ? JSON.parse(cached) : null;
  }

  async setUserSession(userId, data, ttl = 86400) {
    await redis.setex(`session:${userId}`, ttl, JSON.stringify(data));
  }

  async invalidateSession(userId) {
    await redis.del(`session:${userId}`);
  }

  // Cart caching
  async getCart(userId) {
    const cached = await redis.get(`cart:${userId}`);
    return cached ? JSON.parse(cached) : null;
  }

  async setCart(userId, data, ttl = 86400) {
    await redis.setex(`cart:${userId}`, ttl, JSON.stringify(data));
  }

  // Cache-aside pattern for products
  async getOrSet(key, fetchFn, ttl = 3600) {
    const cached = await this.get(key);
    if (cached) return cached;

    const data = await fetchFn();
    await this.set(key, data, ttl);
    return data;
  }

  // Invalidate patterns
  async invalidatePattern(pattern) {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  // Rate limiting
  async rateLimit(key, limit = 100, window = 60) {
    const current = await redis.incr(`ratelimit:${key}`);
    if (current === 1) {
      await redis.expire(`ratelimit:${key}`, window);
    }
    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
      resetIn: await redis.ttl(`ratelimit:${key}`)
    };
  }

  // Distributed lock
  async acquireLock(lockName, ttl = 30) {
    const lockValue = Date.now() + ttl * 1000;
    const acquired = await redis.set(
      `lock:${lockName}`,
      lockValue,
      'NX',
      'EX',
      ttl
    );
    
    return acquired === 'OK' ? lockValue : null;
  }

  async releaseLock(lockName, lockValue) {
    const current = await redis.get(`lock:${lockName}`);
    if (current === lockValue.toString()) {
      await redis.del(`lock:${lockName}`);
      return true;
    }
    return false;
  }
}

module.exports = new Cache();
```

**Cache Middleware**:

```javascript
// backend/middleware/cache.js
const cache = require('../utils/cache');

const cacheMiddleware = (key, ttl = 3600) => {
  return async (req, res, next) => {
    const cacheKey = typeof key === 'function' ? key(req) : key;
    
    try {
      const cached = await cache.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }
      
      // Store original json method
      const originalJson = res.json.bind(res);
      
      // Override json to cache response
      res.json = (data) => {
        cache.set(cacheKey, data, ttl);
        return originalJson(data);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};

// Usage in routes
router.get('/products', cacheMiddleware('products:featured', 300), getProducts);
router.get('/categories', cacheMiddleware('categories:all', 86400), getCategories);
```

---

### 4. WebSocket Support

**Priority: Medium | Effort: Medium | Impact: High**

**Implementation**:

```javascript
// backend/utils/websocket.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

class WebSocketServer {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socket
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST']
      }
    });

    // Authentication middleware
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.userId}`);
      
      // Store user connection
      this.connectedUsers.set(socket.userId, socket);
      
      // Join user's room
      socket.join(`user:${socket.userId}`);
      
      // Handle disconnect
      socket.on('disconnect', () => {
        this.connectedUsers.delete(socket.userId);
        console.log(`User disconnected: ${socket.userId}`);
      });

      // Subscribe to product stock updates
      socket.on('subscribe:product', (productId) => {
        socket.join(`product:${productId}`);
      });

      // Unsubscribe from product updates
      socket.on('unsubscribe:product', (productId) => {
        socket.leave(`product:${productId}`);
      });

      // Join order tracking room
      socket.on('subscribe:order', (orderId) => {
        socket.join(`order:${orderId}`);
      });
    });
  }

  // Notify specific user
  notifyUser(userId, event, data) {
    const socket = this.connectedUsers.get(userId);
    if (socket) {
      socket.emit(event, data);
    }
  }

  // Broadcast to product subscribers
  notifyProductStock(productId, stockData) {
    this.io.to(`product:${productId}`).emit('stock:update', stockData);
  }

  // Broadcast order status update
  notifyOrderStatus(orderId, status, timeline) {
    this.io.to(`order:${orderId}`).emit('order:status', { status, timeline });
  }

  // Broadcast to all connected users
  broadcast(event, data) {
    this.io.emit(event, data);
  }
}

module.exports = new WebSocketServer();

// Integration with order processing
// When order status changes
order.on('status:changed', async (order) => {
  websocket.notifyOrderStatus(order._id, order.status, order.timeline);
  
  // Send push notification via service
  await sendPushNotification(order.user, {
    title: 'Order Update',
    body: `Your order #${order.orderNumber} is now ${order.status}`
  });
});

// When stock changes
product.on('stock:changed', async (product) => {
  websocket.notifyProductStock(product._id, {
    productId: product._id,
    quantity: product.quantity,
    inStock: product.quantity > 0
  });
});
```

**Frontend WebSocket Hook**:

```javascript
// frontend/src/hooks/useWebSocket.js
import { useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const socket = io(process.env.REACT_APP_WS_URL, {
  autoConnect: false,
  auth: {
    token: localStorage.getItem('token')
  }
});

export function useWebSocket() {
  const { user, isAuthenticated } = useAuth();
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      socket.connect();
      
      socket.on('connect', () => {
        setConnected(true);
      });

      socket.on('disconnect', () => {
        setConnected(false);
      });

      socket.on('order:status', (data) => {
        setNotifications(prev => [{
          type: 'order',
          ...data,
          timestamp: new Date()
        }, ...prev]);
        
        // Show toast notification
        toast.success(`Order status: ${data.status}`);
      });

      socket.on('stock:update', (data) => {
        // Update product stock display
        window.dispatchEvent(new CustomEvent('stock:update', { detail: data }));
      });

      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('order:status');
        socket.off('stock:update');
        socket.disconnect();
      };
    }
  }, [isAuthenticated]);

  const subscribeToProduct = useCallback((productId) => {
    if (connected) {
      socket.emit('subscribe:product', productId);
    }
  }, [connected]);

  const unsubscribeFromProduct = useCallback((productId) => {
    if (connected) {
      socket.emit('unsubscribe:product', productId);
    }
  }, [connected]);

  const subscribeToOrder = useCallback((orderId) => {
    if (connected) {
      socket.emit('subscribe:order', orderId);
    }
  }, [connected]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    connected,
    notifications,
    subscribeToProduct,
    unsubscribeFromProduct,
    subscribeToOrder,
    clearNotifications
  };
}
```

---

### 5. Security Enhancements

**Priority: High | Effort: Medium | Impact: High**

**Implementation**:

```javascript
// backend/middleware/security.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 failed attempts per hour
  message: {
    success: false,
    message: 'Too many login attempts, please try again after an hour.'
  }
});

app.use('/api/', limiter);
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);

// Input sanitization
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// JWT Refresh Token Implementation
const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshToken');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

const verifyRefreshToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    const storedToken = await RefreshToken.findOne({
      token: refreshToken,
      user: decoded.id,
      expiresAt: { $gt: new Date() }
    });

    if (!storedToken) {
      throw new Error('Invalid refresh token');
    }

    return { valid: true, userId: decoded.id };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  const { valid, userId, error } = await verifyRefreshToken(refreshToken);
  
  if (!valid) {
    return res.status(401).json({
      success: false,
      message: error || 'Invalid refresh token'
    });
  }

  const user = await User.findById(userId);
  const tokens = generateTokens(user);

  // Store new refresh token
  await RefreshToken.create({
    user: user._id,
    token: tokens.refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  // Invalidate old refresh token
  await RefreshToken.deleteOne({ token: refreshToken });

  res.json({
    success: true,
    data: tokens
  });
});
```

---

### 6. CI/CD Pipeline

**Priority: High | Effort: Medium | Impact: High**

**GitHub Actions Workflow**:

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18.x'
  MONGODB_URI: ${{ secrets.MONGODB_URI }}
  REDIS_URL: ${{ secrets.REDIS_URL }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:6
        ports:
          - 27017:27017
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci
      
      - name: Backend linting
        run: cd backend && npm run lint
      
      - name: Backend tests
        run: cd backend && npm test
        env:
          JWT_SECRET: test-secret
          MONGODB_URI: mongodb://localhost:27017/test
      
      - name: Frontend linting
        run: cd frontend && npm run lint
      
      - name: Frontend tests
        run: cd frontend && npm test -- --coverage
        env:
          REACT_APP_API_URL: http://localhost:5000
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          flags: unittests
          directory: ./coverage

  security-scan:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Run npm audit
        run: |
          cd backend && npm audit --production --audit-level=high
          cd ../frontend && npm audit --production --audit-level=high
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  build:
    runs-on: ubuntu-latest
    needs: [test, security-scan]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Build frontend
        run: |
          cd frontend && npm run build
      
      - name: Upload frontend build
        uses: actions/upload-artifact@v3
        with:
          name: frontend-build
          path: frontend/build/
          retention-days: 7

  deploy-staging:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    environment:
      name: staging
      url: https://staging.example.com
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Download frontend build
        uses: actions/download-artifact@v3
        with:
          name: frontend-build
          path: frontend/build/
      
      - name: Deploy to staging
        run: |
          # Deploy commands for your hosting provider
          echo "Deploying to staging..."
      
      - name: Run smoke tests
        run: |
          npm install -g newman
          newman run tests/smoke-tests.json --environment staging.env.json

  deploy-production:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://example.com
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Download frontend build
        uses: actions/download-artifact@v3
        with:
          name: frontend-build
          path: frontend/build/
      
      - name: Deploy to production
        run: |
          # Deploy commands for your hosting provider
          echo "Deploying to production..."
      
      - name: Run smoke tests
        run: |
          npm install -g newman
          newman run tests/smoke-tests.json --environment production.env.json
      
      - name: Notify deployment
        run: |
          curl -X POST -H 'Content-type: application/json' \
            --data '{"text":"🚀 Deployed to production!"}' \
            ${{ secrets.SLACK_WEBHOOK }}
```

---

## UI/UX Improvements

### 1. Homepage Redesign

**Priority: High | Effort: High | Impact: High**

**Design Components**:

```javascript
// frontend/src/components/HeroSection.js
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

function HeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const heroContent = {
    title: 'Discover Premium Quality Products',
    subtitle: 'Shop the latest trends with free shipping on orders over $50',
    cta: {
      primary: { text: 'Shop Now', link: '/shop' },
      secondary: { text: 'View Collections', link: '/collections' }
    }
  };

  return (
    <motion.section
      className="hero-section"
      style={{ y }}
    >
      <motion.div
        className="hero-background"
        style={{ opacity }}
      >
        <div className="hero-gradient" />
        <motion.div
          className="hero-shapes"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      </motion.div>

      <motion.div
        className="hero-content"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {heroContent.title}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {heroContent.subtitle}
        </motion.p>

        <motion.div
          className="hero-cta"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.a
            href={heroContent.cta.primary.link}
            className="btn btn-primary btn-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {heroContent.cta.primary.text}
            <FiArrowRight />
          </motion.a>
          
          <motion.a
            href={heroContent.cta.secondary.link}
            className="btn btn-outline btn-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {heroContent.cta.secondary.text}
          </motion.a>
        </motion.div>
      </motion.div>

      <motion.div
        className="scroll-indicator"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <span>Scroll to explore</span>
        <motion.div
          className="scroll-arrow"
          style={{ rotate: 45 }}
        />
      </motion.div>
    </motion.section>
  );
}

// Featured Collections Component
function FeaturedCollections() {
  const collections = [
    { name: 'New Arrivals', image: '/images/collection-1.jpg', link: '/collections/new' },
    { name: 'Best Sellers', image: '/images/collection-2.jpg', link: '/collections/bestsellers' },
    { name: 'Sale', image: '/images/collection-3.jpg', link: '/sale' }
  ];

  return (
    <section className="featured-collections">
      <h2>Shop by Collection</h2>
      
      <div className="collections-grid">
        {collections.map((collection, index) => (
          <motion.a
            key={collection.name}
            href={collection.link}
            className="collection-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -10 }}
          >
            <motion.div
              className="collection-image"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <img src={collection.image} alt={collection.name} />
              <div className="collection-overlay" />
            </motion.div>
            
            <div className="collection-content">
              <h3>{collection.name}</h3>
              <span className="shop-link">
                Shop Now <FiArrowRight />
              </span>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
```

---

### 2. Dark Mode

**Priority: Medium | Effort: Medium | Impact: Medium**

**Implementation**:

```javascript
// frontend/src/context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

const themes = {
  light: {
    name: 'light',
    colors: {
      background: '#ffffff',
      surface: '#f8fafc',
      primary: '#2563eb',
      secondary: '#64748b',
      text: '#0f172a',
      textMuted: '#64748b',
      border: '#e2e8f0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      card: '#ffffff',
      hover: '#f1f5f9'
    }
  },
  dark: {
    name: 'dark',
    colors: {
      background: '#0f172a',
      surface: '#1e293b',
      primary: '#3b82f6',
      secondary: '#94a3b8',
      text: '#f1f5f9',
      textMuted: '#94a3b8',
      border: '#334155',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      card: '#1e293b',
      hover: '#334155'
    }
  }
};

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [systemPreference, setSystemPreference] = useState('light');

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    setSystemPreference(mediaQuery.matches ? 'dark' : 'light');
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const theme = themeName === 'system' ? themes[systemPreference] : themes[themeName];

  const setTheme = useCallback((name) => {
    setThemeName(name);
    localStorage.setItem('theme', name);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(themeName === 'dark' ? 'light' : 'dark');
  }, [themeName]);

  // Apply theme CSS variables
  useEffect(() => {
    const root = document.documentElement;
    
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Store current theme for CSS access
    localStorage.setItem('currentTheme', themeName);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

**Dark Mode Toggle Component**:

```javascript
// frontend/src/components/ThemeToggle.js
import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

function ThemeToggle() {
  const { themeName, toggleTheme } = useTheme();

  return (
    <motion.button
      className="theme-toggle"
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={`Switch to ${themeName === 'dark' ? 'light' : 'dark'} mode`}
    >
      <motion.div
        className="toggle-track"
        animate={{ backgroundColor: themeName === 'dark' ? '#334155' : '#e2e8f0' }}
      >
        <motion.div
          className="toggle-thumb"
          animate={{ x: themeName === 'dark' ? 24 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {themeName === 'dark' ? (
            <FiMoon size={14} color="#f1f5f9" />
          ) : (
            <FiSun size={14} color="#f59e0b" />
          )}
        </motion.div>
      </motion.div>
    </motion.button>
  );
}

export default ThemeToggle;
```

---

### 3. Infinite Scroll

**Priority: Medium | Effort: Medium | Impact: Medium**

**Implementation**:

```javascript
// frontend/src/hooks/useInfiniteScroll.js
import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';

export function useInfiniteScroll(initialParams = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observerRef = useRef(null);
  const loadingRef = useRef(false);

  const fetchMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    
    loadingRef.current = true;
    setLoading(true);
    
    try {
      const response = await api.get('/products', {
        params: { ...initialParams, page, limit: 12 }
      });
      
      const newItems = response.data.data || [];
      
      setItems(prev => [...prev, ...newItems]);
      setHasMore(newItems.length === 12);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [page, hasMore, initialParams]);

  // Reset when params change
  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setLoading(false);
    loadingRef.current = false;
  }, [initialParams]);

  // Initial fetch
  useEffect(() => {
    if (items.length === 0) {
      fetchMore();
    }
  }, []);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          fetchMore();
        }
      },
      {
        rootMargin: '200px',
        threshold: 0
      }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [fetchMore, hasMore, loading]);

  return {
    items,
    loading,
    hasMore,
    loadMore: fetchMore,
    observerRef
  };
}

// Usage in product grid
function InfiniteProductGrid({ filters }) {
  const { items, loading, hasMore, observerRef } = useInfiniteScroll(filters);

  return (
    <>
      <div className="products-grid">
        {items.map((product, index) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index % 12 * 0.05 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
      
      {/* Loading sentinel */}
      <div ref={observerRef} className="loading-sentinel">
        {loading && <Spinner />}
        {!hasMore && items.length > 0 && (
          <p className="end-message">You've seen all products</p>
        )}
      </div>
    </>
  );
}
```

---

### 4. Accessibility Features

**Priority: High | Effort: Medium | Impact: High**

**Implementation**:

```javascript
// Accessible Product Card Component
function AccessibleProductCard({ product }) {
  return (
    <article
      className="product-card"
      role="listitem"
      aria-labelledby={`product-${product._id}-name`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.location.href = `/product/${product.slug}`;
        }
      }}
    >
      <div className="product-image-wrapper">
        <img
          src={product.images?.[0]?.url}
          alt={product.images?.[0]?.alt || product.name}
          loading="lazy"
          aria-describedby={`product-${product._id}-price`}
        />
        
        {/* Screen reader only: sale badge */}
        {product.isOnSale && (
          <span className="sr-only">On sale</span>
        )}
        
        <motion.button
          className="quick-view-btn"
          aria-label={`Quick view ${product.name}`}
          whileHover={{ scale: 1 }}
          whileTap={{ scale: 0.95 }}
        >
          Quick View
        </motion.button>
      </div>

      <div className="product-info">
        <h3
          id={`product-${product._id}-name`}
          className="product-name"
        >
          <a href={`/product/${product.slug}`}>
            {product.name}
          </a>
        </h3>

        <div
          className="product-rating"
          role="img"
          aria-label={`Rated ${product.ratings?.average || 0} out of 5 stars`}
        >
          <StarRating rating={product.ratings?.average || 0} />
          <span className="sr-only">
            {product.ratings?.average || 0} stars,
            {product.ratings?.count || 0} reviews
          </span>
        </div>

        <div className="product-price">
          <span
            id={`product-${product._id}-price`}
            aria-current={product.isOnSale ? 'price-drop' : undefined}
          >
            ${product.price.toFixed(2)}
          </span>
          
          {product.isOnSale && (
            <span className="original-price" aria-label="Original price">
              ${product.compareAtPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to cart button with accessibility */}
        <motion.button
          className="add-to-cart-btn"
          onClick={() => addToCart(product)}
          aria-label={`Add ${product.name} to cart`}
          disabled={product.quantity === 0}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {product.quantity === 0 ? (
            <>
              <FiX aria-hidden="true" /> Out of Stock
            </>
          ) : (
            <>
              <FiShoppingCart aria-hidden="true" /> Add to Cart
            </>
          )}
        </motion.button>
      </div>
    </article>
  );
}

// Skip Navigation Link
function SkipNavigation() {
  return (
    <a
      href="#main-content"
      className="skip-navigation"
      onClick={(e) => {
        e.preventDefault();
        document.getElementById('main-content')?.focus();
      }}
    >
      Skip to main content
    </a>
  );
}

// Focus Trap for Modals
function FocusTrap({ children, isOpen }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const container = containerRef.current;
    const focusableElements = container?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements?.[0];
    const lastElement = focusableElements?.[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    firstElement?.focus();
    container?.addEventListener('keydown', handleTabKey);

    return () => {
      container?.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen]);

  return <div ref={containerRef}>{children}</div>;
}

// Announcer for dynamic content
function LiveAnnouncer() {
  const { announce } = useLiveRegions();

  useEffect(() => {
    window.addEventListener('announce', (e) => {
      announce(e.detail.message, e.detail.priority);
    });
    
    return () => {
      window.removeEventListener('announce');
    };
  }, [announce]);

  return null;
}

// Custom hook for live regions
function useLiveRegions() {
  const announce = useCallback((message, priority = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return { announce };
}
```

---

## Implementation Roadmap

### Phase 1: Quick Wins (Weeks 1-2)

| Feature | Effort | Impact | Priority |
|---------|--------|--------|----------|
| Dark Mode | 3 days | High | P1 |
| Guest Checkout | 4 days | High | P1 |
| Address Autocomplete | 3 days | Medium | P2 |
| One-Click Reorder | 2 days | Medium | P2 |
| Infinite Scroll | 3 days | Medium | P2 |

### Phase 2: Customer Experience (Weeks 3-6)

| Feature | Effort | Impact | Priority |
|---------|--------|--------|----------|
| Advanced Search | 5 days | High | P1 |
| Product Comparison | 4 days | Medium | P1 |
| Price Drop Alerts | 4 days | High | P1 |
| Stock Availability | 3 days | High | P1 |
| Order Tracking UI | 4 days | High | P1 |
| Q&A Section | 5 days | Medium | P2 |

### Phase 3: Technical Infrastructure (Weeks 7-10)

| Feature | Effort | Impact | Priority |
|---------|--------|--------|----------|
| Redis Caching | 4 days | High | P1 |
| Security Hardening | 3 days | High | P1 |
| CI/CD Pipeline | 4 days | High | P1 |
| WebSocket Setup | 5 days | Medium | P2 |
| JWT Refresh Tokens | 3 days | High | P1 |

### Phase 4: Advanced Features (Weeks 11-14)

| Feature | Effort | Impact | Priority |
|---------|--------|--------|----------|
| Recommendation Engine | 10 days | High | P1 |
| Loyalty Program | 10 days | Medium | P2 |
| Product Bundles | 5 days | Medium | P1 |
| Flash Sales | 5 days | High | P1 |

### Phase 5: Platform Evolution (Weeks 15-18)

| Feature | Effort | Impact | Priority |
|---------|--------|--------|----------|
| Next.js Migration | 15 days | Very High | P1 |
| GraphQL API | 10 days | Medium | P2 |
| Accessibility Audit | 5 days | High | P1 |

---

## Priority Matrix

```
                    HIGH IMPACT
                        │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
    │  Quick Wins        │  Core Features     │
    │  • Dark Mode       │  • Advanced Search │
    │  • Guest Checkout  │  • Recommendation  │
    │  • Security        │  • Redis Caching   │
    │  • CI/CD           │  • Next.js         │
    │                    │                    │
LOW ├────────────────────┼────────────────────┤ HIGH
EFFORT                   │                    EFFORT
    │                    │                    │
    │  Nice to Have      │  Consider Later    │
    │  • Q&A Section     │  • GraphQL API     │
    │  • Infinite Scroll│  • AI/ML Features  │
    │  • Theme Toggle   │  • Marketplace     │
    │                    │                    │
    └────────────────────┼────────────────────┘
                        │
                    LOW IMPACT
```

---

## Technical Considerations

### Performance Budget

| Metric | Target | Current | Priority |
|--------|--------|---------|----------|
| LCP | < 2.5s | TBD | P1 |
| FID | < 100ms | TBD | P1 |
| CLS | < 0.1 | TBD | P2 |
| TTFB | < 200ms | TBD | P1 |

### Monitoring & Analytics

1. **APM**: New Relic or Datadog
2. **Error Tracking**: Sentry
3. **User Analytics**: Mixpanel or Amplitude
4. **Performance**: Google PageSpeed Insights
5. **Uptime**: Pingdom or UptimeRobot

### Security Checklist

- [ ] HTTPS everywhere
- [ ] Rate limiting on all endpoints
- [ ] Input sanitization
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] JWT with short expiry
- [ ] Refresh token rotation
- [ ] Secure session management
- [ ] Audit logging
- [ ] Penetration testing

---

## Conclusion

This enhancement plan provides a structured approach to evolving the e-commerce platform from a solid foundation to a market-leading solution. The phased approach allows for incremental value delivery while maintaining system stability.

Key success factors:
1. Prioritize user-facing features that drive conversions
2. Invest in technical infrastructure for long-term scalability
3. Maintain accessibility standards throughout development
4. Implement robust testing at each phase
5. Monitor metrics to validate feature impact

Start with Phase 1 quick wins to build momentum, then systematically work through the remaining phases based on business priorities and available resources.
