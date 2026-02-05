import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FiPackage, FiHeart, FiMapPin, FiCreditCard, FiSettings, FiBell,
  FiClock, FiTrendingUp, FiShoppingBag, FiArrowRight, FiHelpCircle
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../utils/api';

function AccountDashboard() {
  const { user } = useAuth();
  const { getCartCount } = useCart();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, statsRes] = await Promise.all([
        api.get('/orders', { params: { limit: 3 } }),
        api.get('/users/me')
      ]);
      
      setRecentOrders(ordersRes.data.data || []);
      setStats({
        ordersCount: ordersRes.data.pagination?.total || 0,
        wishlistCount: statsRes.data.data?.wishlist?.length || 0,
        addressesCount: statsRes.data.data?.addresses?.length || 0
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      icon: FiPackage,
      label: 'Orders',
      description: 'Track and manage your orders',
      link: '/account/orders',
      badge: stats?.ordersCount || 0,
      color: '#3b82f6'
    },
    {
      icon: FiHeart,
      label: 'Wishlist',
      description: 'Products you love',
      link: '/account/wishlist',
      badge: stats?.wishlistCount || 0,
      color: '#ef4444'
    },
    {
      icon: FiMapPin,
      label: 'Addresses',
      description: 'Manage shipping addresses',
      link: '/account/addresses',
      badge: stats?.addressesCount || 0,
      color: '#10b981'
    },
    {
      icon: FiCreditCard,
      label: 'Payment Methods',
      description: 'Manage payment options',
      link: '/account/payment-methods',
      badge: null,
      color: '#8b5cf6'
    },
    {
      icon: FiBell,
      label: 'Notifications',
      description: 'Email and SMS preferences',
      link: '/account/notifications',
      badge: null,
      color: '#f59e0b'
    },
    {
      icon: FiHelpCircle,
      label: 'Support',
      description: 'Get help with orders',
      link: '/support',
      badge: null,
      color: '#06b6d4'
    }
  ];

  const quickStats = [
    { 
      icon: FiShoppingBag, 
      value: stats?.ordersCount || 0, 
      label: 'Total Orders',
      color: '#3b82f6' 
    },
    { 
      icon: FiHeart, 
      value: stats?.wishlistCount || 0, 
      label: 'Wishlist Items',
      color: '#ef4444' 
    },
    { 
      icon: FiClock, 
      value: recentOrders.filter(o => o.status === 'processing').length, 
      label: 'In Progress',
      color: '#f59e0b' 
    },
    { 
      icon: FiTrendingUp, 
      value: '$0', 
      label: 'Total Spent',
      color: '#10b981' 
    }
  ];

  return (
    <>
      <Helmet>
        <title>My Account - ShopNow</title>
      </Helmet>

      <motion.div
        className="account-dashboard"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="dashboard-header">
          <div className="welcome-section">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Welcome back, {user?.firstName}! 👋
            </motion.h1>
            <p>Manage your account and track your orders</p>
          </div>

          {/* Quick Stats */}
          <div className="quick-stats">
            {quickStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                  <stat.icon size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Recent Orders */}
          <motion.div
            className="dashboard-card recent-orders"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="card-header">
              <h2><FiPackage /> Recent Orders</h2>
              <Link to="/account/orders" className="view-all">
                View All <FiArrowRight />
              </Link>
            </div>
            
            <div className="orders-list">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <motion.div
                    key={order._id}
                    className="order-item"
                    whileHover={{ x: 4 }}
                  >
                    <div className="order-info">
                      <span className="order-number">#{order.orderNumber}</span>
                      <span className="order-date">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="order-meta">
                      <span className={`status-badge ${order.status}`}>
                        {order.status}
                      </span>
                      <span className="order-total">
                        ${order.pricing?.total?.toFixed(2)}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="empty-state-small">
                  <FiPackage size={40} />
                  <p>No orders yet</p>
                  <Link to="/shop" className="btn btn-primary btn-sm">
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Menu Grid */}
          <div className="menu-grid">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <Link to={item.link} className="menu-card">
                  <motion.div
                    className="menu-icon"
                    style={{ backgroundColor: `${item.color}15`, color: item.color }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <item.icon size={24} />
                  </motion.div>
                  
                  <div className="menu-content">
                    <h3>
                      {item.label}
                      {item.badge > 0 && (
                        <span className="badge">{item.badge}</span>
                      )}
                    </h3>
                    <p>{item.description}</p>
                  </div>
                  
                  <motion.div
                    className="menu-arrow"
                    whileHover={{ x: 4 }}
                  >
                    <FiArrowRight />
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Promotional Banner */}
        <motion.div
          className="promo-banner"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="promo-content">
            <h3>🎉 Special Offer!</h3>
            <p>Get 10% off your next order with code <strong>WELCOME10</strong></p>
          </div>
          <motion.button
            className="btn btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Shop Now
          </motion.button>
        </motion.div>
      </motion.div>
    </>
  );
}

export default AccountDashboard;
