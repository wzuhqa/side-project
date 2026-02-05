import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const PriceAlertContext = createContext(null);

export function PriceAlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/price-alerts');
      setAlerts(response.data.data || []);
      setCount(response.data.data?.length || 0);
    } catch (error) {
      console.error('Failed to fetch price alerts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const createAlert = useCallback(async (productId, targetPrice, type = 'price_drop') => {
    try {
      const response = await api.post('/price-alerts', {
        productId,
        targetPrice,
        type
      });
      
      setAlerts(prev => [...prev, response.data.data]);
      setCount(prev => prev + 1);
      toast.success('Price alert created!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create alert';
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  const updateAlert = useCallback(async (alertId, data) => {
    try {
      const response = await api.put(`/price-alerts/${alertId}`, data);
      setAlerts(prev => prev.map(a => a._id === alertId ? response.data.data : a));
      toast.success('Alert updated');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update';
      return { success: false, error: message };
    }
  }, []);

  const deleteAlert = useCallback(async (alertId) => {
    try {
      await api.delete(`/price-alerts/${alertId}`);
      setAlerts(prev => prev.filter(a => a._id !== alertId));
      setCount(prev => Math.max(0, prev - 1));
      toast.success('Alert deleted');
      return { success: true };
    } catch (error) {
      toast.error('Failed to delete alert');
      return { success: false };
    }
  }, []);

  const checkAlertExists = useCallback((productId) => {
    return alerts.some(a => a.product?._id === productId && a.status === 'active');
  }, [alerts]);

  const getAlertForProduct = useCallback((productId) => {
    return alerts.find(a => a.product?._id === productId && a.status === 'active');
  }, [alerts]);

  const value = {
    alerts,
    loading,
    count,
    fetchAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    checkAlertExists,
    getAlertForProduct
  };

  return (
    <PriceAlertContext.Provider value={value}>
      {children}
    </PriceAlertContext.Provider>
  );
}

export function usePriceAlert() {
  const context = useContext(PriceAlertContext);
  if (!context) {
    throw new Error('usePriceAlert must be used within a PriceAlertProvider');
  }
  return context;
}

export default PriceAlertContext;
