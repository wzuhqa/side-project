import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import './ProductsPage.css';

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Customer Rating' },
  { value: 'bestselling', label: 'Best Selling' }
];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filters from URL params
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'newest';
  const page = parseInt(searchParams.get('page')) || 1;
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('minRating') || '';
  const inStock = searchParams.get('inStock') === 'true';

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      if (sortBy) params.append('sortBy', sortBy);
      if (page) params.append('page', page);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (minRating) params.append('rating', minRating);
      if (inStock) params.append('inStock', 'true');

      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.products || []);
      setPagination({
        page: response.data.page || 1,
        totalPages: response.data.totalPages || 1,
        total: response.data.totalCount || 0
      });
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = category || search || minPrice || maxPrice || minRating || inStock;

  return (
    <div className="products-page">
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <div className="breadcrumbs-container">
          <Link to="/">Home</Link>
          <span className="separator">›</span>
          {category ? (
            <>
              <Link to="/products">Products</Link>
              <span className="separator">›</span>
              <span className="current">{category}</span>
            </>
          ) : (
            <span className="current">All Products</span>
          )}
        </div>
      </div>

      <div className="products-container">
        {/* Mobile Filter Toggle */}
        <button 
          className="mobile-filter-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? '✕ Close Filters' : '☰ Filters'}
        </button>

        {/* Sidebar Filters */}
        <aside className={`filters-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="filters-header">
            <h2>Filters</h2>
            {hasActiveFilters && (
              <button className="clear-filters" onClick={clearFilters}>
                Clear All
              </button>
            )}
          </div>

          {/* Search Filter */}
          {search && (
            <div className="filter-section">
              <h3>Search Results</h3>
              <p className="search-term">"{search}"</p>
            </div>
          )}

          {/* Category Filter */}
          <div className="filter-section">
            <h3>Category</h3>
            <div className="filter-options">
              <label className={`filter-option ${!category ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="category"
                  checked={!category}
                  onChange={() => updateFilters('category', '')}
                />
                All Categories
              </label>
              {['electronics', 'fashion', 'home-garden', 'sports-outdoors', 'beauty-personal-care'].map(cat => (
                <label key={cat} className={`filter-option ${category === cat ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="category"
                    checked={category === cat}
                    onChange={() => updateFilters('category', cat)}
                  />
                  {cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </label>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="filter-section">
            <h3>Price Range</h3>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => updateFilters('minPrice', e.target.value)}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => updateFilters('maxPrice', e.target.value)}
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div className="filter-section">
            <h3>Customer Rating</h3>
            <div className="filter-options">
              {[4, 3, 2, 1].map(rating => (
                <label key={rating} className={`filter-option ${minRating === String(rating) ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === String(rating)}
                    onChange={() => updateFilters('minRating', rating)}
                  />
                  {'★'.repeat(rating)}{'☆'.repeat(5 - rating)} & Up
                </label>
              ))}
            </div>
          </div>

          {/* Availability Filter */}
          <div className="filter-section">
            <h3>Availability</h3>
            <label className={`filter-option checkbox ${inStock ? 'active' : ''}`}>
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => updateFilters('inStock', e.target.checked ? 'true' : '')}
              />
              In Stock Only
            </label>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="products-main">
          {/* Results Header */}
          <div className="results-header">
            <div className="results-info">
              <h1>{category ? category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'All Products'}</h1>
              <p>{pagination.total} products found</p>
            </div>
            
            <div className="sort-control">
              <label>Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => updateFilters('sortBy', e.target.value)}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="active-filters">
              {category && (
                <span className="filter-tag">
                  {category}
                  <button onClick={() => updateFilters('category', '')}>✕</button>
                </span>
              )}
              {search && (
                <span className="filter-tag">
                  Search: {search}
                  <button onClick={() => updateFilters('search', '')}>✕</button>
                </span>
              )}
              {minPrice && (
                <span className="filter-tag">
                  Min: ${minPrice}
                  <button onClick={() => updateFilters('minPrice', '')}>✕</button>
                </span>
              )}
              {maxPrice && (
                <span className="filter-tag">
                  Max: ${maxPrice}
                  <button onClick={() => updateFilters('maxPrice', '')}>✕</button>
                </span>
              )}
              {minRating && (
                <span className="filter-tag">
                  {minRating}+ Stars
                  <button onClick={() => updateFilters('minRating', '')}>✕</button>
                </span>
              )}
              {inStock && (
                <span className="filter-tag">
                  In Stock
                  <button onClick={() => updateFilters('inStock', '')}>✕</button>
                </span>
              )}
            </div>
          )}

          {/* Products */}
          {loading ? (
            <div className="products-grid loading">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="product-skeleton">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text short"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="products-grid">
                {products.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="page-btn"
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    ← Previous
                  </button>
                  
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Show first, last, and nearby pages
                    if (
                      pageNum === 1 ||
                      pageNum === pagination.totalPages ||
                      (pageNum >= page - 2 && pageNum <= page + 2)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          className={`page-btn ${pageNum === page ? 'active' : ''}`}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === page - 3 ||
                      pageNum === page + 3
                    ) {
                      return <span key={pageNum} className="page-ellipsis">...</span>;
                    }
                    return null;
                  })}
                  
                  <button
                    className="page-btn"
                    disabled={page === pagination.totalPages}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-products">
              <span className="no-products-icon">🔍</span>
              <h2>No products found</h2>
              <p>Try adjusting your filters or search terms</p>
              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductsPage;
