const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  compareAtPrice: {
    type: Number,
    min: [0, 'Compare at price cannot be negative']
  },
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  barcode: {
    type: String,
    sparse: true
  },
  quantity: {
    type: Number,
    required: [true, 'Product quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  brand: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  images: [{
    url: { type: String, required: true },
    alt: String,
    publicId: String,
    isPrimary: { type: Boolean, default: false }
  }],
  thumbnails: [{
    url: String,
    publicId: String
  }],
  videos: [{
    url: String,
    type: { type: String, enum: ['youtube', 'vimeo', 'upload'] },
    thumbnail: String
  }],
  variants: [{
    name: String,
    sku: String,
    price: Number,
    quantity: Number,
    attributes: [{
      name: String,
      value: String
    }],
    images: [{
      url: String,
      publicId: String
    }]
  }],
  attributes: [{
    name: String,
    value: String,
    visible: { type: Boolean, default: true }
  }],
  specifications: [{
    name: String,
    value: String
  }],
  weight: {
    value: Number,
    unit: { type: String, enum: ['kg', 'lb', 'g', 'oz'], default: 'kg' }
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: { type: String, enum: ['cm', 'in', 'm'], default: 'cm' }
  },
  shippingClass: {
    type: String,
    enum: ['free', 'standard', 'express'],
    default: 'standard'
  },
  taxClass: {
    type: String,
    default: 'standard'
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
    canonicalUrl: String,
    ogImage: String
  },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  frequentlyBoughtTogether: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  upSells: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  crossSells: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'archived'],
    default: 'draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isDigital: {
    type: Boolean,
    default: false
  },
  digitalFile: {
    url: String,
    maxDownloads: Number,
    downloadExpiry: Number
  },
  allowBackorders: {
    type: Boolean,
    default: false
  },
  totalSold: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create slug before saving
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Index for search
productSchema.index({
  name: 'text',
  description: 'text',
  shortDescription: 'text',
  brand: 'text',
  tags: 'text'
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images[0]?.url || '/placeholder.jpg');
});

// Virtual for isInStock
productSchema.virtual('isInStock').get(function() {
  return this.quantity > 0 || this.allowBackorders;
});

// Virtual for isOnSale
productSchema.virtual('isOnSale').get(function() {
  return this.compareAtPrice && this.compareAtPrice > this.price;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.compareAtPrice && this.compareAtPrice > this.price) {
    return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
  }
  return 0;
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
