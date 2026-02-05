const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// @route   GET /api/products
// @desc    Get all products with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      minRating,
      sort = '-createdAt',
      search,
      tags,
      isFeatured,
      status = 'active'
    } = req.query;

    // Build query
    const queryObj = { status };

    if (category) {
      queryObj.category = category;
    }
    if (subcategory) {
      queryObj.subcategory = subcategory;
    }
    if (brand) {
      queryObj.brand = { $regex: brand, $options: 'i' };
    }
    if (minPrice || maxPrice) {
      queryObj.price = {};
      if (minPrice) queryObj.price.$gte = Number(minPrice);
      if (maxPrice) queryObj.price.$lte = Number(maxPrice);
    }
    if (minRating) {
      queryObj['ratings.average'] = { $gte: Number(minRating) };
    }
    if (tags) {
      queryObj.tags = { $in: tags.split(',') };
    }
    if (isFeatured === 'true') {
      queryObj.isFeatured = true;
    }
    if (search) {
      queryObj.$text = { $search: search };
    }

    // Execute query with pagination
    const products = await Product.find(queryObj)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-reviews');

    const total = await Product.countDocuments(queryObj);

    res.json({
      success: true,
      data: products,
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

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true, status: 'active' })
      .populate('category', 'name slug')
      .limit(8);

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/products/best-sellers
// @desc    Get best selling products
// @access  Public
router.get('/best-sellers', async (req, res) => {
  try {
    const products = await Product.find({ status: 'active' })
      .sort('-totalSold')
      .populate('category', 'name slug')
      .limit(8);

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/products/new-arrivals
// @desc    Get new arrival products
// @access  Public
router.get('/new-arrivals', async (req, res) => {
  try {
    const products = await Product.find({ status: 'active' })
      .sort('-createdAt')
      .populate('category', 'name slug')
      .limit(8);

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/products/related/:productId
// @desc    Get related products
// @access  Public
router.get('/related/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      $or: [
        { category: product.category },
        { subcategory: product.subcategory },
        { brand: product.brand }
      ],
      status: 'active'
    })
      .populate('category', 'name slug')
      .limit(4);

    res.json({ success: true, data: relatedProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/products/frequently-bought/:productId
// @desc    Get frequently bought together products
// @access  Public
router.get('/frequently-bought/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let suggestions = [];
    
    if (product.frequentlyBoughtTogether && product.frequentlyBoughtTogether.length > 0) {
      suggestions = await Product.find({
        _id: { $in: product.frequentlyBoughtTogether },
        status: 'active'
      }).populate('category', 'name slug');
    }

    res.json({ success: true, data: suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/products/brands
// @desc    Get all product brands
// @access  Public
router.get('/brands', async (req, res) => {
  try {
    const brands = await Product.distinct('brand', { status: 'active', brand: { $ne: null, $ne: '' } });
    
    res.json({ success: true, data: brands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/products/:idOrSlug
// @desc    Get single product by ID or slug
// @access  Public
router.get('/:idOrSlug', async (req, res) => {
  try {
    let product;
    
    // Check if it's a valid ObjectId
    if (req.params.idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(req.params.idOrSlug)
        .populate('category', 'name slug')
        .populate('subcategory', 'name slug')
        .populate('relatedProducts')
        .populate('reviews', 'rating title content user images createdAt helpful')
        .populate({
          path: 'reviews',
          populate: {
            path: 'user',
            select: 'firstName lastName avatar'
          }
        });
    } else {
      product = await Product.findOne({ slug: req.params.idOrSlug })
        .populate('category', 'name slug')
        .populate('subcategory', 'name slug')
        .populate('relatedProducts')
        .populate('reviews', 'rating title content user images createdAt helpful')
        .populate({
          path: 'reviews',
          populate: {
            path: 'user',
            select: 'firstName lastName avatar'
          }
        });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private/Admin
router.post('/', protect, authorize('admin'), [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category').notEmpty().withMessage('Category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const product = await Product.create(req.body);

    // Update category product count
    await Category.findByIdAndUpdate(product.category, {
      $inc: { productCount: 1 }
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.deleteOne();

    // Update category product count
    await Category.findByIdAndUpdate(product.category, {
      $inc: { productCount: -1 }
    });

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
