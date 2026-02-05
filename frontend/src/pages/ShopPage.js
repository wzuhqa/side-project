import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../components/ProductCard';
import api from '../utils/api';
import { FiFilter, FiX } from 'react-icons/fi';

// Loading skeleton component
const ProductSkeleton = ({ index }) => (
  <motion.div
    className="product-skeleton"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
  >
    <div className="skeleton-image"></div>
    <div className="skeleton-content">
      <div className="skeleton-line"></div>
      <div className="skeleton-line short"></div>
    </div>
  </motion.div>
);

function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const filtersRef = useRef(null);

  // Filters
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    brand: searchParams.get('brand') || '',
    sort: searchParams.get('sort') || '-createdAt',
    search: searchParams.get('search') || ''
  });

  useEffect(() => {
    fetchProducts();
    fetchBrands();
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: searchParams.get('page') || 1,
        limit: 12,
        category: searchParams.get('category'),
        minPrice: searchParams.get('minPrice'),
        maxPrice: searchParams.get('maxPrice'),
        minRating: searchParams.get('minRating'),
        brand: searchParams.get('brand'),
        sort: searchParams.get('sort') || '-createdAt',
        search: searchParams.get('search')
      };

      const response = await api.getProducts(params);
      setProducts(response.data.data || []);
      setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
      setIsChanging(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await api.getBrands();
      setBrands(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch brands:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setIsChanging(true);
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete('page'); // Reset to first page
    setSearchParams(newParams);
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = (e) => {
    handleFilterChange('sort', e.target.value);
  };

  const clearFilters = () => {
    setSearchParams({ sort: filters.sort });
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      brand: '',
      sort: '-createdAt',
      search: ''
    });
  };

  const hasActiveFilters = filters.category || filters.minPrice || filters.maxPrice || 
                           filters.minRating || filters.brand || filters.search;

  return (
    <>
      <Helmet>
        <title>Shop - ShopNow</title>
        <meta name="description" content="Browse our collection of premium products" />
      </Helmet>

      <div className="shop-page">
        <div className="container">
          {/* Header */}
          <motion.div 
            className="shop-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="shop-breadcrumb">
              <motion.a 
                href="/"
                whileHover={{ color: '#2563eb' }}
              >
                Home
              </motion.a> 
              {' / '}
              <span>Shop</span>
              {filters.category && <span> / {filters.category}</span>}
            </div>
            
            <div className="shop-controls">
              <motion.button 
                className="filter-toggle-btn"
                onClick={() => setShowFilters(!showFilters)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiFilter size={18} />
                Filters
              </motion.button>

              <motion.select
                value={filters.sort}
                onChange={handleSort}
                className="sort-select"
                whileHover={{ borderColor: '#2563eb' }}
              >
                <option value="-createdAt">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="-ratings.average">Top Rated</option>
                <option value="-totalSold">Best Selling</option>
              </motion.select>
            </div>
          </motion.div>

          <div className="shop-layout">
            {/* Sidebar Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.aside
                  className="filters-sidebar open"
                  initial={{ opacity: 0, x: -300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -300 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="filters-header">
                    <motion.h3
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      Filters
                    </motion.h3>
                    {hasActiveFilters && (
                      <motion.button 
                        onClick={clearFilters}
                        className="clear-filters"
                        whileHover={{ color: '#2563eb' }}
                      >
                        Clear All
                      </motion.button>
                    )}
                    <motion.button 
                      className="close-filters" 
                      onClick={() => setShowFilters(false)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiX size={20} />
                    </motion.button>
                  </div>

                  {/* Search */}
                  <motion.div 
                    className="filter-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h4>Search</h4>
                    <motion.input
                      type="text"
                      placeholder="Search products..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="filter-input"
                      whileFocus={{ borderColor: '#2563eb', boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)' }}
                    />
                  </motion.div>

                  {/* Category */}
                  <motion.div 
                    className="filter-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <h4>Category</h4>
                    <div className="filter-options">
                      {['Electronics', 'Clothing', 'Home & Garden', 'Sports'].map((cat, i) => (
                        <motion.label 
                          key={cat} 
                          className="filter-option"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + (i * 0.05) }}
                        >
                          <input
                            type="radio"
                            name="category"
                            checked={!filters.category && cat === 'Electronics' ? false : filters.category === cat.toLowerCase()}
                            onChange={() => handleFilterChange('category', cat.toLowerCase())}
                          />
                          <span>{cat}</span>
                        </motion.label>
                      ))}
                    </div>
                  </motion.div>

                  {/* Price Range */}
                  <motion.div 
                    className="filter-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <h4>Price Range</h4>
                    <div className="price-inputs">
                      <motion.input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        className="price-input"
                        whileFocus={{ borderColor: '#2563eb' }}
                      />
                      <span>-</span>
                      <motion.input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        className="price-input"
                        whileFocus={{ borderColor: '#2563eb' }}
                      />
                    </div>
                  </motion.div>

                  {/* Rating */}
                  <motion.div 
                    className="filter-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h4>Customer Rating</h4>
                    <div className="filter-options">
                      {[4, 3, 2, 1].map((rating, i) => (
                        <motion.label 
                          key={rating} 
                          className="filter-option"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.35 + (i * 0.05) }}
                        >
                          <input
                            type="radio"
                            name="rating"
                            checked={filters.minRating === String(rating)}
                            onChange={() => handleFilterChange('minRating', rating)}
                          />
                          <span className="rating-option">
                            {[...Array(5)].map((_, starI) => (
                              <motion.span
                                key={starI}
                                className={`star ${starI < rating ? 'filled' : ''}`}
                                whileHover={{ scale: 1.2 }}
                              >
                                ★
                              </motion.span>
                            ))}
                            <span className="rating-text">& Up</span>
                          </span>
                        </motion.label>
                      ))}
                    </div>
                  </motion.div>

                  {/* Brand */}
                  {brands.length > 0 && (
                    <motion.div 
                      className="filter-section"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h4>Brand</h4>
                      <div className="filter-options">
                        {brands.map((brand, i) => (
                          <motion.label 
                            key={brand} 
                            className="filter-option"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.45 + (i * 0.05) }}
                          >
                            <input
                              type="radio"
                              name="brand"
                              checked={filters.brand === brand}
                              onChange={() => handleFilterChange('brand', brand)}
                            />
                            <span>{brand}</span>
                          </motion.label>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Products Area */}
            <motion.div 
              className="products-area"
              key={isChanging ? 'loading' : 'loaded'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {loading ? (
                <motion.div 
                  className="products-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {[...Array(8)].map((_, i) => (
                    <ProductSkeleton key={i} index={i} />
                  ))}
                </motion.div>
              ) : products.length > 0 ? (
                <>
                  <motion.div 
                    className="products-count"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    Showing {products.length} of {pagination.total} products
                  </motion.div>
                  <motion.div 
                    className="products-grid"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ staggerChildren: 0.05 }}
                  >
                    <AnimatePresence mode="popLayout">
                      {products.map((product, index) => (
                        <motion.div
                          key={product._id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <ProductCard product={product} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <motion.div 
                      className="pagination"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {[...Array(pagination.pages)].map((_, i) => (
                        <motion.button
                          key={i}
                          className={`page-btn ${pagination.page === i + 1 ? 'active' : ''}`}
                          onClick={() => {
                            const newParams = new URLSearchParams(searchParams);
                            newParams.set('page', String(i + 1));
                            setSearchParams(newParams);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {i + 1}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </>
              ) : (
                <motion.div 
                  className="empty-state"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="empty-state-icon"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🔍
                  </motion.div>
                  <h3 className="empty-state-title">No products found</h3>
                  <p className="empty-state-text">Try adjusting your filters or search terms</p>
                  <motion.button 
                    onClick={clearFilters}
                    className="btn btn-primary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Clear Filters
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        <style jsx>{`
          .shop-page {
            padding: 32px 0;
            min-height: 80vh;
          }

          .shop-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
          }

          .shop-breadcrumb {
            font-size: 14px;
            color: #6b7280;
          }

          .shop-breadcrumb a {
            color: #2563eb;
          }

          .shop-controls {
            display: flex;
            gap: 12px;
          }

          .filter-toggle-btn {
            display: none;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            background: #f3f4f6;
            border-radius: 8px;
            font-weight: 500;
            border: none;
            cursor: pointer;
          }

          .sort-select {
            padding: 10px 16px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: #fff;
            cursor: pointer;
          }

          .shop-layout {
            display: flex;
            gap: 32px;
          }

          .filters-sidebar {
            width: 260px;
            flex-shrink: 0;
            background: #fff;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          }

          .filters-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
          }

          .filters-header h3 {
            font-size: 18px;
            font-weight: 600;
          }

          .clear-filters {
            font-size: 13px;
            color: #2563eb;
            background: none;
            border: none;
            cursor: pointer;
          }

          .close-filters {
            display: none;
            background: none;
            border: none;
            cursor: pointer;
          }

          .filter-section {
            margin-bottom: 24px;
            padding-bottom: 24px;
            border-bottom: 1px solid #e5e7eb;
          }

          .filter-section h4 {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 12px;
          }

          .filter-input {
            width: 100%;
            padding: 10px 14px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
          }

          .price-inputs {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .price-input {
            width: 100%;
            padding: 10px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
          }

          .filter-options {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .filter-option {
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            font-size: 14px;
          }

          .filter-option input[type="radio"] {
            accent-color: #2563eb;
          }

          .rating-option {
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .star {
            color: #d1d5db;
            font-size: 14px;
          }

          .star.filled {
            color: #f59e0b;
          }

          .rating-text {
            margin-left: 6px;
            color: #6b7280;
          }

          .products-area {
            flex: 1;
          }

          .products-count {
            margin-bottom: 16px;
            font-size: 14px;
            color: #6b7280;
          }

          .products-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }

          .product-skeleton {
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
          }

          .skeleton-image {
            aspect-ratio: 1;
            background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }

          .skeleton-content {
            padding: 16px;
          }

          .skeleton-line {
            height: 16px;
            background: #f3f4f6;
            border-radius: 4px;
            margin-bottom: 8px;
          }

          .skeleton-line.short {
            width: 60%;
          }

          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }

          .pagination {
            display: flex;
            justify-content: center;
            gap: 8px;
            margin-top: 40px;
          }

          .page-btn {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: #fff;
            cursor: pointer;
            font-weight: 500;
          }

          .page-btn.active {
            background: #2563eb;
            color: #fff;
            border-color: #2563eb;
          }

          .empty-state {
            text-align: center;
            padding: 60px 20px;
          }

          .empty-state-icon {
            font-size: 64px;
            margin-bottom: 16px;
          }

          .empty-state-title {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 8px;
          }

          .empty-state-text {
            color: #6b7280;
            margin-bottom: 24px;
          }

          .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: #2563eb;
            color: #fff;
            font-weight: 500;
            border-radius: 8px;
            text-decoration: none;
            cursor: pointer;
            border: none;
          }

          @media (max-width: 1024px) {
            .products-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (max-width: 768px) {
            .shop-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 16px;
            }

            .shop-controls {
              width: 100%;
            }

            .filter-toggle-btn {
              display: flex;
            }

            .close-filters {
              display: block;
            }

            .filters-sidebar {
              position: fixed;
              top: 0;
              left: 0;
              bottom: 0;
              width: 300px;
              z-index: 1001;
              border-radius: 0;
              overflow-y: auto;
            }

            .shop-layout {
              flex-direction: column;
            }

            .products-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
        `}</style>
      </div>
    </>
  );
}

export default ShopPage;
