import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiTruck, FiPackage, FiClock, FiMapPin, FiExternalLink } from 'react-icons/fi';

const ORDER_STATUSES = [
  { key: 'pending', label: 'Order Placed', icon: FiClock, description: 'Your order has been received' },
  { key: 'confirmed', label: 'Confirmed', icon: FiCheck, description: 'Order confirmed by seller' },
  { key: 'processing', label: 'Processing', icon: FiPackage, description: 'Being prepared for shipment' },
  { key: 'shipped', label: 'Shipped', icon: FiTruck, description: 'On its way to you' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: FiMapPin, description: 'Arriving today' },
  { key: 'delivered', label: 'Delivered', icon: FiCheck, description: 'Successfully delivered' }
];

const STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  processing: '#8b5cf6',
  shipped: '#06b6d4',
  out_for_delivery: '#10b981',
  delivered: '#10b981',
  cancelled: '#ef4444',
  refunded: '#64748b'
};

function OrderTimeline({ order, compact = false }) {
  const currentStatus = order?.status || 'pending';
  const timeline = order?.timeline || [];
  const currentIndex = ORDER_STATUSES.findIndex(s => s.key === currentStatus);

  if (compact) {
    return (
      <div className="timeline-compact">
        <div className="timeline-progress-mini">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / ORDER_STATUSES.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <span className="current-status" style={{ color: STATUS_COLORS[currentStatus] }}>
          {ORDER_STATUSES[currentIndex]?.label || currentStatus}
        </span>
      </div>
    );
  }

  return (
    <div className="order-timeline">
      {/* Progress Bar */}
      <div className="timeline-progress">
        <motion.div
          className="progress-bar"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / ORDER_STATUSES.length) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ backgroundColor: STATUS_COLORS[currentStatus] }}
        />
      </div>

      {/* Status Steps */}
      <div className="timeline-steps">
        {ORDER_STATUSES.map((status, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const statusEntry = timeline?.find(t => t.status === status.key);
          
          const StatusIcon = status.icon;
          
          return (
            <motion.div
              key={status.key}
              className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className="step-icon"
                style={{
                  backgroundColor: isCompleted ? STATUS_COLORS[status.key] : '#e2e8f0',
                  color: isCompleted ? '#ffffff' : '#94a3b8'
                }}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <StatusIcon size={20} />
                  </motion.div>
                ) : (
                  <span className="step-number">{index + 1}</span>
                )}
              </div>

              <div className="step-content">
                <span className="step-label">{status.label}</span>
                {statusEntry?.timestamp && (
                  <span className="step-date">
                    {new Date(statusEntry.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                )}
                {statusEntry?.message && (
                  <span className="step-message">{statusEntry.message}</span>
                )}
              </div>

              {/* Connector Line */}
              {index < ORDER_STATUSES.length - 1 && (
                <div
                  className="step-connector"
                  style={{
                    backgroundColor: index < currentIndex ? STATUS_COLORS[status.key] : '#e2e8f0'
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Tracking Info */}
      {order?.tracking && (currentStatus === 'shipped' || currentStatus === 'out_for_delivery') && (
        <motion.div
          className="tracking-info-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="tracking-header">
            <FiTruck size={20} />
            <span>Tracking Number</span>
          </div>
          <div className="tracking-number">
            <strong>{order.tracking.number}</strong>
            <span className="carrier">{order.tracking.carrier}</span>
          </div>
          {order.tracking.url && (
            <motion.a
              href={order.tracking.url}
              target="_blank"
              rel="noopener noreferrer"
              className="track-link"
              whileHover={{ x: 4 }}
            >
              Track on {order.tracking.carrier} <FiExternalLink size={12} />
            </motion.a>
          )}
        </motion.div>
      )}

      {/* Estimated Delivery */}
      {order?.estimatedDelivery && (
        <motion.div
          className="estimated-delivery"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <FiClock size={18} />
          <span>
            Estimated Delivery: <strong>
              {new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </strong>
          </span>
        </motion.div>
      )}
    </div>
  );
}

export default OrderTimeline;
