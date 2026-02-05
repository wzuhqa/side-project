import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (isAuthenticated && user) {
      initializeSocket();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  const initializeSocket = () => {
    const token = localStorage.getItem('token');
    
    // Dynamic import for socket.io-client
    import('socket.io-client').then(({ io }) => {
      const socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:5000', {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('WebSocket connected');
        setConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        setConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
      });

      // Order status updates
      socket.on('order:status', (data) => {
        handleNotification({
          type: 'order_status',
          title: 'Order Update',
          message: `Order #${data.orderId} is now ${data.status}`,
          data
        });
      });

      // Price drop alerts
      socket.on('price:drop', (data) => {
        handleNotification({
          type: 'price_alert',
          title: 'Price Drop!',
          message: data.message,
          data
        });
        
        toast.success(`💰 ${data.message}`, {
          duration: 5000,
          icon: '💰'
        });
      });

      // Stock availability
      socket.on('stock:available', (data) => {
        handleNotification({
          type: 'stock_alert',
          title: 'Back in Stock!',
          message: data.message,
          data
        });
        
        toast.success(`📦 ${data.message}`, {
          duration: 5000,
          icon: '📦'
        });
      });

      // Ticket messages
      socket.on('ticket:message', (data) => {
        handleNotification({
          type: 'support',
          title: 'Support Update',
          message: data.message?.message || 'New message in your support ticket',
          data
        });
      });

      // Generic notifications
      socket.on('notification', (data) => {
        handleNotification(data);
      });
    });
  };

  const handleNotification = useCallback((notification) => {
    setNotifications(prev => [
      {
        ...notification,
        id: Date.now().toString(),
        read: false,
        timestamp: new Date().toISOString()
      },
      ...prev.slice(0, 49) // Keep last 50 notifications
    ]);
    
    setUnreadCount(prev => prev + 1);
  }, []);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const subscribeToOrder = useCallback((orderId) => {
    if (socketRef.current) {
      socketRef.current.emit('subscribe:order', orderId);
    }
  }, []);

  const unsubscribeFromOrder = useCallback((orderId) => {
    if (socketRef.current) {
      socketRef.current.emit('unsubscribe:order', orderId);
    }
  }, []);

  const subscribeToProduct = useCallback((productId) => {
    if (socketRef.current) {
      socketRef.current.emit('subscribe:product', productId);
    }
  }, []);

  const value = {
    notifications,
    unreadCount,
    connected,
    loading,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    subscribeToOrder,
    unsubscribeFromOrder,
    subscribeToProduct
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
