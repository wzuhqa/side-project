const jwt = require('jsonwebtoken');

class NotificationService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
    this.userSockets = new Map(); // userId -> Set of socket ids
  }

  initialize(server) {
    const { Server } = require('socket.io');
    
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.userId}`);
      this.handleConnection(socket);
    });

    console.log('WebSocket server initialized');
  }

  handleConnection(socket) {
    // Add to user sockets map
    if (!this.userSockets.has(socket.userId)) {
      this.userSockets.set(socket.userId, new Set());
    }
    this.userSockets.get(socket.userId).add(socket.id);

    // Join user's room
    socket.join(`user:${socket.userId}`);

    // Join role-based rooms
    if (socket.userRole === 'admin') {
      socket.join('admin');
    }

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      const userSocketSet = this.userSockets.get(socket.userId);
      if (userSocketSet) {
        userSocketSet.delete(socket.id);
        if (userSocketSet.size === 0) {
          this.userSockets.delete(socket.userId);
        }
      }
    });

    // Subscribe to order updates
    socket.on('subscribe:order', (orderId) => {
      socket.join(`order:${orderId}`);
      console.log(`User ${socket.userId} subscribed to order ${orderId}`);
    });

    // Unsubscribe from order updates
    socket.on('unsubscribe:order', (orderId) => {
      socket.leave(`order:${orderId}`);
    });

    // Subscribe to product updates
    socket.on('subscribe:product', (productId) => {
      socket.join(`product:${productId}`);
    });

    // Mark notification as read
    socket.on('notification:read', (notificationId) => {
      // Update notification in database
      // await Notification.findByIdAndUpdate(notificationId, { read: true });
    });

    // Get unread notifications count
    socket.on('notifications:count', async () => {
      // const count = await Notification.countDocuments({ user: socket.userId, read: false });
      // socket.emit('notifications:count', { count });
    });
  }

  // Send notification to specific user
  sendToUser(userId, event, data) {
    if (!this.io) return;
    
    this.io.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  // Send notification to multiple users
  sendToUsers(userIds, event, data) {
    if (!this.io) return;
    
    userIds.forEach(userId => {
      this.sendToUser(userId, event, data);
    });
  }

  // Broadcast to all connected users
  broadcast(event, data) {
    if (!this.io) return;
    
    this.io.emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  // Send to admin users
  sendToAdmins(event, data) {
    if (!this.io) return;
    
    this.io.to('admin').emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  // Order status update notification
  notifyOrderStatus(orderId, status, timeline) {
    this.io.to(`order:${orderId}`).emit('order:status', {
      orderId,
      status,
      timeline,
      timestamp: new Date().toISOString()
    });
  }

  // New message in support ticket
  notifyTicketMessage(ticketId, message) {
    this.sendToUser(message.sender, 'ticket:message', {
      ticketId,
      message,
      type: 'outbound'
    });

    // Notify assigned admin if any
    if (message.assignedTo) {
      this.sendToUser(message.assignedTo, 'ticket:message', {
        ticketId,
        message,
        type: 'inbound'
      });
    }
  }

  // Price drop alert
  notifyPriceDrop(userId, product, newPrice, targetPrice) {
    this.sendToUser(userId, 'price:drop', {
      type: 'price_alert',
      product: {
        id: product._id,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0]?.url
      },
      newPrice,
      targetPrice,
      message: `Price dropped to $${newPrice}!`
    });
  }

  // Stock availability notification
  notifyStockAvailable(userId, product) {
    this.sendToUser(userId, 'stock:available', {
      type: 'stock_alert',
      product: {
        id: product._id,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0]?.url
      },
      message: `${product.name} is back in stock!`
    });
  }

  // New order notification (admin)
  notifyNewOrder(order) {
    this.sendToAdmins('order:new', {
      type: 'new_order',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        total: order.pricing?.total,
        customerName: order.shippingAddress?.firstName
      },
      message: `New order #${order.orderNumber}`
    });
  }

  // Low stock notification (admin)
  notifyLowStock(product) {
    this.sendToAdmins('product:low_stock', {
      type: 'low_stock_alert',
      product: {
        id: product._id,
        name: product.name,
        sku: product.sku,
        quantity: product.quantity
      },
      message: `Low stock alert: ${product.name} (${product.quantity} left)`
    });
  }

  // New review notification (admin)
  notifyNewReview(product, review) {
    this.sendToAdmins('review:new', {
      type: 'new_review',
      product: {
        id: product._id,
        name: product.name
      },
      review: {
        rating: review.rating,
        customerName: review.user?.firstName
      },
      message: `New ${review.rating}-star review for ${product.name}`
    });
  }
}

module.exports = new NotificationService();
