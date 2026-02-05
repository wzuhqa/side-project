import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiSearch, FiEye, FiCheck, FiX } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.getAllOrders({ limit: 100 });
      setOrders(response.data.data || []);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.updateOrderStatus(id, status);
      toast.success('Order status updated');
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredOrders = orders.filter(o => 
    filter === 'all' || o.status === filter
  );

  return (
    <>
      <Helmet>
        <title>Orders - Admin</title>
      </Helmet>

      <div className="admin-page">
        <h1 className="page-title">Orders</h1>

        <div className="filters">
          {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
            <button
              key={status}
              className={`filter-btn ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order._id}>
                    <td className="order-number">{order.orderNumber}</td>
                    <td>
                      {order.user?.firstName} {order.user?.lastName}
                      <br />
                      <span className="email">{order.user?.email}</span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="total">${order.pricing?.total?.toFixed(2)}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        className={`status-select ${order.status}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <button className="action-btn">
                        <FiEye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <style jsx>{`
          .admin-page {
            padding: 24px;
          }

          .page-title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 24px;
          }

          .filters {
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

          .table-container {
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }

          .admin-table {
            width: 100%;
            border-collapse: collapse;
          }

          .admin-table th,
          .admin-table td {
            padding: 16px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }

          .admin-table th {
            background: #f9fafb;
            font-weight: 600;
            font-size: 14px;
          }

          .order-number {
            font-weight: 600;
          }

          .email {
            font-size: 13px;
            color: #6b7280;
          }

          .total {
            font-weight: 600;
          }

          .status-select {
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 13px;
            border: 1px solid #e5e7eb;
            cursor: pointer;
          }

          .status-select.pending { background: #fef3c7; color: #f59e0b; }
          .status-select.confirmed { background: #dbeafe; color: #3b82f6; }
          .status-select.processing { background: #e9d5ff; color: #8b5cf6; }
          .status-select.shipped { background: #cffafe; color: #06b6d4; }
          .status-select.delivered { background: #d1fae5; color: #10b981; }
          .status-select.cancelled { background: #fee2e2; color: #ef4444; }

          .action-btn {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #eff6ff;
            color: #2563eb;
            border-radius: 6px;
          }
        `}</style>
      </div>
    </>
  );
}

export default AdminOrders;
