const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  variant: {
    name: String,
    sku: String,
    price: Number,
    attributes: [{
      name: String,
      value: String
    }]
  },
  price: {
    type: Number,
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  savedForLater: {
    type: Boolean,
    default: false
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  coupon: {
    code: String,
    discount: Number,
    type: { type: String, enum: ['percentage', 'fixed'] },
    minPurchase: Number,
    maxDiscount: Number
  },
  subtotal: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  expiresAt: Date
}, {
  timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  let subtotal = 0;
  let discount = 0;

  // Calculate subtotal from non-saved items
  this.items.forEach(item => {
    if (!item.savedForLater) {
      subtotal += item.price * item.quantity;
    }
  });

  this.subtotal = subtotal;

  // Calculate discount from coupon
  if (this.coupon && this.coupon.discount) {
    if (this.coupon.type === 'percentage') {
      discount = (subtotal * this.coupon.discount) / 100;
      if (this.coupon.maxDiscount && discount > this.coupon.maxDiscount) {
        discount = this.coupon.maxDiscount;
      }
    } else {
      discount = this.coupon.discount;
    }
    if (this.coupon.minPurchase && subtotal < this.coupon.minPurchase) {
      discount = 0;
    }
  }

  this.discount = discount;
  this.total = subtotal - discount;
  next();
});

// Index
cartSchema.index({ user: 1 });

module.exports = mongoose.model('Cart', cartSchema);
