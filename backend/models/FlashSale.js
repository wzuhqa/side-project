/**
 * Flash Sale Model
 * Time-limited promotions with special pricing
 */

const mongoose = require('mongoose');

const flashSaleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    flashPrice: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    discountPercentage: { type: Number, required: true },
    stock: { type: Number, required: true },
    soldCount: { type: Number, default: 0 },
    maxPerCustomer: { type: Number, default: 1 },
    images: [{
      url: String,
      alt: String
    }]
  }],
  schedule: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    timezone: { type: String, default: 'UTC' },
    isRecurring: { type: Boolean, default: false },
    recurringPattern: {
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
      daysOfWeek: [Number], // 0-6 for Sunday-Saturday
      timeSlots: [{
        startTime: String, // HH:mm format
        endTime: String
      }]
    }
  },
  status: { 
    type: String, 
    enum: ['scheduled', 'active', 'paused', 'ended', 'sold_out'],
    default: 'scheduled'
  },
  displaySettings: {
    showCountdown: { type: Boolean, default: true },
    showProgressBar: { type: Boolean, default: true },
    bannerImage: String,
    badge: String,
    sortOrder: { type: Number, default: 0 }
  },
  traffic: {
    viewCount: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 }
  },
  seo: {
    metaTitle: String,
    metaDescription: String
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
flashSaleSchema.index({ status: 1, 'schedule.startDate': 1, 'schedule.endDate': 1 });
flashSaleSchema.index({ slug: 1 });

// Update status before save
flashSaleSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.isModified('status')) {
    next();
    return;
  }
  
  // Auto-update status based on schedule
  if (this.schedule) {
    if (now < this.schedule.startDate) {
      this.status = 'scheduled';
    } else if (now >= this.schedule.startDate && now <= this.schedule.endDate) {
      // Check if all products are sold out
      const allSoldOut = this.products.every(p => p.stock <= 0);
      this.status = allSoldOut ? 'sold_out' : 'active';
    } else {
      this.status = 'ended';
    }
  }
  
  this.updatedAt = now;
  next();
});

// Virtual for time remaining
flashSaleSchema.virtual('timeRemaining').get(function() {
  if (!this.schedule) return null;
  const now = new Date();
  const end = new Date(this.schedule.endDate);
  const start = new Date(this.schedule.startDate);
  
  if (now < start) return { type: 'upcoming', milliseconds: start - now };
  if (now > end) return { type: 'ended', milliseconds: 0 };
  
  return { type: 'active', milliseconds: end - now };
});

// Virtual for progress percentage
flashSaleSchema.virtual('totalProgress').get(function() {
  const totalStock = this.products.reduce((sum, p) => sum + p.stock + p.soldCount, 0);
  const soldStock = this.products.reduce((sum, p) => sum + p.soldCount, 0);
  return totalStock > 0 ? Math.round((soldStock / totalStock) * 100) : 0;
});

// Instance method to check product availability
flashSaleSchema.methods.isProductAvailable = function(productId, quantity = 1) {
  const product = this.products.find(p => p.product.toString() === productId.toString());
  if (!product) return false;
  if (product.stock < quantity) return false;
  return true;
};

// Instance method to decrement stock
flashSaleSchema.methods.decrementStock = async function(productId, quantity = 1) {
  const product = this.products.find(p => p.product.toString() === productId.toString());
  if (product) {
    product.stock -= quantity;
    product.soldCount += quantity;
    await this.save();
    
    // Check if all sold out
    const allSoldOut = this.products.every(p => p.stock <= 0);
    if (allSoldOut && this.status === 'active') {
      this.status = 'sold_out';
      await this.save();
    }
  }
  return product;
};

// Ensure virtuals are included in JSON
flashSaleSchema.set('toJSON', { virtuals: true });
flashSaleSchema.set('toObject', { virtuals: true });

const FlashSale = mongoose.model('FlashSale', flashSaleSchema);

module.exports = FlashSale;
