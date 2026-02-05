import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiDollarSign, FiShoppingBag, FiUsers, FiTrendingUp, FiPackage } from 'react-icons/fi';
import api from '../../utils/api';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.getDashboard();
      setStats(response.data.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading"><div className="spinner"></div></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats?.sales?.allTime?.total?.toFixed(2) || '0'}`,
      change: '+12%',
      icon: FiDollarSign,
      color: '#10b981'
    },
    {
      title: 'Orders',
      value: stats?.sales?.allTime?.count || 0,
      change: '+8%',
      icon: FiShoppingBag,
      color: '#3b82f6'
    },
    {
      title: 'Customers',
      value: stats?.customers?.total || 0,
      change: '+23%',
      icon: FiUsers,
      color: '#8b5cf6'
    },
    {
      title: 'Low Stock',
      value: stats?.lowStock?.length || 0,
      change: 'Alert',
      icon: FiPackage,
      color: '#f59e0b'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - Admin</title>
      </Helmet>

      <div className="admin-dashboard">
        <h1 className="admin-title">Dashboard</h1>

        {/* Stats Grid */}
        <div className="stats-grid">
          {statCards.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                <stat.icon size={24} />
              </div>
              <div className="stat-content">
                <p className="stat-title">{stat.title}</p>
                <p className="stat-value">{stat.value}</p>
                <p className="stat-change" style={{ color: stat.change.includes('+') ? '#10b981' : '#f59e0b' }}>
                  <FiTrendingUp size={14} />
                  {stat.change}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-grid">
          {/* Recent Orders */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Recent Orders</h2>
              <Link to="/admin/orders" className="view-all">View All</Link>
            </div>
            <div className="orders-list">
              {stats?.recentOrders?.map(order => (
                <div key={order._id} className="order-item">
                  <div className="order-info">
                    <p className="order-number">{order.orderNumber}</p>
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge ${order.status}`}>{order.status}</span>
                    <p className="order-total">${order.pricing?.total?.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Top Products</h2>
              <Link to="/admin/products" className="view-all">View All</Link>
            </div>
            <div className="products-list">
              {stats?.topProducts?.map(product => (
                <div key={product._id} className="product-item">
                  <img src={product.images?.[0]?.url || '/placeholder.jpg'} alt={product.name} />
                  <div className="product-info">
                    <p className="product-name">{product.name}</p>
                    <p className="product-sold">{product.totalSold} sold</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-dashboard {
          padding: 24px;
        }

        .admin-title {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 24px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: #fff;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          gap: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-title {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .stat-change {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .dashboard-card {
          background: #fff;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .card-header h2 {
          font-size: 18px;
          font-weight: 600;
        }

        .view-all {
          font-size: 14px;
          color: #2563eb;
        }

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .order-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .order-number {
          font-weight: 600;
        }

        .order-date {
          font-size: 13px;
          color: #6b7280;
        }

        .order-status {
          text-align: right;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
          background: #e5e7eb;
          color: #6b7280;
        }

        .status-badge.pending { background: #fef3c7; color: #f59e0b; }
        .status-badge.confirmed { background: #dbeafe; color: #3b82f6; }
        .status-badge.shipped { background: #cffafe; color: #06b6d4; }
        .status-badge.delivered { background: #d1fae5; color: #10b981; }

        .order-total {
          font-weight: 600;
          margin-top: 4px;
        }

        .products-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .product-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .product-item img {
          width: 48px;
          height: 48px;
          object-fit: cover;
          border-radius: 8px;
        }

        .product-name {
          font-weight: 500;
          margin-bottom: 2px;
        }

        .product-sold {
          font-size: 13px;
          color: #6b7280;
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}

export default AdminDashboard;
