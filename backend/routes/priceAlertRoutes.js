const express = require('express');
const router = express.Router();
const PriceAlert = require('../models/PriceAlert');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @route   POST /api/price-alerts
// @desc    Create a new price alert
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { productId, targetPrice, type = 'price_drop', expiresIn } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already has an alert for this product
    const existingAlert = await PriceAlert.findOne({
      user: req.user.id,
      product: productId,
      status: { $in: ['active', 'triggered'] }
    });

    if (existingAlert) {
      return res.status(400).json({
        success: false,
        message: 'You already have an alert for this product',
        existingAlert
      });
    }

    // Validate target price
    if (targetPrice >= product.price) {
      return res.status(400).json({
        success: false,
        message: 'Target price must be lower than current price'
      });
    }

    const alert = await PriceAlert.create({
      user: req.user.id,
      product: productId,
      targetPrice,
      currentPrice: product.price,
      type,
      expiresAt: expiresIn 
        ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000)
        : undefined
    });

    await alert.populate('product', 'name slug price images');

    res.status(201).json({
      success: true,
      data: alert,
      message: 'Price alert created successfully'
    });
  } catch (error) {
    console.error('Price alert creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create price alert'
    });
  }
});

// @route   GET /api/price-alerts
// @desc    Get all price alerts for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = { user: req.user.id };
    if (status) {
      query.status = status;
    }

    const [alerts, total] = await Promise.all([
      PriceAlert.find(query)
        .populate('product', 'name slug price compareAtPrice images ratings')
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      PriceAlert.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: alerts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get price alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch price alerts'
    });
  }
});

// @route   GET /api/price-alerts/:id
// @desc    Get single price alert
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const alert = await PriceAlert.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('product', 'name slug price images');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Price alert not found'
      });
    }

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Get price alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch price alert'
    });
  }
});

// @route   PUT /api/price-alerts/:id
// @desc    Update price alert
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { targetPrice, expiresIn } = req.body;

    const alert = await PriceAlert.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Price alert not found'
      });
    }

    if (alert.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Can only update active alerts'
      });
    }

    if (targetPrice) {
      const product = await Product.findById(alert.product);
      if (targetPrice >= product.price) {
        return res.status(400).json({
          success: false,
          message: 'Target price must be lower than current price'
        });
      }
      alert.targetPrice = targetPrice;
    }

    if (expiresIn) {
      alert.expiresAt = new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000);
    }

    await alert.save();
    await alert.populate('product', 'name slug price images');

    res.json({
      success: true,
      data: alert,
      message: 'Price alert updated successfully'
    });
  } catch (error) {
    console.error('Update price alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update price alert'
    });
  }
});

// @route   DELETE /api/price-alerts/:id
// @desc    Delete price alert
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const alert = await PriceAlert.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Price alert not found'
      });
    }

    res.json({
      success: true,
      message: 'Price alert deleted successfully'
    });
  } catch (error) {
    console.error('Delete price alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete price alert'
    });
  }
});

// @route   POST /api/price-alerts/check/:productId
// @desc    Check and trigger price alerts (called when product price updates)
// @access  Private/Admin
router.post('/check/:productId', async (req, res) => {
  try {
    const { newPrice } = req.body;
    
    if (!newPrice) {
      return res.status(400).json({
        success: false,
        message: 'New price is required'
      });
    }

    const triggeredAlerts = await PriceAlert.checkPriceDrop(req.params.productId, newPrice);

    // Update current prices for all alerts on this product
    await PriceAlert.updateCurrentPrices(req.params.productId, newPrice);

    res.json({
      success: true,
      data: {
        triggeredCount: triggeredAlerts.length,
        triggeredAlerts: triggeredAlerts.map(a => a._id)
      }
    });
  } catch (error) {
    console.error('Check price alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check price alerts'
    });
  }
});

// @route   GET /api/price-alerts/product/:productId
// @desc    Get alert count for a product (for showing UI indicator)
// @access  Public
router.get('/product/:productId', async (req, res) => {
  try {
    const count = await PriceAlert.getAlertCount(req.params.productId);

    res.json({
      success: true,
      data: { alertCount: count }
    });
  } catch (error) {
    console.error('Get product alert count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alert count'
    });
  }
});

module.exports = router;
