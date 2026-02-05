/**
 * Loyalty Program Routes
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { Reward, Redemption, TIER_THRESHOLDS, POINTS_RULES, loyaltyPointsSchema } = require('../models/LoyaltyProgram');
const auth = require('../middleware/auth');

// Get user's loyalty status
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+loyaltyPoints');
    
    if (!user.loyaltyPoints) {
      // Initialize loyalty points for user
      user.loyaltyPoints = {
        totalPoints: 0,
        availablePoints: 0,
        lifetimePoints: 0,
        tier: 'bronze',
        tierProgress: 0,
        pointsHistory: []
      };
      await user.save();
    }
    
    // Calculate progress to next tier
    const currentTier = user.loyaltyPoints.tier;
    const nextTier = getNextTier(currentTier);
    let progress = 0;
    
    if (nextTier) {
      const currentThreshold = TIER_THRESHOLDS[currentTier];
      const nextThreshold = TIER_THRESHOLDS[nextTier];
      const pointsInTier = user.loyaltyPoints.lifetimePoints - currentThreshold;
      const tierRange = nextThreshold - currentThreshold;
      progress = Math.min(Math.round((pointsInTier / tierRange) * 100), 100);
    }
    
    res.json({
      ...user.loyaltyPoints.toObject(),
      nextTier,
      progress,
      rules: POINTS_RULES
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available rewards
router.get('/rewards', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('loyaltyPoints');
    const availablePoints = user.loyaltyPoints?.availablePoints || 0;
    
    const rewards = await Reward.find({ 
      isActive: true,
      minimumPoints: { $lte: availablePoints }
    });
    
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Redeem a reward
router.post('/redeem', auth, async (req, res) => {
  try {
    const { rewardId } = req.body;
    
    const user = await User.findById(req.user.id).select('+loyaltyPoints');
    const reward = await Reward.findById(rewardId);
    
    if (!reward || !reward.isActive) {
      return res.status(404).json({ error: 'Reward not found or not active' });
    }
    
    if (user.loyaltyPoints.availablePoints < reward.minimumPoints) {
      return res.status(400).json({ error: 'Insufficient points' });
    }
    
    // Generate discount code
    const code = `LOYALTY-${Date.now().toString(36).toUpperCase()}`;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 3); // 3 months expiry
    
    // Create redemption
    const redemption = new Redemption({
      user: user._id,
      reward: reward._id,
      pointsSpent: reward.minimumPoints,
      discountApplied: reward.type === 'percentage_discount' 
        ? reward.value 
        : reward.type === 'fixed_discount' ? reward.value : 0,
      code,
      expiresAt
    });
    
    // Update user points
    user.loyaltyPoints.availablePoints -= reward.minimumPoints;
    user.loyaltyPoints.pointsHistory.push({
      points: -reward.minimumPoints,
      type: 'redeem',
      description: `Redeemed: ${reward.name}`,
      orderId: null
    });
    
    await user.save();
    await redemption.save();
    
    res.json({
      redemption,
      message: 'Reward redeemed successfully',
      discountCode: code
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get redemption history
router.get('/redemptions', auth, async (req, res) => {
  try {
    const redemptions = await Redemption.find({ user: req.user.id })
      .populate('reward', 'name type value')
      .sort({ createdAt: -1 });
    
    res.json(redemptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate points for an order (preview)
router.post('/preview-points', auth, async (req, res) => {
  try {
    const { orderTotal } = req.body;
    const user = await User.findById(req.user.id).select('loyaltyPoints');
    
    const multiplier = POINTS_RULES.perDollarSpentMultiplier[user.loyaltyPoints?.tier || 'bronze'];
    const pointsEarned = Math.floor(orderTotal * POINTS_RULES.perDollarSpent * multiplier);
    
    const nextTier = getNextTier(user.loyaltyPoints?.tier || 'bronze');
    const pointsNeeded = nextTier 
      ? TIER_THRESHOLDS[nextTier] - (user.loyaltyPoints?.lifetimePoints || 0) 
      : 0;
    
    res.json({
      pointsEarned,
      multiplier,
      currentTier: user.loyaltyPoints?.tier || 'bronze',
      nextTier,
      pointsToNextTier: pointsNeeded
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Apply points as discount
router.post('/apply-discount', auth, async (req, res) => {
  try {
    const { pointsToApply, orderTotal } = req.body;
    const user = await User.findById(req.user.id).select('+loyaltyPoints');
    
    if (!user.loyaltyPoints || user.loyaltyPoints.availablePoints < pointsToApply) {
      return res.status(400).json({ error: 'Insufficient points' });
    }
    
    // 100 points = $1 discount
    const discountAmount = pointsToApply / 100;
    
    if (discountAmount > orderTotal * 0.5) {
      return res.status(400).json({ error: 'Maximum 50% discount allowed' });
    }
    
    res.json({
      pointsToApply,
      discountAmount,
      pointsRemaining: user.loyaltyPoints.availablePoints - pointsToApply
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tier benefits
router.get('/tiers', async (req, res) => {
  try {
    const tiers = Object.entries(TIER_THRESHOLDS).map(([tier, threshold]) => ({
      tier,
      minimumPoints: threshold,
      multiplier: POINTS_RULES.perDollarSpentMultiplier[tier],
      benefits: {
        pointsMultiplier: POINTS_RULES.perDollarSpentMultiplier[tier],
        bonusPoints: POINTS_RULES[`${tier}Bonus`] || 0
      }
    }));
    
    res.json(tiers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to get next tier
function getNextTier(currentTier) {
  const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
  const currentIndex = tiers.indexOf(currentTier);
  return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
}

module.exports = router;
