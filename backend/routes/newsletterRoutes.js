const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Newsletter subscriber model (simplified - use MongoDB in production)
const subscribers = [];

// @route   POST /api/newsletter/subscribe
// @desc    Subscribe to newsletter
// @access  Public
router.post('/subscribe', [
  body('email').isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, firstName } = req.body;

    // Check if already subscribed
    const existingSubscriber = subscribers.find(s => s.email === email);
    if (existingSubscriber) {
      return res.status(400).json({ success: false, message: 'Email already subscribed' });
    }

    // Add subscriber (in production, save to database and integrate with email service)
    subscribers.push({
      email,
      firstName,
      subscribedAt: new Date(),
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/newsletter/unsubscribe
// @desc    Unsubscribe from newsletter
// @access  Public
router.delete('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    const index = subscribers.findIndex(s => s.email === email);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Subscriber not found' });
    }

    subscribers[index].isActive = false;

    res.json({ success: true, message: 'Successfully unsubscribed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/newsletter/subscribers
// @desc    Get subscriber count (admin)
// @access  Private/Admin
router.get('/subscribers', async (req, res) => {
  try {
    const activeSubscribers = subscribers.filter(s => s.isActive).length;
    
    res.json({
      success: true,
      data: {
        total: subscribers.length,
        active: activeSubscribers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
