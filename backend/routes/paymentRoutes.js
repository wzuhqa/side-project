const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const stripeService = require('../utils/stripe');

// @route   POST /api/payments/create-intent
// @desc    Create payment intent for order
// @access  Private
router.post('/create-intent', protect, async (req, res) => {
  try {
    const { orderId } = req.body;

    // Get user's cart or specified order
    let order;
    if (orderId) {
      order = await Order.findOne({ _id: orderId, user: req.user.id });
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
    } else {
      // Create new order from cart
      const cart = await Cart.findOne({ user: req.user.id })
        .populate('items.product', 'name price images quantity');

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cart is empty'
        });
      }

      // Validate stock
      for (const item of cart.items) {
        if (item.product.quantity < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${item.product.name}`
          });
        }
      }

      // Calculate totals
      const subtotal = cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
      );
      const shipping = 0;
      const tax = 0;
      const total = subtotal + shipping + tax - (cart.discount || 0);

      order = await Order.create({
        user: req.user.id,
        items: cart.items.map(item => ({
          product: item.product._id,
          name: item.product.name,
          price: item.price,
          quantity: item.quantity,
          image: item.product.images[0]?.url
        })),
        pricing: {
          subtotal,
          shipping,
          tax,
          discount: cart.discount || 0,
          total,
          currency: 'USD'
        },
        paymentMethod: { type: 'stripe' },
        status: 'pending',
        timeline: [{ status: 'pending', message: 'Order created' }]
      });

      // Update stock
      for (const item of cart.items) {
        await Product.findByIdAndUpdate(item.product._id, {
          $inc: { quantity: -item.quantity, totalSold: item.quantity }
        });
      }

      // Clear cart
      await Cart.findByIdAndUpdate(cart._id, { items: [], discount: 0 });
    }

    // Get or create Stripe customer
    let customerId = null;
    const user = await User.findById(req.user.id);
    if (user.stripeCustomerId) {
      customerId = user.stripeCustomerId;
    } else {
      const customer = await stripeService.createCustomer(user);
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    // Create payment intent
    const { clientSecret, paymentIntentId } = await stripeService.createPaymentIntent(
      order,
      customerId
    );

    // Update order with payment intent
    order.paymentIntentId = paymentIntentId;
    order.paymentMethod = { type: 'stripe', id: paymentIntentId };
    await order.save();

    res.json({
      success: true,
      data: {
        clientSecret,
        orderId: order._id,
        orderNumber: order.orderNumber,
        amount: order.pricing.total
      }
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent'
    });
  }
});

// @route   POST /api/payments/confirm
// @desc    Confirm payment and update order status
// @access  Private
router.post('/confirm', protect, async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;

    const order = await Order.findOne({ _id: orderId, user: req.user.id });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify payment with Stripe
    const paymentIntent = await stripeService.confirmPayment(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      order.status = 'confirmed';
      order.paymentStatus = 'paid';
      order.timeline.push({
        status: 'confirmed',
        message: 'Payment confirmed',
        timestamp: new Date()
      });
      await order.save();

      // Send confirmation email
      // await sendOrderConfirmationEmail(order, req.user);

      res.json({
        success: true,
        data: order,
        message: 'Payment confirmed successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not successful',
        status: paymentIntent.status
      });
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment'
    });
  }
});

// @route   POST /api/payments/refund
// @desc    Request refund for order
// @access  Private
router.post('/refund', protect, async (req, res) => {
  try {
    const { orderId, reason, amount } = req.body;

    const order = await Order.findOne({ _id: orderId, user: req.user.id });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Order is not eligible for refund'
      });
    }

    if (!order.paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'No payment found for this order'
      });
    }

    // Create refund
    const refund = await stripeService.createRefund(
      order.paymentIntentId,
      amount || order.pricing.total,
      reason
    );

    // Update order
    order.status = 'refunded';
    order.refundStatus = 'refunded';
    order.refundAmount = refund.amount / 100;
    order.refundReason = reason;
    order.timeline.push({
      status: 'refunded',
      message: `Refund of $${refund.amount / 100} processed`,
      timestamp: new Date()
    });
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: item.quantity, totalSold: -item.quantity }
      });
    }

    res.json({
      success: true,
      data: order,
      message: 'Refund processed successfully'
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund'
    });
  }
});

// @route   GET /api/payments/methods
// @desc    Get saved payment methods
// @access  Private
router.get('/methods', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.stripeCustomerId) {
      return res.json({
        success: true,
        data: []
      });
    }

    const paymentMethods = await stripeService.listPaymentMethods(user.stripeCustomerId);

    res.json({
      success: true,
      data: paymentMethods.map(pm => ({
        id: pm.id,
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year
      }))
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment methods'
    });
  }
});

// @route   POST /api/payments/webhook
// @desc    Stripe webhook handler
// @access  Public (verified by signature)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripeService.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const { type, data } = await stripeService.handleWebhookEvent(event);

    switch (type) {
      case 'payment_success':
        const order = await Order.findOne({ 
          paymentIntentId: data.metadata?.orderId 
        });
        if (order && order.status === 'pending') {
          order.status = 'confirmed';
          order.paymentStatus = 'paid';
          order.timeline.push({
            status: 'confirmed',
            message: 'Payment confirmed via webhook',
            timestamp: new Date()
          });
          await order.save();
        }
        break;

      case 'payment_failed':
        // Handle failed payment
        console.log('Payment failed:', data.id);
        break;

      case 'refund':
        // Handle refund
        console.log('Refund processed:', data.id);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

module.exports = router;
