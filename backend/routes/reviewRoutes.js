const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/reviews/product/:productId
// @desc    Get product reviews
// @access  Public
router.get('/product/:productId', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt', rating } = req.query;

    const query = { 
      product: req.params.productId,
      isApproved: true,
      status: 'approved'
    };

    if (rating) {
      query.rating = Number(rating);
    }

    const reviews = await Review.find(query)
      .populate('user', 'firstName lastName avatar')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Review.countDocuments(query);

    // Get rating distribution
    const distribution = await Review.aggregate([
      { $match: { product: req.params.productId, isApproved: true } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    res.json({
      success: true,
      data: reviews,
      distribution: distribution.reduce((acc, d) => {
        acc[d._id] = d.count;
        return acc;
      }, {}),
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

// @route   POST /api/reviews
// @desc    Create product review
// @access  Private
router.post('/', protect, [
  body('product').notEmpty().withMessage('Product ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('content').notEmpty().withMessage('Review content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { product: productId, rating, title, content, images, pros, cons } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already reviewed this product' 
      });
    }

    // Check if user purchased this product
    const purchasedOrder = await Order.findOne({
      user: req.user.id,
      items: { $elemMatch: { product: productId } },
      status: { $in: ['delivered', 'completed'] }
    });

    const review = await Review.create({
      product: productId,
      user: req.user.id,
      order: purchasedOrder?._id,
      rating,
      title,
      content,
      images,
      pros,
      cons,
      isVerifiedPurchase: !!purchasedOrder,
      status: 'pending' // Requires approval
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully and is pending approval',
      data: review
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update review
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { rating, title, content, images, pros, cons } = req.body;

    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.content = content || review.content;
    review.images = images || review.images;
    review.pros = pros || review.pros;
    review.cons = cons || review.cons;
    review.status = 'pending'; // Re-submit for approval
    review.updatedAt = new Date();

    await review.save();

    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/reviews/:id/helpful
// @desc    Mark review as helpful
// @access  Private
router.post('/:id/helpful', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const alreadyVoted = review.helpful.users.includes(req.user.id);

    if (alreadyVoted) {
      review.helpful.users.pull(req.user.id);
      review.helpful.count -= 1;
    } else {
      review.helpful.users.push(req.user.id);
      review.helpful.count += 1;
    }

    await review.save();

    res.json({ 
      success: true, 
      data: { helpful: review.helpful.count },
      message: alreadyVoted ? 'Removed from helpful' : 'Marked as helpful'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/reviews/:id/approve
// @desc    Approve review (admin)
// @access  Private/Admin
router.put('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved: true, status: 'approved' },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
