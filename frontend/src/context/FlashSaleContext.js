import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const FlashSaleContext = createContext();

export const useFlashSale = () => {
  const context = useContext(FlashSaleContext);
  if (!context) {
    throw new Error('useFlashSale must be used within a FlashSaleProvider');
  }
  return context;
};

export const FlashSaleProvider = ({ children }) => {
  const [flashSales, setFlashSales] = useState([]);
  const [activeSale, setActiveSale] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({});
  const [error, setError] = useState(null);

  const fetchFlashSales = async () => {
    try {
      setLoading(true);
      const response = await api.get('/flash-sales');
      setFlashSales(response.data.flashSales);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch flash sales');
    } finally {
      setLoading(false);
    }
  };

  const fetchFlashSaleStatus = async (saleId) => {
    try {
      const response = await api.get(`/flash-sales/${saleId}/status`);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch flash sale status:', err);
      return null;
    }
  };

  const reserveStock = async (saleId, productId, quantity = 1) => {
    try {
      const response = await api.post(`/flash-sales/${saleId}/reserve`, {
        productId,
        quantity
      });
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to reserve stock');
    }
  };

  const calculateTimeRemaining = useCallback((endDate) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) {
      return { type: 'ended', days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      type: 'active',
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      milliseconds: diff
    };
  }, []);

  useEffect(() => {
    fetchFlashSales();
  }, []);

  useEffect(() => {
    if (!flashSales.length) return;

    const updateTimers = () => {
      const timers = {};
      flashSales.forEach(sale => {
        timers[sale._id] = calculateTimeRemaining(sale.schedule.endDate);
      });
      setTimeRemaining(timers);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);

    return () => clearInterval(interval);
  }, [flashSales, calculateTimeRemaining]);

  const getStockPercentage = (stock, soldCount) => {
    const total = stock + soldCount;
    if (total === 0) return 0;
    return Math.round((soldCount / total) * 100);
  };

  const value = {
    flashSales,
    activeSale,
    setActiveSale,
    loading,
    timeRemaining,
    error,
    fetchFlashSales,
    fetchFlashSaleStatus,
    reserveStock,
    getStockPercentage,
    calculateTimeRemaining
  };

  return (
    <FlashSaleContext.Provider value={value}>
      {children}
    </FlashSaleContext.Provider>
  );
};

export default FlashSaleContext;
