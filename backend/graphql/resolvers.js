/**
 * GraphQL Resolvers
 */

const { GraphQLScalarType, Kind } = require('graphql');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const ProductBundle = require('../models/ProductBundle');
const FlashSale = require('../models/FlashSale');
const auth = require('../middleware/auth');
const { authenticationError, authorizationError } = require('./errors');

// Custom Date scalar
const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value) {
    return value instanceof Date ? value.toISOString() : value;
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

// Custom JSON scalar
const jsonScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON custom scalar type',
  serialize(value) {
    return value;
  },
  parseValue(value) {
    return value;
  },
  parseLiteral(ast) {
    switch (ast.kind) {
      case Kind.STRING:
        return JSON.parse(ast.value);
      case Kind.OBJECT:
        return ast.fields.reduce((obj, field) => {
          obj[field.name.value] = parseLiteral(field.value);
          return obj;
        }, {});
      default:
        return null;
    }
  },
});

const resolvers = {
  Date: dateScalar,
  JSON: jsonScalar,

  Query: {
    // User queries
    me: async (_, __, { user }) => {
      if (!user) throw authenticationError('Not authenticated');
      return User.findById(user.id).populate('wishlist');
    },
    
    user: async (_, { id }, { user }) => {
      if (!user) throw authenticationError('Not authenticated');
      if (user.id !== id && user.role !== 'admin') {
        throw authorizationError('Not authorized');
      }
      return User.findById(id);
    },

    // Product queries
    products: async (_, { page = 1, limit = 20, filter, sortBy, sortOrder }) => {
      const query = { status: 'active' };
      
      if (filter) {
        if (filter.category) {
          query.category = filter.category;
        }
        if (filter.minPrice || filter.maxPrice) {
          query.price = {};
          if (filter.minPrice) query.price.$gte = filter.minPrice;
          if (filter.maxPrice) query.price.$lte = filter.maxPrice;
        }
        if (filter.brand?.length) {
          query.brand = { $in: filter.brand };
        }
        if (filter.rating) {
          query.rating = { $gte: filter.rating };
        }
        if (filter.inStock) {
          query.stock = { $gt: 0 };
        }
        if (filter.tags?.length) {
          query.tags = { $in: filter.tags };
        }
      }

      const sortOptions = {};
      if (sortBy) {
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
      } else {
        sortOptions.createdAt = -1;
      }

      const skip = (page - 1) * limit;
      
      const [products, totalCount] = await Promise.all([
        Product.find(query)
          .populate('category')
          .sort(sortOptions)
          .skip(skip)
          .limit(limit),
        Product.countDocuments(query)
      ]);

      return {
        products,
        totalCount,
        pageInfo: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          hasNextPage: page * limit < totalCount,
          hasPreviousPage: page > 1
        }
      };
    },

    product: async (_, { id }) => {
      return Product.findById(id).populate('category');
    },

    productBySlug: async (_, { slug }) => {
      return Product.findOne({ slug, status: 'active' }).populate('category');
    },

    searchProducts: async (_, { query, page = 1, limit = 20 }) => {
      // Use Elasticsearch service if available
      try {
        const elasticsearch = require('../services/elasticsearch');
        const result = await elasticsearch.search(query, { page, limit });
        return result;
      } catch (error) {
        // Fallback to MongoDB text search
        const products = await Product.find({
          $text: { $search: query },
          status: 'active'
        })
        .populate('category')
        .skip((page - 1) * limit)
        .limit(limit);
      
        const totalCount = await Product.countDocuments({
          $text: { $search: query },
          status: 'active'
        });
      
        return { products, totalCount };
      }
    },

    // Category queries
    categories: async () => {
      return Category.find({ parent: null }).populate('children');
    },

    category: async (_, { id }) => {
      return Category.findById(id).populate('children');
    },

    categoryBySlug: async (_, { slug }) => {
      return Category.findOne({ slug }).populate('children');
    },

    // Cart query
    cart: async (_, __, { user }) => {
      if (!user) throw authenticationError('Not authenticated');
      return Cart.getCart(user.id);
    },

    // Order queries
    orders: async (_, { page = 1, limit = 10 }, { user }) => {
      if (!user) throw authenticationError('Not authenticated');
      
      const orders = await Order.find({ user: user.id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      
      return orders;
    },

    order: async (_, { id }, { user }) => {
      if (!user) throw authenticationError('Not authenticated');
      
      const order = await Order.findOne({ _id: id, user: user.id })
        .populate('items.product');
      
      if (!order) throw authorizationError('Order not found');
      return order;
    },

    orderByNumber: async (_, { orderNumber }, { user }) => {
      if (!user) throw authenticationError('Not authenticated');
      
      return Order.findOne({ orderNumber, user: user.id })
        .populate('items.product');
    },

    // Bundle queries
    bundles: async (_, { category }) => {
      const query = { status: 'active' };
      if (category) query.category = category;
      
      return ProductBundle.find(query)
        .populate('products.product');
    },

    bundle: async (_, { id }) => {
      return ProductBundle.findById(id).populate('products.product');
    },

    bundleBySlug: async (_, { slug }) => {
      return ProductBundle.findOne({ slug }).populate('products.product');
    },

    // Flash Sale queries
    flashSales: async () => {
      const now = new Date();
      return FlashSale.find({
        status: 'active',
        'schedule.startDate': { $lte: now },
        'schedule.endDate': { $gte: now }
      }).populate('products.product');
    },

    flashSale: async (_, { id }) => {
      return FlashSale.findById(id).populate('products.product');
    },

    // Recommendation queries
    recommendations: async (_, { limit = 10 }, { user }) => {
      const recommendationService = require('../services/recommendationService');
      
      const personalized = user 
        ? await recommendationService.getPersonalizedRecommendations(user.id, limit)
        : [];
      
      const trending = await recommendationService.getTrendingProducts(limit);
      
      const recentlyViewed = user
        ? await recommendationService.getRecentlyViewed(user.id, limit)
        : [];
      
      return {
        personalized,
        frequentlyBoughtTogether: [],
        similarProducts: [],
        trending,
        recentlyViewed
      };
    },

    // Loyalty queries
    loyaltyStatus: async (_, __, { user }) => {
      if (!user) throw authenticationError('Not authenticated');
      
      const userDoc = await User.findById(user.id).select('loyaltyPoints');
      return userDoc?.loyaltyPoints;
    },

    availableRewards: async (_, __, { user }) => {
      if (!user) throw authenticationError('Not authenticated');
      
      const Reward = require('../models/LoyaltyProgram');
      const userDoc = await User.findById(user.id).select('loyaltyPoints');
      const availablePoints = userDoc?.loyaltyPoints?.availablePoints || 0;
      
      return Reward.find({ 
        isActive: true,
        minimumPoints: { $lte: availablePoints }
      });
    }
  },

  Mutation: {
    // Auth mutations
    register: async (_, { input }) => {
      const { User } = require('../models/User');
      
      const existingUser = await User.findOne({ email: input.email.toLowerCase() });
      if (existingUser) {
        throw new Error('Email already registered');
      }
      
      const user = new User({
        ...input,
        email: input.email.toLowerCase()
      });
      await user.save();
      
      const token = user.generateAuthToken();
      const refreshToken = user.generateRefreshToken();
      await user.save();
      
      return { token, refreshToken, user };
    },

    login: async (_, { input }) => {
      const { User } = require('../models/User');
      
      const user = await User.findOne({ email: input.email.toLowerCase() });
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      const isMatch = await user.comparePassword(input.password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }
      
      const token = user.generateAuthToken();
      const refreshToken = user.generateRefreshToken();
      await user.save();
      
      return { token, refreshToken, user };
    },

    refreshToken: async (_, { refreshToken }) => {
      const { User } = require('../models/User');
      
      const user = await User.findOne({ refreshTokens: refreshToken });
      if (!user) {
        throw new Error('Invalid refresh token');
      }
      
      const token = user.generateAuthToken();
      const newRefreshToken = user.generateRefreshToken();
      user.refreshTokens = user.refreshTokens.filter(rt => rt !== refreshToken);
      user.refreshTokens.push(newRefreshToken);
      await user.save();
      
      return { token, refreshToken: newRefreshToken, user };
    },

    // User mutations
    updateProfile: async (_, args, { user }) => {
      if (!user) throw authenticationError('Not authenticated');
      
      const updatedUser = await User.findByIdAndUpdate(
        user.id,
        { $set: args },
        { new: true }
      );
      
      return updatedUser;
    },

    // Cart mutations
    addToCart: async (_, { productId, quantity }, { user }) => {
      if (!user) throw authenticationError('Not authenticated');
      
      return Cart.addItem(user.id, productId, quantity);
    },

    updateCartItem: async (_, { productId, quantity }, { user }) => {
      if (!user) throw authenticationError('Not authenticated');
      
      return Cart.updateItemQuantity(user.id, productId, quantity);
    },

    removeFromCart: async (_, { productId }, { user }) => {
      if (!user) throw authenticationError('Not authenticated');
      
      return Cart.removeItem(user.id, productId);
    },

    clearCart: async (_, __, { user }) => {
      if (!user) throw authenticationError('Not authenticated');
      
      return Cart.clear(user.id);
    },

    // Order mutations
    createOrder: async (_, { input }, { user }) => {
      if (!user) throw authenticationError('Not authenticated');
      
      return Order.createFromCart(user.id, input);
    },

    // Review mutations
    createReview: async (_, { productId, rating, title, content, images }, { user }) => {
      if (!user) throw authenticationError('Not authenticated');
      
      const { Review } = require('../models/Review');
      
      const review = new Review({
        user: user.id,
        product: productId,
        rating,
        title,
        content,
        images
      });
      
      await review.save();
      
      // Update product rating
      const reviews = await Review.find({ product: productId });
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await Product.findByIdAndUpdate(productId, { 
        rating: avgRating,
        reviewCount: reviews.length 
      });
      
      return review.populate('user');
    }
  },

  // Field resolvers
  User: {
    fullName: (user) => `${user.firstName} ${user.lastName}`,
  },

  Product: {
    inStock: (product) => product.stock > 0,
    reviewCount: async (product) => {
      const { Review } = require('../models/Review');
      return Review.countDocuments({ product: product.id });
    }
  },

  Cart: {
    itemCount: (cart) => cart.items.reduce((sum, item) => sum + item.quantity, 0),
  },

  Order: {
    timeline: (order) => {
      return Order.getTimeline(order);
    }
  },

  FlashSale: {
    timeRemaining: (flashSale) => {
      const now = new Date();
      const end = new Date(flashSale.schedule.endDate);
      const start = new Date(flashSale.schedule.startDate);
      
      if (now < start) {
        const ms = start - now;
        return {
          type: 'upcoming',
          milliseconds: ms,
          days: Math.floor(ms / (1000 * 60 * 60 * 24)),
          hours: Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((ms % (1000 * 60)) / 1000)
        };
      }
      
      if (now > end) {
        return { type: 'ended', milliseconds: 0 };
      }
      
      const ms = end - now;
      return {
        type: 'active',
        milliseconds: ms,
        days: Math.floor(ms / (1000 * 60 * 60 * 24)),
        hours: Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((ms % (1000 * 60)) / 1000)
      };
    }
  }
};

module.exports = resolvers;
