import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const LoyaltyContext = createContext();

export const useLoyalty = () => {
  const context = useContext(LoyaltyContext);
  if (!context) {
    throw new Error('useLoyalty must be used within a LoyaltyProvider');
  }
  return context;
};

export const LoyaltyProvider = ({ children }) => {
  const [loyaltyStatus, setLoyaltyStatus] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLoyaltyStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/loyalty/status');
      setLoyaltyStatus(response.data);
      setError(null);
    } catch (err) {
      if (err.response?.status !== 401) {
        setError(err.response?.data?.error || 'Failed to fetch loyalty status');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRewards = async () => {
    try {
      const response = await api.get('/loyalty/rewards');
      setRewards(response.data);
    } catch (err) {
      console.error('Failed to fetch rewards:', err);
    }
  };

  const redeemReward = async (rewardId) => {
    try {
      setLoading(true);
      const response = await api.post('/loyalty/redeem', { rewardId });
      await fetchLoyaltyStatus();
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to redeem reward');
    } finally {
      setLoading(false);
    }
  };

  const previewPoints = async (orderTotal) => {
    try {
      const response = await api.post('/loyalty/preview-points', { orderTotal });
      return response.data;
    } catch (err) {
      console.error('Failed to preview points:', err);
      return null;
    }
  };

  const applyPointsDiscount = async (points) => {
    try {
      const response = await api.post('/loyalty/apply-discount', { pointsToApply: points });
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to apply points');
    }
  };

  const getTierBenefits = (tier) => {
    const benefits = {
      bronze: {
        multiplier: 1,
        perks: ['Earn 1 point per $1 spent', 'Birthday bonus: 100 points'],
        nextTier: 'Silver',
        pointsToNext: 1000
      },
      silver: {
        multiplier: 1.25,
        perks: ['Earn 1.25 points per $1 spent', 'Birthday bonus: 200 points', '5% off on orders over $50'],
        nextTier: 'Gold',
        pointsToNext: 4000
      },
      gold: {
        multiplier: 1.5,
        perks: ['Earn 1.5 points per $1 spent', 'Birthday bonus: 300 points', '10% off on orders', 'Free shipping on orders over $75'],
        nextTier: 'Platinum',
        pointsToNext: 10000
      },
      platinum: {
        multiplier: 2,
        perks: ['Earn 2 points per $1 spent', 'Birthday bonus: 500 points', '15% off on orders', 'Free expedited shipping', 'Early access to sales'],
        nextTier: 'Diamond',
        pointsToNext: 35000
      },
      diamond: {
        multiplier: 3,
        perks: ['Earn 3 points per $1 spent', 'Birthday bonus: 1000 points', '20% off on orders', 'Free express shipping', 'VIP customer support', 'Exclusive products access'],
        nextTier: null,
        pointsToNext: 0
      }
    };
    return benefits[tier] || benefits.bronze;
  };

  useEffect(() => {
    fetchLoyaltyStatus();
    fetchRewards();
  }, []);

  const value = {
    loyaltyStatus,
    rewards,
    loading,
    error,
    fetchLoyaltyStatus,
    redeemReward,
    previewPoints,
    applyPointsDiscount,
    getTierBenefits
  };

  return (
    <LoyaltyContext.Provider value={value}>
      {children}
    </LoyaltyContext.Provider>
  );
};

export default LoyaltyContext;
