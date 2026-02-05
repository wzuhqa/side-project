import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiPackage, FiChevronRight, FiEye, FiX } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.getOrders({ limit: 50 });
      setOrders(response.data.data || []);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      processing: '#8b5cf6',
      shipped: '#06b6d4',
      delivered: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  return (
    <>
      <Helmet>
        <title>My Orders - ShopNow</title>
      </Helmet>

      <div className="orders-page">
        <div className="container">
          <h1 className="page-title">My Orders</h1>

          {/* Filters */}
          <div className="order-filters">
            {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
              <button
                key={status}
                className={`filter-btn ${filter === status ? 'active' : ''}`}
                onClick={() => setFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="empty-state">
              <FiPackage size={64} />
              <h2>No orders found</h2>
              <p>You haven't placed any orders yet.</p>
              <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
            </div>
          ) : (
            <div className="orders-list">
              {filteredOrders.map(order => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <span className="order-number">Order #{order.orderNumber}</span>
                      <span className="order-date">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="order-status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="order-items">
                    {order.items?.slice(0, 3).map((item, index) => (
                      <div key={index} className="order-item">
                        <img src={item.image || '/placeholder.jpg'} alt={item.name} />
                      </div>
                    ))}
                    {order.items?.length > 3 && (
                      <div className="more-items">+{order.items.length - 3} more</div>
                    )}
                  </div>

                  <div className="order-footer">
                    <div className="order-total">
                      <span>Total:</span>
                      <span className="total-amount">${order.pricing?.total?.toFixed(2)}</span>
                    </div>
                    <Link to={`/account/orders/${order._id}`} className="view-details-btn">
                      <FiEye size={18} />
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <style jsx>{`
          .orders-page {
            padding: 40px 0;
            background: #f9fafb;
            min-height: 80vh;
          }

          .page-title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 24px;
          }

          .order-filters {
            display: flex;
            gap: 8px;
            margin-bottom: 24px;
            flex-wrap: wrap;
          }

          .filter-btn {
            padding: 8px 16px;
            border: 1px solid #e5e7eb;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            background: #fff;
            transition: all 0.2s;
          }

          .filter-btn:hover {
            border-color: #2563eb;
            color: #2563eb;
          }

          .filter-btn.active {
            background: #2563eb;
            color: #fff;
            border-color: #2563eb;
          }

          .loading {
            display: flex;
            justify-content: center;
            padding: 60px;
          }

          .empty-state {
            text-align: center;
            padding: 80px 20px;
            background: #fff;
            border-radius: 12px;
          }

          .empty-state svg {
            color: #d1d5db;
            margin-bottom: 24px;
          }

          .empty-state h2 {
            margin-bottom: 8px;
          }

          .empty-state p {
            color: #6b7280;
            margin-bottom: 24px;
          }

          .orders-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .order-card {
            background: #fff;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          }

          .order-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
          }

          .order-info {
            display: flex;
            align-items: center;
            gap: 16px;
          }

          .order-number {
            font-weight: 600;
          }

          .order-date {
            color: #6b7280;
            font-size: 14px;
          }

          .status-badge {
            padding: 6px 12px;
            border-radius: 20px;
            color: #fff;
            font-size: 13px;
            font-weight: 500;
            text-transform: capitalize;
          }

          .order-items {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
          }

          .order-item img {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }

          .more-items {
            padding: 8px 16px;
            background: #f3f4f6;
            border-radius: 8px;
            font-size: 14px;
            color: #6b7280;
          }

          .order-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
          }

          .order-total {
            font-size: 14px;
          }

          .total-amount {
            font-size: 18px;
            font-weight: 700;
            margin-left: 8px;
          }

          .view-details-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.2s;
          }

          .view-details-btn:hover {
            border-color: #2563eb;
            color: #2563eb;
          }
        `}</style>
      </div>
    </>
  );
}

export default OrdersPage;
