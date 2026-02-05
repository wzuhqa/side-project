const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/analytics/dashboard
// @desc    Get admin dashboard analytics
// @access  Private/Admin
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    // Get date ranges
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const startOfThisYear = new Date(today.getFullYear(), 0, 1);

    // Sales analytics
    const [
      todaySales,
      thisMonthSales,
      lastMonthSales,
      thisYearSales,
      totalSales
    ] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfToday }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$pricing.total' }, count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfThisMonth }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$pricing.total' }, count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$pricing.total' }, count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfThisYear }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$pricing.total' }, count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$pricing.total' }, count: { $sum: 1 } } }
      ])
    ]);

    // Order counts by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Top selling products
    const topProducts = await Product.find({ status: 'active' })
      .sort('-totalSold')
      .limit(5)
      .select('name images totalSold');

    // Recent orders
    const recentOrders = await Order.find()
      .sort('-createdAt')
      .limit(5)
      .select('orderNumber pricing.total status createdAt user')
      .populate('user', 'firstName lastName email');

    // Customer analytics
    const [
      totalCustomers,
      newCustomersThisMonth
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ createdAt: { $gte: startOfThisMonth }, role: 'user' })
    ]);

    // Low stock products
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
      status: 'active'
    })
      .sort('quantity')
      .limit(5)
      .select('name quantity lowStockThreshold');

    res.json({
      success: true,
      data: {
        sales: {
          today: todaySales[0] || { total: 0, count: 0 },
          thisMonth: thisMonthSales[0] || { total: 0, count: 0 },
          lastMonth: lastMonthSales[0] || { total: 0, count: 0 },
          thisYear: thisYearSales[0] || { total: 0, count: 0 },
          allTime: totalSales[0] || { total: 0, count: 0 }
        },
        ordersByStatus: ordersByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        topProducts,
        recentOrders,
        customers: {
          total: totalCustomers,
          newThisMonth: newCustomersThisMonth
        },
        lowStock: lowStockProducts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/analytics/sales
// @desc    Get sales analytics
// @access  Private/Admin
router.get('/sales', protect, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    const matchStage = { paymentStatus: 'paid' };
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    let dateFormat;
    switch (groupBy) {
      case 'month':
        dateFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        break;
      case 'year':
        dateFormat = { $dateToString: { format: '%Y', date: '$createdAt' } };
        break;
      default:
        dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    }

    const salesData = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: dateFormat,
          totalRevenue: { $sum: '$pricing.total' },
          totalOrders: { $sum: 1 },
          totalItems: { $sum: { $size: '$items' } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, data: salesData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/analytics/products
// @desc    Get product performance analytics
// @access  Private/Admin
router.get('/products', protect, authorize('admin'), async (req, res) => {
  try {
    const { sort = '-totalSold', limit = 10 } = req.query;

    const products = await Product.find({ status: 'active' })
      .sort(sort)
      .limit(Number(limit))
      .select('name images price totalSold viewCount ratings.average');

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
