const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');
const nodemailer = require('nodemailer');

// @route   GET /api/orders
// @desc    Get user orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { user: req.user.id };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { shippingAddress, billingAddress, paymentMethod, coupon } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name price images quantity');

    if (!cart || cart.items.filter(i => !i.savedForLater).length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Validate items and prices
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      if (item.savedForLater) continue;

      const product = item.product;
      
      // Check product exists and is active
      if (!product || product.status !== 'active') {
        return res.status(400).json({ 
          success: false, 
          message: `Product ${product?.name || 'not found'} is no longer available` 
        });
      }

      // Check stock
      if (product.quantity < item.quantity && !product.allowBackorders) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${product.name}` 
        });
      }

      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        variant: item.variant,
        price: item.price,
        quantity: item.quantity,
        total: itemTotal,
        image: product.images[0]?.url
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon?.code) {
      // Validate coupon (simplified - in production, use proper coupon logic)
      if (coupon.type === 'percentage') {
        discount = (subtotal * coupon.discount) / 100;
      } else {
        discount = coupon.discount;
      }
    }

    // Calculate total
    const shipping = 0; // Calculate based on shipping method
    const tax = 0; // Calculate based on tax rates
    const total = subtotal + shipping + tax - discount;

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod: {
        type: paymentMethod.type || 'credit_card'
      },
      pricing: {
        subtotal,
        shipping,
        tax,
        discount,
        total,
        currency: 'USD'
      },
      coupon: coupon || undefined,
      timeline: [{
        status: 'pending',
        message: 'Order placed successfully'
      }]
    });

    // Update product quantities
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { 
          quantity: -item.quantity,
          totalSold: item.quantity
        }
      });
    }

    // Clear cart
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: [], coupon: null, subtotal: 0, discount: 0, total: 0 }
    );

    // Send order confirmation email
    await sendOrderConfirmationEmail(order, req.user);

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order cannot be cancelled at this stage' 
      });
    }

    // Restore product quantities
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { 
          quantity: item.quantity,
          totalSold: -item.quantity
        }
      });
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.timeline.push({
      status: 'cancelled',
      message: 'Order cancelled by customer'
    });

    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (admin)
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, tracking, notes } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    
    if (tracking) {
      order.tracking = tracking;
    }
    
    if (notes) {
      order.internalNotes = notes;
    }

    // Update timeline
    order.timeline.push({
      status,
      message: `Order ${status}`
    });

    // Set specific timestamps
    if (status === 'shipped') {
      order.shippedAt = new Date();
    } else if (status === 'delivered') {
      order.deliveredAt = new Date();
    } else if (status === 'refunded') {
      order.refundedAt = new Date();
    }

    await order.save();

    // Send status update email
    await sendStatusUpdateEmail(order);

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper function to send order confirmation email
async function sendOrderConfirmationEmail(order, user) {
  // In production, use a real email service
  console.log(`Order confirmation email sent to ${user.email} for order ${order.orderNumber}`);
}

// Helper function to send status update email
async function sendStatusUpdateEmail(order) {
  const user = await require('../models/User').findById(order.user);
  if (user) {
    console.log(`Status update email sent to ${user.email} for order ${order.orderNumber}`);
  }
}

module.exports = router;
