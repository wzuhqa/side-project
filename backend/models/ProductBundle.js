/**
 * Product Bundle Model
 * Group products together with discounted pricing
 */

const mongoose = require('mongoose');

const productBundleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  shortDescription: String,
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1 },
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    discountValue: { type: Number, default: 0 }
  }],
  pricing: {
    originalPrice: { type: Number, required: true },
    bundlePrice: { type: Number, required: true },
    savingsAmount: Number,
    savingsPercentage: Number
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  category: { type: String },
  tags: [String],
  inventory: {
    totalStock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    allowBackorder: { type: Boolean, default: false }
  },
  validity: {
    startDate: Date,
    endDate: Date,
    isLimitedTime: { type: Boolean, default: false }
  },
  limits: {
    perCustomer: { type: Number, default: 0 }, // 0 = unlimited
    totalQuantity: { type: Number, default: 0 }, // 0 = unlimited
    soldQuantity: { type: Number, default: 0 }
  },
  status: { type: String, enum: ['active', 'inactive', 'out_of_stock', 'expired'], default: 'active' },
  displaySettings: {
    showOnHomepage: { type: Boolean, default: false },
    showPriceSavings: { type: Boolean, default: true },
    badge: String, // e.g., "Save 20%", "Bundle Deal"
    sortOrder: { type: Number, default: 0 }
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
productBundleSchema.index({ status: 1, 'validity.startDate': 1, 'validity.endDate': 1 });
productBundleSchema.index({ slug: 1 });
productBundleSchema.index({ category: 1 });

// Calculate savings before save
productBundleSchema.pre('save', function(next) {
  if (this.isModified('pricing.bundlePrice') || this.isNew) {
    this.pricing.savingsAmount = this.pricing.originalPrice - this.pricing.bundlePrice;
    this.pricing.savingsPercentage = Math.round(
      (this.pricing.savingsAmount / this.pricing.originalPrice) * 100
    );
  }
  this.updatedAt = new Date();
  next();
});

// Virtual for availability
productBundleSchema.virtual('isAvailable').get(function() {
  if (this.status !== 'active') return false;
  if (this.limits.totalQuantity > 0 && this.limits.soldQuantity >= this.limits.totalQuantity) {
    return false;
  }
  const now = new Date();
  if (this.validity.startDate && now < this.validity.startDate) return false;
  if (this.validity.endDate && now > this.validity.endDate) return false;
  return true;
});

// Ensure virtuals are included in JSON
productBundleSchema.set('toJSON', { virtuals: true });
productBundleSchema.set('toObject', { virtuals: true });

const ProductBundle = mongoose.model('ProductBundle', productBundleSchema);

module.exports = ProductBundle;
