const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  targetPrice: {
    type: Number,
    required: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['price_drop', 'back_in_stock', 'on_sale', 'price_below'],
    default: 'price_drop'
  },
  status: {
    type: String,
    enum: ['active', 'triggered', 'cancelled', 'expired'],
    default: 'active'
  },
  triggeredAt: Date,
  notificationSent: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  },
  lastNotifiedPrice: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
priceAlertSchema.index({ user: 1, product: 1, status: 1 });
priceAlertSchema.index({ product: 1, status: 1, targetPrice: 1 });
priceAlertSchema.index({ status: 1, expiresAt: 1 });

// Virtual for isExpired
priceAlertSchema.virtual('isExpired').get(function() {
  return this.expiresAt && new Date() > this.expiresAt;
});

// Static method to check and trigger price drop alerts
priceAlertSchema.statics.checkPriceDrop = async function(productId, newPrice) {
  const alerts = await this.find({
    product: productId,
    status: 'active',
    $or: [
      { targetPrice: { $gte: newPrice } }, // Price dropped to or below target
      { type: 'price_below', targetPrice: { $gte: newPrice } }
    ],
    $expr: { $lt: ['$currentPrice', newPrice] } // Only if price actually dropped
  }).populate('user', 'email firstName');

  const triggeredAlerts = [];
  
  for (const alert of alerts) {
    // Check if alert expired
    if (alert.expiresAt && new Date() > alert.expiresAt) {
      alert.status = 'expired';
      await alert.save();
      continue;
    }

    // Check if price actually dropped below target
    if (newPrice <= alert.targetPrice && alert.currentPrice > newPrice) {
      alert.status = 'triggered';
      alert.currentPrice = newPrice;
      alert.triggeredAt = new Date();
      alert.notificationSent = true;
      alert.lastNotifiedPrice = newPrice;
      await alert.save();
      
      triggeredAlerts.push(alert);
      
      // Send email notification (in production, use a real email service)
      await sendPriceDropEmail(alert.user, alert.product, newPrice, alert.targetPrice);
    }
  }

  return triggeredAlerts;
};

// Static method to check for price increases and update current price
priceAlertSchema.statics.updateCurrentPrices = async function(productId, newPrice) {
  await this.updateMany(
    { product: productId, status: 'active' },
    { currentPrice: newPrice }
  );
};

// Static method to get active alerts for a user
priceAlertSchema.statics.getUserAlerts = async function(userId) {
  return this.find({ user: userId })
    .populate('product', 'name slug price images')
    .sort('-createdAt');
};

// Static method to get product alert count
priceAlertSchema.statics.getAlertCount = async function(productId) {
  return this.countDocuments({
    product: productId,
    status: 'active'
  });
};

// Helper function to send price drop email
async function sendPriceDropEmail(user, product, currentPrice, targetPrice) {
  // In production, use SendGrid, AWS SES, or Nodemailer
  const nodemailer = require('nodemailer');
  
  // Create transporter (configure with real SMTP in production)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"ShopNow" <noreply@shopnow.com>',
    to: user.email,
    subject: `🎉 Price Drop Alert: ${product.name} is now $${currentPrice}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Price Drop Alert! 🎉</h1>
        <p>Hi ${user.firstName},</p>
        <p>Great news! A product you're watching is now at your target price.</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">${product.name}</h3>
          <p style="font-size: 24px; font-weight: bold; color: #10b981; margin: 0;">
            $${currentPrice.toFixed(2)}
          </p>
          <p style="color: #64748b; text-decoration: line-through;">
            Your target: $${targetPrice.toFixed(2)}
          </p>
        </div>
        
        <a href="${process.env.FRONTEND_URL}/product/${product.slug}" 
           style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Shop Now
        </a>
        
        <p style="color: #64748b; font-size: 12px; margin-top: 30px;">
          This alert was sent because you set a price drop notification for this product.
          <br>To manage your alerts, visit your <a href="${process.env.FRONTEND_URL}/account/wishlist">wishlist</a>.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Price drop email sent to ${user.email} for product ${product.name}`);
  } catch (error) {
    console.error('Failed to send price drop email:', error);
  }
}

module.exports = mongoose.model('PriceAlert', priceAlertSchema);
