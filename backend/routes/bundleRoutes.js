/**
 * Product Bundle Routes
 */

const express = require('express');
const router = express.Router();
const ProductBundle = require('../models/ProductBundle');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Get all active bundles
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, category } = req.query;
    const now = new Date();
    
    const query = { 
      status: 'active',
      $or: [
        { 'validity.startDate': { $exists: false } },
        { 'validity.startDate': { $lte: now } }
      ],
      $or: [
        { 'validity.endDate': { $exists: false } },
        { 'validity.endDate': { $gte: now } }
      ]
    };
    
    if (category) {
      query.category = category;
    }
    
    const bundles = await ProductBundle.find(query)
      .populate('products.product', 'name price images')
      .sort({ 'displaySettings.sortOrder': 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await ProductBundle.countDocuments(query);
    
    res.json({
      bundles,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bundle by slug
router.get('/:slug', async (req, res) => {
  try {
    const bundle = await ProductBundle.findOne({ 
      slug: req.params.slug,
      status: 'active'
    }).populate('products.product');
    
    if (!bundle) {
      return res.status(404).json({ error: 'Bundle not found' });
    }
    
    // Increment view count (you might want to do this asynchronously)
    await ProductBundle.updateOne(
      { _id: bundle._id },
      { $inc: { 'traffic.viewCount': 1 } }
    );
    
    res.json(bundle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create bundle (admin only)
router.post('/', auth, admin, async (req, res) => {
  try {
    const {
      name,
      description,
      products,
      pricing,
      images,
      category,
      tags,
      inventory,
      validity,
      limits,
      displaySettings,
      seo
    } = req.body;
    
    // Calculate original price from products
    let originalPrice = 0;
    const bundleProducts = [];
    
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ error: `Product ${item.product} not found` });
      }
      originalPrice += product.price * (item.quantity || 1);
      bundleProducts.push({
        product: item.product,
        quantity: item.quantity || 1,
        discountType: item.discountType || 'percentage',
        discountValue: item.discountValue || 0
      });
    }
    
    const bundle = new ProductBundle({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description,
      products: bundleProducts,
      pricing: {
        originalPrice,
        bundlePrice: pricing.bundlePrice,
        savingsAmount: originalPrice - pricing.bundlePrice,
        savingsPercentage: Math.round(((originalPrice - pricing.bundlePrice) / originalPrice) * 100)
      },
      images,
      category,
      tags,
      inventory: inventory || { totalStock: 100, lowStockThreshold: 10 },
      validity,
      limits,
      displaySettings,
      seo
    });
    
    await bundle.save();
    res.status(201).json(bundle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update bundle (admin only)
router.put('/:id', auth, admin, async (req, res) => {
  try {
    const bundle = await ProductBundle.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!bundle) {
      return res.status(404).json({ error: 'Bundle not found' });
    }
    
    res.json(bundle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete bundle (admin only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const bundle = await ProductBundle.findByIdAndDelete(req.params.id);
    
    if (!bundle) {
      return res.status(404).json({ error: 'Bundle not found' });
    }
    
    res.json({ message: 'Bundle deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Validate bundle for cart
router.post('/validate', async (req, res) => {
  try {
    const { bundleId, quantity = 1 } = req.body;
    const bundle = await ProductBundle.findById(bundleId);
    
    if (!bundle || bundle.status !== 'active') {
      return res.status(404).json({ error: 'Bundle not available' });
    }
    
    // Check availability
    if (bundle.limits.totalQuantity > 0) {
      const remaining = bundle.limits.totalQuantity - bundle.limits.soldQuantity;
      if (remaining < quantity) {
        return res.status(400).json({ error: 'Not enough stock available' });
      }
    }
    
    // Check validity dates
    const now = new Date();
    if (bundle.validity.startDate && now < bundle.validity.startDate) {
      return res.status(400).json({ error: 'Bundle not yet available' });
    }
    if (bundle.validity.endDate && now > bundle.validity.endDate) {
      return res.status(400).json({ error: 'Bundle has expired' });
    }
    
    res.json({
      valid: true,
      bundle: {
        _id: bundle._id,
        name: bundle.name,
        price: bundle.pricing.bundlePrice,
        originalPrice: bundle.pricing.originalPrice,
        savingsPercentage: bundle.pricing.savingsPercentage
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bundles for homepage
router.get('/featured/home', async (req, res) => {
  try {
    const bundles = await ProductBundle.find({
      status: 'active',
      'displaySettings.showOnHomepage': true
    })
    .populate('products.product', 'name price images')
    .sort({ 'displaySettings.sortOrder': 1 })
    .limit(6);
    
    res.json(bundles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
