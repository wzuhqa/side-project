/**
 * Loyalty Program Models
 * Points, tiers, rewards, and redemptions
 */

const mongoose = require('mongoose');

// Loyalty Points Schema (embedded in User)
const loyaltyPointsSchema = new mongoose.Schema({
  totalPoints: { type: Number, default: 0 },
  availablePoints: { type: Number, default: 0 },
  lifetimePoints: { type: Number, default: 0 },
  tier: { 
    type: String, 
    enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    default: 'bronze'
  },
  tierProgress: { type: Number, default: 0 }, // Progress to next tier (0-100)
  lastEarnedDate: { type: Date },
  pointsHistory: [{
    points: Number, // Positive for earned, negative for redeemed
    type: { type: String, enum: ['earn', 'redeem', 'expire', 'bonus', 'refund'] },
    description: String,
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    createdAt: { type: Date, default: Date.now }
  }]
});

// Reward Schema
const rewardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  type: { 
    type: String, 
    enum: ['percentage_discount', 'fixed_discount', 'free_shipping', 'free_product', 'points_multiplier'],
    required: true 
  },
  value: { type: Number, required: true }, // Discount amount or multiplier
  minimumPoints: { type: Number, required: true },
  minimumPurchase: { type: Number, default: 0 },
  maximumDiscount: Number,
  expiresAt: Date,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Tier Benefits Schema
const tierBenefitSchema = new mongoose.Schema({
  tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'], required: true },
  pointsMultiplier: { type: Number, default: 1 },
  discountPercentage: { type: Number, default: 0 },
  freeShippingThreshold: { type: Number, default: 0 },
  birthdayBonus: { type: Number, default: 0 },
  earlyAccess: { type: Boolean, default: false },
  exclusiveRewards: [String],
  minimumPurchaseAmount: { type: Number, default: 0 }
});

// Redemption Schema
const redemptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reward: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward', required: true },
  pointsSpent: { type: Number, required: true },
  discountApplied: { type: Number, default: 0 },
  code: { type: String, required: true }, // Discount code generated
  status: { 
    type: String, 
    enum: ['pending', 'active', 'used', 'expired'],
    default: 'pending'
  },
  expiresAt: Date,
  usedAt: Date,
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  createdAt: { type: Date, default: Date.now }
});

// Export models
const LoyaltyPoints = mongoose.model('LoyaltyPoints', loyaltyPointsSchema);
const Reward = mongoose.model('Reward', rewardSchema);
const TierBenefit = mongoose.model('TierBenefit', tierBenefitSchema);
const Redemption = mongoose.model('Redemption', redemptionSchema);

// Tier thresholds (points required)
const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 1000,
  gold: 5000,
  platinum: 15000,
  diamond: 50000
};

// Points earning rules
const POINTS_RULES = {
  perDollarSpent: 1, // 1 point per $1 spent
  perDollarSpentMultiplier: {
    bronze: 1,
    silver: 1.25,
    gold: 1.5,
    platinum: 2,
    diamond: 3
  },
  signupBonus: 100,
  reviewBonus: 50,
  referralBonus: 500,
  birthdayBonus: 200
};

module.exports = {
  LoyaltyPoints,
  Reward,
  TierBenefit,
  Redemption,
  TIER_THRESHOLDS,
  POINTS_RULES,
  loyaltyPointsSchema
};
