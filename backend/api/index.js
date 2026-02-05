const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'E-commerce API is running' });
});

// API Routes
app.use('/api/users', require('../routes/userRoutes'));
app.use('/api/products', require('../routes/productRoutes'));
app.use('/api/orders', require('../routes/orderRoutes'));
app.use('/api/cart', require('../routes/cartRoutes'));
app.use('/api/payments', require('../routes/paymentRoutes'));
app.use('/api/reviews', require('../routes/reviewRoutes'));
app.use('/api/newsletter', require('../routes/newsletterRoutes'));
app.use('/api/analytics', require('../routes/analyticsRoutes'));
app.use('/api/price-alerts', require('../routes/priceAlertRoutes'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
  });
}

module.exports = app;
