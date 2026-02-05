const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @route   GET /api/cart
// @desc    Get user cart
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name slug price images quantity status');

    if (!cart) {
      return res.json({ success: true, data: { items: [], subtotal: 0, discount: 0, total: 0 } });
    }

    // Filter out unavailable products
    const validItems = cart.items.filter(item => {
      const product = item.product;
      if (!product || product.status !== 'active') return false;
      return true;
    });

    // Update cart if items were removed
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/cart/items
// @desc    Add item to cart
// @access  Private
router.post('/items', protect, async (req, res) => {
  try {
    const { productId, quantity = 1, variant } = req.body;

    // Validate product
    const product = await Product.findById(productId);
    if (!product || product.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check stock
    if (product.quantity < quantity && !product.allowBackorders) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && 
              JSON.stringify(item.variant) === JSON.stringify(variant)
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        variant,
        price: variant?.price || product.price,
        addedAt: new Date()
      });
    }

    await cart.save();

    // Repopulate cart
    cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name slug price images quantity');

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/cart/items/:itemId
// @desc    Update cart item quantity
// @access  Private
router.put('/items/:itemId', protect, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Validate stock
    const product = await Product.findById(item.product);
    if (product.quantity < quantity && !product.allowBackorders) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    item.quantity = quantity;
    await cart.save();

    // Repopulate cart
    cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name slug price images quantity');

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/cart/items/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/items/:itemId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items.pull(req.params.itemId);
    await cart.save();

    // Repopulate cart
    cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name slug price images quantity');

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/cart/save-for-later/:itemId
// @desc    Save item for later
// @access  Private
router.post('/save-for-later/:itemId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    item.savedForLater = !item.savedForLater;
    await cart.save();

    // Repopulate cart
    cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name slug price images quantity');

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/cart/move-to-cart/:itemId
// @desc    Move saved item back to cart
// @access  Private
router.post('/move-to-cart/:itemId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    item.savedForLater = false;
    await cart.save();

    // Repopulate cart
    cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name slug price images quantity');

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/cart/saved-for-later
// @desc    Get saved for later items
// @access  Private
router.get('/saved-for-later', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name slug price images ratings');

    if (!cart) {
      return res.json({ success: true, data: [] });
    }

    const savedItems = cart.items.filter(item => item.savedForLater);

    res.json({ success: true, data: savedItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/cart/apply-coupon
// @desc    Apply coupon code
// @access  Private
router.post('/apply-coupon', protect, async (req, res) => {
  try {
    const { code, discount, type, minPurchase, maxDiscount } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    // Validate coupon
    if (minPurchase && cart.subtotal < minPurchase) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum purchase of $${minPurchase} required` 
      });
    }

    cart.coupon = { code, discount, type, minPurchase, maxDiscount };
    await cart.save();

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/cart/coupon
// @desc    Remove coupon
// @access  Private
router.delete('/coupon', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.coupon = null;
    await cart.save();

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/cart
// @desc    Clear cart
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: [], coupon: null, subtotal: 0, discount: 0, total: 0 }
    );

    res.json({ success: true, message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
