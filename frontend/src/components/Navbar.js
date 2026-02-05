import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Logo from './Logo';
import SearchBar from './SearchBar';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const menuRef = useRef(null);

  const categories = [
    {
      name: 'Electronics',
      slug: 'electronics',
      icon: '📱',
      subcategories: [
        { name: 'Smartphones', slug: 'smartphones' },
        { name: 'Laptops', slug: 'laptops' },
        { name: 'Headphones', slug: 'headphones' },
        { name: 'Tablets', slug: 'tablets' },
        { name: 'Cameras', slug: 'cameras' },
        { name: 'TVs', slug: 'tvs' }
      ]
    },
    {
      name: 'Fashion',
      slug: 'fashion',
      icon: '👗',
      subcategories: [
        { name: 'Men', slug: 'men' },
        { name: 'Women', slug: 'women' },
        { name: 'Shoes', slug: 'shoes' },
        { name: 'Accessories', slug: 'accessories' },
        { name: 'Watches', slug: 'watches' }
      ]
    },
    {
      name: 'Home & Garden',
      slug: 'home-garden',
      icon: '🏠',
      subcategories: [
        { name: 'Kitchen', slug: 'kitchen' },
        { name: 'Bedding', slug: 'bedding' },
        { name: 'Furniture', slug: 'furniture' },
        { name: 'Lighting', slug: 'lighting' },
        { name: 'Garden', slug: 'garden' }
      ]
    },
    {
      name: 'Sports & Outdoors',
      slug: 'sports-outdoors',
      icon: '⚽',
      subcategories: [
        { name: 'Fitness', slug: 'fitness' },
        { name: 'Outdoor', slug: 'outdoor' },
        { name: 'Camping', slug: 'camping' },
        { name: 'Sports', slug: 'sports' }
      ]
    },
    {
      name: 'Beauty',
      slug: 'beauty-personal-care',
      icon: '💄',
      subcategories: [
        { name: 'Skincare', slug: 'skincare' },
        { name: 'Haircare', slug: 'haircare' },
        { name: 'Makeup', slug: 'makeup' },
        { name: 'Fragrance', slug: 'fragrance' }
      ]
    },
    {
      name: 'Books & Media',
      slug: 'books-media',
      icon: '📚',
      subcategories: [
        { name: 'Books', slug: 'books' },
        { name: 'Movies', slug: 'movies' },
        { name: 'Music', slug: 'music' },
        { name: 'Gaming', slug: 'gaming' }
      ]
    },
    {
      name: 'Toys & Games',
      slug: 'toys-games',
      icon: '🎮',
      subcategories: [
        { name: 'Board Games', slug: 'board-games' },
        { name: 'Video Games', slug: 'video-games' },
        { name: 'Action Figures', slug: 'action-figures' },
        { name: 'Puzzles', slug: 'puzzles' }
      ]
    },
    {
      name: 'Automotive',
      slug: 'automotive',
      icon: '🚗',
      subcategories: [
        { name: 'Electronics', slug: 'car-electronics' },
        { name: 'Accessories', slug: 'car-accessories' },
        { name: 'Tools', slug: 'car-tools' }
      ]
    },
    {
      name: 'Health',
      slug: 'health-wellness',
      icon: '💪',
      subcategories: [
        { name: 'Vitamins', slug: 'vitamins' },
        { name: 'Equipment', slug: 'fitness-equipment' },
        { name: 'Wellness', slug: 'wellness' }
      ]
    },
    {
      name: 'Food & Beverages',
      slug: 'food-beverages',
      icon: '🍕',
      subcategories: [
        { name: 'Coffee', slug: 'coffee' },
        { name: 'Appliances', slug: 'appliances' },
        { name: 'Snacks', slug: 'snacks' }
      ]
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
        setActiveDropdown(null);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMouseEnter = (slug) => {
    setActiveDropdown(slug);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <Logo size="medium" />
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-menu" ref={menuRef}>
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Home
          </NavLink>
          
          <div 
            className="nav-dropdown"
            onMouseEnter={() => handleMouseEnter('categories')}
            onMouseLeave={handleMouseLeave}
          >
            <span className="nav-link dropdown-trigger">
              Categories <span className="dropdown-arrow">▼</span>
            </span>
            
            {activeDropdown === 'categories' && (
              <div className="dropdown-menu categories-menu">
                <div className="categories-grid">
                  {categories.map(category => (
                    <div key={category.slug} className="category-column">
                      <Link 
                        to={`/products?category=${category.slug}`}
                        className="category-header"
                      >
                        <span className="category-icon">{category.icon}</span>
                        {category.name}
                      </Link>
                      <div className="subcategory-list">
                        {category.subcategories.map(sub => (
                          <Link 
                            key={sub.slug}
                            to={`/products?category=${category.slug}&subcategory=${sub.slug}`}
                            className="subcategory-link"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <NavLink 
            to="/products" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Shop
          </NavLink>
          
          <NavLink 
            to="/products?category=deals" 
            className={({ isActive }) => `nav-link deals-link ${isActive ? 'active' : ''}`}
          >
            Deals 🔥
          </NavLink>
          
          <NavLink 
            to="/products?sort=new" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            New Arrivals
          </NavLink>
        </div>

        {/* Search Bar */}
        <div className="navbar-search">
          <SearchBar />
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          <button className="action-btn" aria-label="Wishlist">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span className="action-badge">3</span>
          </button>
          
          <Link to="/cart" className="action-btn cart-btn" aria-label="Cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className="action-badge">5</span>
          </Link>
          
          <Link to="/account" className="action-btn user-btn" aria-label="Account">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className={`mobile-menu-toggle ${isMenuOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-search">
          <SearchBar />
        </div>
        
        <div className="mobile-nav-links">
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/products" onClick={() => setIsMenuOpen(false)}>Shop</Link>
          <Link to="/products?category=deals" onClick={() => setIsMenuOpen(false)}>Deals 🔥</Link>
          <Link to="/products?sort=new" onClick={() => setIsMenuOpen(false)}>New Arrivals</Link>
          
          <div className="mobile-category-section">
            <span className="mobile-section-title">Categories</span>
            {categories.map(cat => (
              <div key={cat.slug} className="mobile-category">
                <Link 
                  to={`/products?category=${cat.slug}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>{cat.icon}</span> {cat.name}
                </Link>
              </div>
            ))}
          </div>
          
          <Link to="/account" onClick={() => setIsMenuOpen(false)}>My Account</Link>
          <Link to="/wishlist" onClick={() => setIsMenuOpen(false)}>Wishlist</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
