import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './SearchBar.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        fetchSuggestions();
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/products/search?q=${encodeURIComponent(query)}&limit=5`);
      setSuggestions(response.data.products || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (product) => {
    navigate(`/product/${product.slug}`);
    setShowSuggestions(false);
    setQuery('');
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="search-bar" ref={searchRef}>
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search for products..."
          className="search-input"
          autoComplete="off"
        />
        <button type="submit" className="search-button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </button>
      </form>

      {showSuggestions && query.length >= 2 && (
        <div className="search-suggestions">
          {loading ? (
            <div className="suggestion-loading">
              <span className="loading-spinner small"></span>
              Searching...
            </div>
          ) : suggestions.length > 0 ? (
            <>
              <div className="suggestion-products">
                {suggestions.map(product => (
                  <div
                    key={product._id}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(product)}
                  >
                    <img
                      src={product.images?.[0]?.url || '/placeholder.png'}
                      alt={product.name}
                      className="suggestion-image"
                    />
                    <div className="suggestion-info">
                      <span className="suggestion-name">{product.name}</span>
                      <span className="suggestion-price">
                        ${product.price?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="view-all-results"
                onClick={() => {
                  navigate(`/products?search=${encodeURIComponent(query)}`);
                  setShowSuggestions(false);
                }}
              >
                View all results for "{query}"
              </div>
            </>
          ) : (
            <div className="no-suggestions">
              <span>🔍</span>
              <p>No products found for "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
