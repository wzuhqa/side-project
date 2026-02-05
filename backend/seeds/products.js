const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Category = require('../models/Category');
const Product = require('../models/Product');

const categories = [
  { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and accessories', image: '/uploads/placeholder.svg' },
  { name: 'Clothing', slug: 'clothing', description: 'Fashion and apparel', image: '/uploads/placeholder.svg' },
  { name: 'Home & Garden', slug: 'home-garden', description: 'Home decor and garden supplies', image: '/uploads/placeholder.svg' },
  { name: 'Sports', slug: 'sports', description: 'Sports equipment and accessories', image: '/uploads/placeholder.svg' }
];

const products = [
  {
    name: 'Wireless Bluetooth Headphones',
    slug: 'wireless-bluetooth-headphones',
    description: 'Premium wireless headphones with noise cancellation, 30-hour battery life, and crystal-clear audio quality.',
    price: 149.99,
    category: 'Electronics',
    brand: 'AudioMax',
    quantity: 50,
    ratings: { average: 4.5, count: 128 },
    images: [{ url: '/uploads/placeholder.svg', alt: 'Wireless Bluetooth Headphones', isPrimary: true }],
    attributes: [
      { name: 'Bluetooth Version', value: '5.0', visible: true },
      { name: 'Battery Life', value: '30 hours', visible: true },
      { name: 'Charging', value: 'USB-C', visible: true }
    ],
    tags: ['headphones', 'wireless', 'audio', 'bluetooth'],
    isFeatured: true,
    status: 'active'
  },
  {
    name: 'Smart Fitness Watch',
    slug: 'smart-fitness-watch',
    description: 'Advanced fitness tracker with heart rate monitoring, GPS tracking, and sleep analysis.',
    price: 299.99,
    category: 'Electronics',
    brand: 'FitTech',
    quantity: 75,
    ratings: { average: 4.3, count: 89 },
    images: [{ url: '/uploads/placeholder.svg', alt: 'Smart Fitness Watch', isPrimary: true }],
    attributes: [
      { name: 'Features', value: 'Heart Rate Monitor, GPS, Water Resistant', visible: true },
      { name: 'Battery Life', value: '7 days', visible: true }
    ],
    tags: ['smartwatch', 'fitness', 'tracker', 'wearable'],
    isFeatured: true,
    status: 'active'
  },
  {
    name: 'Premium Cotton T-Shirt',
    slug: 'premium-cotton-tshirt',
    description: '100% organic cotton t-shirt with a comfortable fit and sustainable production.',
    price: 29.99,
    category: 'Clothing',
    brand: 'EcoWear',
    quantity: 200,
    ratings: { average: 4.7, count: 45 },
    images: [{ url: '/uploads/placeholder.svg', alt: 'Premium Cotton T-Shirt', isPrimary: true }],
    attributes: [
      { name: 'Material', value: '100% Organic Cotton', visible: true },
      { name: 'Care', value: 'Machine Washable', visible: true }
    ],
    tags: ['tshirt', 'cotton', 'organic', 'sustainable'],
    status: 'active'
  },
  {
    name: 'Running Shoes Pro',
    slug: 'running-shoes-pro',
    description: 'Professional running shoes with advanced cushioning and breathable mesh upper.',
    price: 129.99,
    category: 'Sports',
    brand: 'SpeedRun',
    quantity: 100,
    ratings: { average: 4.6, count: 234 },
    images: [{ url: '/uploads/placeholder.svg', alt: 'Running Shoes Pro', isPrimary: true }],
    attributes: [
      { name: 'Cushioning', value: 'Advanced', visible: true },
      { name: 'Upper', value: 'Breathable Mesh', visible: true },
      { name: 'Sole', value: 'Anti-slip', visible: true }
    ],
    tags: ['running', 'shoes', 'athletic', 'sports'],
    isFeatured: true,
    status: 'active'
  },
  {
    name: 'Minimalist Desk Lamp',
    slug: 'minimalist-desk-lamp',
    description: 'Modern LED desk lamp with adjustable brightness and color temperature.',
    price: 79.99,
    category: 'Home & Garden',
    brand: 'LightStyle',
    quantity: 60,
    ratings: { average: 4.4, count: 67 },
    images: [{ url: '/uploads/placeholder.svg', alt: 'Minimalist Desk Lamp', isPrimary: true }],
    attributes: [
      { name: 'Technology', value: 'LED', visible: true },
      { name: 'Features', value: 'Adjustable Brightness, Touch Control', visible: true }
    ],
    tags: ['lamp', 'desk', 'led', 'lighting'],
    status: 'active'
  },
  {
    name: 'Stainless Steel Water Bottle',
    slug: 'stainless-steel-water-bottle',
    description: 'Eco-friendly insulated water bottle that keeps drinks cold for 24 hours.',
    price: 34.99,
    category: 'Home & Garden',
    brand: 'HydroLife',
    quantity: 150,
    ratings: { average: 4.8, count: 312 },
    images: [{ url: '/uploads/placeholder.svg', alt: 'Stainless Steel Water Bottle', isPrimary: true }],
    attributes: [
      { name: 'Material', value: 'Double-wall Stainless Steel', visible: true },
      { name: 'Features', value: 'BPA Free, Leak Proof', visible: true },
      { name: 'Cold Retention', value: '24 hours', visible: true }
    ],
    tags: ['water bottle', 'eco-friendly', 'insulated', 'stainless steel'],
    isFeatured: true,
    status: 'active'
  },
  {
    name: 'Yoga Mat Premium',
    slug: 'yoga-mat-premium',
    description: 'Non-slip yoga mat with extra cushioning for comfortable practice.',
    price: 49.99,
    category: 'Sports',
    brand: 'ZenFit',
    quantity: 80,
    ratings: { average: 4.5, count: 156 },
    images: [{ url: '/uploads/placeholder.svg', alt: 'Yoga Mat Premium', isPrimary: true }],
    attributes: [
      { name: 'Surface', value: 'Non-slip', visible: true },
      { name: 'Cushioning', value: 'Extra', visible: true }
    ],
    tags: ['yoga', 'mat', 'fitness', 'exercise'],
    status: 'active'
  },
  {
    name: 'Wireless Keyboard',
    slug: 'wireless-keyboard',
    description: 'Sleek wireless keyboard with backlit keys and ergonomic design.',
    price: 89.99,
    category: 'Electronics',
    brand: 'TechType',
    quantity: 40,
    ratings: { average: 4.2, count: 78 },
    images: [{ url: '/uploads/placeholder.svg', alt: 'Wireless Keyboard', isPrimary: true }],
    attributes: [
      { name: 'Connectivity', value: 'Wireless', visible: true },
      { name: 'Features', value: 'Backlit Keys, Ergonomic', visible: true }
    ],
    tags: ['keyboard', 'wireless', 'computer', 'accessories'],
    status: 'active'
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopnext');
    console.log('MongoDB Connected');

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Insert categories
    const createdCategories = await Category.insertMany(categories);
    console.log('Categories created');

    // Add category IDs to products
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    const productsWithCategoryIds = products.map(product => ({
      ...product,
      category: categoryMap[product.category]
    }));

    // Insert products
    await Product.insertMany(productsWithCategoryIds);
    console.log('Products seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
