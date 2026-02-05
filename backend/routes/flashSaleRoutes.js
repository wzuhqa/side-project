/**
 * Flash Sale Routes
 */

const express = require('express');
const router = express.Router();
const FlashSale = require('../models/FlashSale');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Get all active flash sales
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const now = new Date();
    
    const query = {
      status: 'active',
      'schedule.startDate': { $lte: now },
      'schedule.endDate': { $gte: now }
    };
    
    const flashSales = await FlashSale.find(query)
      .populate('products.product', 'name price images')
      .sort({ 'displaySettings.sortOrder': 1, 'schedule.startDate': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await FlashSale.countDocuments(query);
    
    res.json({
      flashSales,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active flash sale by ID or slug
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    let flashSale;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      flashSale = await FlashSale.findById(identifier)
        .populate('products.product', 'name price images description rating');
    } else {
      flashSale = await FlashSale.findOne({ slug: identifier })
        .populate('products.product', 'name price images description rating');
    }
    
    if (!flashSale) {
      return res.status(404).json({ error: 'Flash sale not found' });
    }
    
    // Increment view count
    await FlashSale.updateOne(
      { _id: flashSale._id },
      { $inc: { 'traffic.viewCount': 1 } }
    );
    
    res.json(flashSale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get upcoming flash sales
router.get('/upcoming/list', async (req, res) => {
  try {
    const now = new Date();
    
    const upcoming = await FlashSale.find({
      status: 'scheduled',
      'schedule.startDate': { $gt: now }
    })
    .sort({ 'schedule.startDate': 1 })
    .limit(10);
    
    res.json(upcoming);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get flash sale status (for countdown timers)
router.get('/:id/status', async (req, res) => {
  try {
    const flashSale = await FlashSale.findById(req.params.id).select('status schedule products');
    
    if (!flashSale) {
      return res.status(404).json({ error: 'Flash sale not found' });
    }
    
    const now = new Date();
    const startDate = new Date(flashSale.schedule.startDate);
    const endDate = new Date(flashSale.schedule.endDate);
    
    let timeRemaining = null;
    let status = flashSale.status;
    
    if (now < startDate) {
      status = 'scheduled';
      timeRemaining = { type: 'upcoming', milliseconds: startDate - now };
    } else if (now > endDate) {
      status = 'ended';
      timeRemaining = { type: 'ended', milliseconds: 0 };
    } else {
      timeRemaining = { type: 'active', milliseconds: endDate - now };
    }
    
    const products = flashSale.products.map(p => ({
      productId: p.product,
      stock: p.stock,
      soldCount: p.soldCount,
      stockPercentage: Math.round((p.soldCount / (p.stock + p.soldCount)) * 100)
    }));
    
    res.json({ status, timeRemaining, products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create flash sale (admin only)
router.post('/', auth, admin, async (req, res) => {
  try {
    const {
      name,
      description,
      products,
      schedule,
      displaySettings,
      seo
    } = req.body;
    
    // Validate and calculate discounts
    const processedProducts = [];
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ error: `Product ${item.product} not found` });
      }
      
      const discountPercentage = Math.round(
        ((product.price - item.flashPrice) / product.price) * 100
      );
      
      if (discountPercentage < 0) {
        return res.status(400).json({ error: 'Flash price must be lower than original price' });
      }
      
      processedProducts.push({
        product: item.product,
        flashPrice: item.flashPrice,
        originalPrice: product.price,
        discountPercentage,
        stock: item.stock || 10,
        soldCount: 0,
        maxPerCustomer: item.maxPerCustomer || 1
      });
    }
    
    const flashSale = new FlashSale({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36),
      description,
      products: processedProducts,
      schedule,
      displaySettings,
      seo,
      createdBy: req.user.id
    });
    
    // Set initial status
    const now = new Date();
    if (now >= schedule.startDate && now <= schedule.endDate) {
      flashSale.status = 'active';
    }
    
    await flashSale.save();
    res.status(201).json(flashSale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update flash sale (admin only)
router.put('/:id', auth, admin, async (req, res) => {
  try {
    const flashSale = await FlashSale.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!flashSale) {
      return res.status(404).json({ error: 'Flash sale not found' });
    }
    
    res.json(flashSale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update flash sale status (admin only)
router.patch('/:id/status', auth, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['active', 'paused', 'ended'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const flashSale = await FlashSale.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );
    
    if (!flashSale) {
      return res.status(404).json({ error: 'Flash sale not found' });
    }
    
    res.json(flashSale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete flash sale (admin only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const flashSale = await FlashSale.findByIdAndDelete(req.params.id);
    
    if (!flashSale) {
      return res.status(404).json({ error: 'Flash sale not found' });
    }
    
    res.json({ message: 'Flash sale deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reserve stock for a product in flash sale
router.post('/:id/reserve', auth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    const flashSale = await FlashSale.findById(req.params.id);
    
    if (!flashSale || flashSale.status !== 'active') {
      return res.status(404).json({ error: 'Flash sale not available' });
    }
    
    const productIndex = flashSale.products.findIndex(
      p => p.product.toString() === productId
    );
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not in flash sale' });
    }
    
    const flashProduct = flashSale.products[productIndex];
    
    // Check stock
    if (flashProduct.stock < quantity) {
      return res.status(400).json({ error: 'Not enough stock available' });
    }
    
    // Check max per customer
    if (flashProduct.maxPerCustomer > 0) {
      // You would check purchase history here
      // For now, just validate against requested quantity
      if (quantity > flashProduct.maxPerCustomer) {
        return res.status(400).json({ 
          error: `Maximum ${flashProduct.maxPerCustomer} items per customer` 
        });
      }
    }
    
    // Reserve stock (in a real app, you'd use a transaction or atomic update)
    flashProduct.stock -= quantity;
    flashProduct.soldCount += quantity;
    
    // Check if sold out
    if (flashProduct.stock <= 0) {
      const allSoldOut = flashSale.products.every(p => p.stock <= 0);
      if (allSoldOut) {
        flashSale.status = 'sold_out';
      }
    }
    
    await flashSale.save();
    
    res.json({
      success: true,
      reservedQuantity: quantity,
      remainingStock: flashProduct.stock
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
