import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiShoppingCart, FiUser, FiHeart, FiMenu, FiX, FiHome, FiGrid, FiTag } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [prevCartCount, setPrevCartCount] = useState(0);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartCount } = useCart();

  const cartCount = getCartCount();

  // Track cart count changes for animation
  useEffect(() => {
    if (cartCount > prevCartCount) {
      setPrevCartCount(cartCount);
    }
  }, [cartCount, prevCartCount]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="header">
      {/* Top Bar */}
      <motion.div 
        className="header-top"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Free shipping on orders over $50 | Use code WELCOME10 for 10% off
          </motion.p>
        </div>
      </motion.div>

      {/* Main Header */}
      <motion.div 
        className="header-main"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="container">
          <div className="header-content">
            {/* Logo with animation */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link to="/" className="header-logo">
                <motion.span 
                  className="logo-text"
                  whileHover={{ color: '#2563eb' }}
                  transition={{ duration: 0.2 }}
                >
                  Shop
                </motion.span>
                <motion.span 
                  className="logo-highlight"
                  whileHover={{ scale: 1.1, color: '#1d4ed8' }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  Now
                </motion.span>
              </Link>
            </motion.div>

            {/* Search Bar */}
            <motion.form 
              onSubmit={handleSearch} 
              className="header-search"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.01 }}
            >
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <motion.button 
                type="submit" 
                className="search-btn"
                whileHover={{ scale: 1.05, background: '#1d4ed8' }}
                whileTap={{ scale: 0.95 }}
              >
                <FiSearch size={20} />
              </motion.button>
            </motion.form>

            {/* Actions */}
            <div className="header-actions">
              {/* Wishlist */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/account/wishlist" className="header-action">
                  <FiHeart size={22} />
                  {isAuthenticated && (
                    <motion.span 
                      className="action-badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      0
                    </motion.span>
                  )}
                </Link>
              </motion.div>

              {/* User Menu */}
              <div className="user-menu-container">
                <motion.button 
                  className="header-action"
                  onClick={() => isAuthenticated ? setIsUserMenuOpen(!isUserMenuOpen) : navigate('/login')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiUser size={22} />
                </motion.button>

                <AnimatePresence>
                  {isAuthenticated && isUserMenuOpen && (
                    <motion.div
                      className="user-dropdown"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <div className="user-dropdown-header">
                        <p className="user-name">{user?.firstName} {user?.lastName}</p>
                        <p className="user-email">{user?.email}</p>
                      </div>
                      <div className="user-dropdown-divider"></div>
                      <Link to="/account" className="user-dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                        My Account
                      </Link>
                      <Link to="/account/orders" className="user-dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                        My Orders
                      </Link>
                      <Link to="/account/wishlist" className="user-dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                        Wishlist
                      </Link>
                      {user?.role === 'admin' && (
                        <Link to="/admin" className="user-dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                          Admin Dashboard
                        </Link>
                      )}
                      <div className="user-dropdown-divider"></div>
                      <button onClick={handleLogout} className="user-dropdown-item logout">
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart with bounce animation */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/cart" className="header-action cart-btn">
                  <FiShoppingCart size={22} />
                  {cartCount > 0 && (
                    <motion.span 
                      className="cart-badge"
                      key={cartCount}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      whileInView={{ scale: [1, 1.2, 1] }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </Link>
              </motion.div>

              {/* Mobile Menu Toggle */}
              <motion.button 
                className="mobile-menu-toggle hide-desktop"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FiX size={24} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FiMenu size={24} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <AnimatePresence>
        <motion.nav 
          className={`header-nav ${isMenuOpen ? 'open' : ''}`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="container">
            <ul className="nav-list">
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Link to="/" className="nav-link">
                  <FiHome /> Home
                </Link>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Link to="/shop" className="nav-link">
                  <FiGrid /> Shop
                </Link>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Link to="/shop?category=electronics" className="nav-link">
                  <FiTag /> Electronics
                </Link>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Link to="/shop?category=clothing" className="nav-link">
                  <FiTag /> Fashion
                </Link>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link to="/shop?category=home-garden" className="nav-link">
                  <FiTag /> Home & Garden
                </Link>
              </motion.li>
            </ul>
          </div>
        </motion.nav>
      </AnimatePresence>

      <style jsx>{`
        .header {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: #fff;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .header-top {
          background: #1f2937;
          color: #fff;
          padding: 8px 0;
          font-size: 13px;
          text-align: center;
          overflow: hidden;
        }

        .header-main {
          padding: 16px 0;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .header-logo {
          font-size: 24px;
          font-weight: 700;
          text-decoration: none;
        }

        .logo-text {
          color: #1f2937;
          transition: color 0.2s;
        }

        .logo-highlight {
          color: #2563eb;
          transition: all 0.2s;
        }

        .header-search {
          flex: 1;
          max-width: 500px;
          display: flex;
          position: relative;
        }

        .search-input {
          width: 100%;
          padding: 12px 48px 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #2563eb;
        }

        .search-btn {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          padding: 8px;
          background: #2563eb;
          color: #fff;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-action {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 8px;
          color: #374151;
          text-decoration: none;
          transition: all 0.2s;
        }

        .header-action:hover {
          background: #f3f4f6;
          color: #2563eb;
        }

        .cart-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          min-width: 18px;
          height: 18px;
          background: #2563eb;
          color: #fff;
          font-size: 11px;
          font-weight: 600;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
        }

        .action-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          min-width: 16px;
          height: 16px;
          background: #ef4444;
          color: #fff;
          font-size: 10px;
          font-weight: 600;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-menu-container {
          position: relative;
        }

        .user-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          width: 220px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          overflow: hidden;
          z-index: 1001;
        }

        .user-dropdown-header {
          padding: 16px;
          background: #f9fafb;
        }

        .user-name {
          font-weight: 600;
          color: #1f2937;
        }

        .user-email {
          font-size: 13px;
          color: #6b7280;
          margin-top: 2px;
        }

        .user-dropdown-divider {
          height: 1px;
          background: #e5e7eb;
        }

        .user-dropdown-item {
          display: block;
          padding: 12px 16px;
          font-size: 14px;
          color: #374151;
          text-decoration: none;
          transition: background 0.2s;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }

        .user-dropdown-item:hover {
          background: #f3f4f6;
        }

        .user-dropdown-item.logout {
          color: #ef4444;
        }

        .mobile-menu-toggle {
          display: none;
        }

        .header-nav {
          border-top: 1px solid #e5e7eb;
          overflow: hidden;
        }

        .nav-list {
          display: flex;
          gap: 8px;
          padding: 12px 0;
          list-style: none;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          border-radius: 6px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .nav-link:hover {
          background: #f3f4f6;
          color: #2563eb;
        }

        @media (max-width: 768px) {
          .header-search {
            display: none;
          }

          .mobile-menu-toggle {
            display: flex;
          }

          .header-nav {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #fff;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          }

          .header-nav.open {
            display: block;
          }

          .nav-list {
            flex-direction: column;
            padding: 16px;
          }

          .nav-link {
            padding: 12px 16px;
          }
        }
      `}</style>
    </header>
  );
}

export default Header;
