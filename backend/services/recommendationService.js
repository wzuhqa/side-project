/**
 * Recommendation Engine Service
 * Uses collaborative filtering and content-based recommendations
 */

const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

class RecommendationService {
  /**
   * Get personalized recommendations for a user
   */
  async getPersonalizedRecommendations(userId, limit = 10) {
    try {
      const user = await User.findById(userId);
      if (!user) return [];

      const purchasedProductIds = await this.getUserPurchasedProducts(userId);
      const viewedProductIds = await this.getUserViewedProducts(userId);
      
      // Get collaborative filtering recommendations
      const collaborativeRecs = await this.getCollaborativeRecommendations(
        userId,
        purchasedProductIds,
        limit
      );

      // Get content-based recommendations
      const contentRecs = await this.getContentBasedRecommendations(
        purchasedProductIds.concat(viewedProductIds),
        limit
      );

      // Get trending products
      const trendingRecs = await this.getTrendingProducts(limit);

      // Combine and deduplicate
      const combined = [
        ...collaborativeRecs.map(p => ({ ...p, score: 0.9 })),
        ...contentRecs.map(p => ({ ...p, score: 0.7 })),
        ...trendingRecs.map(p => ({ ...p, score: 0.5 }))
      ];

      // Remove already purchased items
      const filtered = combined.filter(
        rec => !purchasedProductIds.includes(rec._id.toString())
      );

      // Sort by score and limit
      return filtered
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(rec => rec._id);
    } catch (error) {
      console.error('Recommendation error:', error);
      return [];
    }
  }

  /**
   * Get products frequently bought together
   */
  async getFrequentlyBoughtTogether(productId, limit = 3) {
    try {
      const orders = await Order.find({
        'items.product': productId,
        status: { $in: ['delivered', 'completed'] }
      }).select('items.product');

      const productCounts = {};
      orders.forEach(order => {
        order.items.forEach(item => {
          if (item.product.toString() !== productId) {
            productCounts[item.product.toString()] = 
              (productCounts[item.product.toString()] || 0) + 1;
          }
        });
      });

      return Object.entries(productCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([productId]) => productId);
    } catch (error) {
      console.error('Frequently bought together error:', error);
      return [];
    }
  }

  /**
   * Get similar products based on category and attributes
   */
  async getSimilarProducts(productId, limit = 6) {
    try {
      const product = await Product.findById(productId);
      if (!product) return [];

      const similar = await Product.find({
        $or: [
          { category: product.category },
          { brand: product.brand },
          { tags: { $in: product.tags || [] } }
        ],
        _id: { $ne: productId },
        isActive: true
      })
      .limit(limit)
      .select('_id name price images rating');

      return similar;
    } catch (error) {
      console.error('Similar products error:', error);
      return [];
    }
  }

  /**
   * Get trending products based on recent sales
   */
  async getTrendingProducts(limit = 10) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const trending = await Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.product', count: { $sum: '$items.quantity' } } },
        { $sort: { count: -1 } },
        { $limit: limit },
        { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
        { $unwind: '$product' },
        { $replaceRoot: { newRoot: '$product' } }
      ]);

      return trending;
    } catch (error) {
      console.error('Trending products error:', error);
      return [];
    }
  }

  /**
   * Get "Recently Viewed" products for a user
   */
  async getRecentlyViewed(userId, limit = 10) {
    try {
      const user = await User.findById(userId).select('recentlyViewed');
      if (!user || !user.recentlyViewed) return [];

      return user.recentlyViewed.slice(0, limit);
    } catch (error) {
      console.error('Recently viewed error:', error);
      return [];
    }
  }

  /**
   * Collaborative filtering - find users with similar purchase patterns
   */
  async getCollaborativeRecommendations(userId, excludeProducts, limit) {
    try {
      // Find users who purchased similar products
      const similarUsers = await Order.aggregate([
        { $match: { 'items.product': { $in: excludeProducts.slice(0, 10) } } },
        { $group: { _id: '$user', commonProducts: { $addToSet: '$items.product' } } },
        { $match: { _id: { $ne: userId } } },
        { $addFields: { commonCount: { $size: '$commonProducts' } } },
        { $sort: { commonCount: -1 } },
        { $limit: 20 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userData' } },
        { $unwind: '$userData' }
      ]);

      const recommendedProducts = new Set();
      
      for (const user of similarUsers) {
        const userOrders = await Order.find({ user: user._id });
        userOrders.forEach(order => {
          order.items.forEach(item => {
            if (!excludeProducts.includes(item.product.toString())) {
              recommendedProducts.add(item.product);
            }
          });
        });
        if (recommendedProducts.size >= limit) break;
      }

      const products = await Product.find({
        _id: { $in: Array.from(recommendedProducts).slice(0, limit) },
        isActive: true
      });

      return products;
    } catch (error) {
      console.error('Collaborative filtering error:', error);
      return [];
    }
  }

  /**
   * Content-based filtering - find products with similar attributes
   */
  async getContentBasedRecommendations(productIds, limit) {
    try {
      const products = await Product.find({ _id: { $in: productIds } });
      
      // Extract common categories and brands
      const categories = [...new Set(products.map(p => p.category))];
      const brands = [...new Set(products.map(p => p.brand))];
      const tags = [...new Set(products.flatMap(p => p.tags || []))];

      const recommendations = await Product.find({
        $or: [
          { category: { $in: categories } },
          { brand: { $in: brands } },
          { tags: { $in: tags } }
        ],
        _id: { $nin: productIds },
        isActive: true
      })
      .limit(limit)
      .select('_id name price images rating');

      return recommendations;
    } catch (error) {
      console.error('Content-based filtering error:', error);
      return [];
    }
  }

  /**
   * Get user purchased products
   */
  async getUserPurchasedProducts(userId) {
    try {
      const orders = await Order.find({ user: userId, status: 'delivered' });
      return [...new Set(orders.flatMap(o => o.items.map(i => i.product.toString())))];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get user viewed products (from session/localStorage tracking)
   */
  async getUserViewedProducts(userId) {
    try {
      const user = await User.findById(userId).select('recentlyViewed');
      return user?.recentlyViewed || [];
    } catch (error) {
      return [];
    }
  }
}

module.exports = new RecommendationService();
