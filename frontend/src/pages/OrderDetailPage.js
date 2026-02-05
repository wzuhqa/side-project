import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiArrowLeft, FiPackage, FiMapPin, FiCreditCard, FiCheck } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';

function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await api.getOrder(id);
      setOrder(response.data.data);
    } catch (err) {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      await api.cancelOrder(id);
      toast.success('Order cancelled');
      fetchOrder();
    } catch (err) {
      toast.error('Failed to cancel order');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading"><div className="spinner"></div></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>Order not found</h2>
          <Link to="/account/orders" className="btn btn-primary">Back to Orders</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Order {order.orderNumber} - ShopNow</title>
      </Helmet>

      <div className="order-detail-page">
        <div className="container">
          <Link to="/account/orders" className="back-link">
            <FiArrowLeft size={18} />
            Back to Orders
          </Link>

          <div className="order-header">
            <div>
              <h1>Order #{order.orderNumber}</h1>
              <p className="order-date">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="order-actions">
              {['pending', 'confirmed'].includes(order.status) && (
                <button onClick={handleCancelOrder} className="btn btn-secondary">
                  Cancel Order
                </button>
              )}
            </div>
          </div>

          {/* Order Status */}
          <div className="status-card">
            <div className="status-steps">
              {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((status, index) => {
                const statusIndex = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'].indexOf(order.status);
                const isActive = index <= statusIndex;
                const isCurrent = order.status === status;
                
                return (
                  <div key={status} className={`status-step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}>
                    <div className="step-icon">
                      {isActive ? <FiCheck size={16} /> : <FiPackage size={16} />}
                    </div>
                    <span className="step-label">{status}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="order-grid">
            {/* Order Items */}
            <div className="order-items-section">
              <h2>Order Items</h2>
              <div className="items-list">
                {order.items?.map((item, index) => (
                  <div key={index} className="order-item">
                    <img src={item.image || '/placeholder.jpg'} alt={item.name} />
                    <div className="item-info">
                      <Link to={`/product/${item.product?.slug}`} className="item-name">
                        {item.name}
                      </Link>
                      <p className="item-qty">Qty: {item.quantity}</p>
                      <p className="item-price">${item.price?.toFixed(2)}</p>
                    </div>
                    <div className="item-total">
                      ${item.total?.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="order-summary-section">
              <h2>Order Summary</h2>
              <div className="summary-totals">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${order.pricing?.subtotal?.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>${order.pricing?.shipping?.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Tax</span>
                  <span>${order.pricing?.tax?.toFixed(2)}</span>
                </div>
                {order.pricing?.discount > 0 && (
                  <div className="summary-row discount">
                    <span>Discount</span>
                    <span>-${order.pricing?.discount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="summary-total">
                  <span>Total</span>
                  <span>${order.pricing?.total?.toFixed(2)}</span>
                </div>
              </div>

              <h3>Shipping Address</h3>
              <div className="address-info">
                <p>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                <p>{order.shippingAddress?.address1}</p>
                {order.shippingAddress?.address2 && <p>{order.shippingAddress?.address2}</p>}
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
              </div>

              <h3>Payment Method</h3>
              <div className="payment-info">
                <FiCreditCard size={18} />
                <span>{order.paymentMethod?.type?.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .order-detail-page {
            padding: 40px 0;
            background: #f9fafb;
            min-height: 80vh;
          }

          .back-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #6b7280;
            margin-bottom: 24px;
          }

          .order-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 24px;
          }

          .order-header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 4px;
          }

          .order-date {
            color: #6b7280;
          }

          .status-card {
            background: #fff;
            border-radius: 12px;
            padding: 32px;
            margin-bottom: 24px;
          }

          .status-steps {
            display: flex;
            justify-content: space-between;
          }

          .status-step {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            flex: 1;
          }

          .step-icon {
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f3f4f6;
            border-radius: 50%;
            color: #9ca3af;
          }

          .status-step.active .step-icon {
            background: #2563eb;
            color: #fff;
          }

          .status-step.current .step-icon {
            background: #2563eb;
            color: #fff;
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
          }

          .step-label {
            font-size: 14px;
            font-weight: 500;
            color: #9ca3af;
          }

          .status-step.active .step-label {
            color: #1f2937;
          }

          .order-grid {
            display: grid;
            grid-template-columns: 1fr 380px;
            gap: 24px;
          }

          .order-items-section,
          .order-summary-section {
            background: #fff;
            border-radius: 12px;
            padding: 24px;
          }

          .order-items-section h2,
          .order-summary-section h2,
          .order-summary-section h3 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
          }

          .order-summary-section h3 {
            font-size: 16px;
            margin-top: 24px;
          }

          .items-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .order-item {
            display: flex;
            gap: 16px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e5e7eb;
          }

          .order-item img {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 8px;
          }

          .item-info {
            flex: 1;
          }

          .item-name {
            font-weight: 500;
            margin-bottom: 4px;
          }

          .item-qty,
          .item-price {
            font-size: 14px;
            color: #6b7280;
          }

          .item-total {
            font-weight: 600;
          }

          .summary-totals {
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 16px;
            margin-bottom: 16px;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 14px;
          }

          .summary-row.discount {
            color: #10b981;
          }

          .summary-total {
            display: flex;
            justify-content: space-between;
            font-size: 18px;
            font-weight: 700;
          }

          .address-info {
            font-size: 14px;
            color: #4b5563;
            line-height: 1.6;
          }

          .payment-info {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
          }

          @media (max-width: 1024px) {
            .order-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </>
  );
}

export default OrderDetailPage;
