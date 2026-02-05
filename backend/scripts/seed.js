/**
 * Database Seed Script - Populates the database with sample products
 */

const mongoose = require('mongoose');
const { products, categories } = require('../data/products');

const Product = require('../models/Product');
const Category = require('../models/Category');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('Cleared existing data');

    // Insert categories
    await Category.insertMany(categories);
    console.log(`Inserted ${categories.length} categories`);

    // Insert products
    const insertedProducts = await Product.insertMany(products);
    console.log(`Inserted ${insertedProducts.length} products`);

    // Update category product counts
    for (const category of categories) {
      const count = await Product.countDocuments({ category: category.id });
      await Category.findByIdAndUpdate(category.id, { productCount: count });
    }
    console.log('Updated category counts');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
