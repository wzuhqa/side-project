import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CompareContext = createContext(null);
const MAX_COMPARE_ITEMS = 4;
const COMPARE_STORAGE_KEY = 'shop_compare';

export function CompareProvider({ children }) {
  const [compareItems, setCompareItems] = useState(() => {
    try {
      const saved = localStorage.getItem(COMPARE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(compareItems));
    } catch (error) {
      console.error('Failed to save compare items:', error);
    }
  }, [compareItems]);

  const addToCompare = useCallback((product) => {
    const productId = product._id || product.id;
    
    if (!productId) {
      toast.error('Invalid product');
      return { success: false, error: 'Invalid product' };
    }

    if (compareItems.some(item => (item._id || item.id) === productId)) {
      toast.error('Product already in comparison');
      return { success: false, error: 'Already added' };
    }

    if (compareItems.length >= MAX_COMPARE_ITEMS) {
      toast.error(`Maximum ${MAX_COMPARE_ITEMS} products can be compared`);
      return { success: false, error: 'Maximum reached' };
    }

    setCompareItems(prev => [...prev, product]);
    toast.success('Added to comparison');
    return { success: true };
  }, [compareItems]);

  const removeFromCompare = useCallback((productId) => {
    setCompareItems(prev => prev.filter(item => (item._id || item.id) !== productId));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareItems([]);
    toast.success('Comparison cleared');
  }, []);

  const isInCompare = useCallback((productId) => {
    return compareItems.some(item => (item._id || item.id) === productId);
  }, [compareItems]);

  const getCompareCount = useCallback(() => {
    return compareItems.length;
  }, [compareItems]);

  const canAddMore = useCallback(() => {
    return compareItems.length < MAX_COMPARE_ITEMS;
  }, [compareItems]);

  const fetchCompareProducts = useCallback(async () => {
    if (compareItems.length === 0) return [];
    
    setLoading(true);
    try {
      const ids = compareItems.map(item => item._id || item.id).join(',');
      const response = await api.get(`/products/compare?ids=${ids}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch compare products:', error);
      return compareItems;
    } finally {
      setLoading(false);
    }
  }, [compareItems]);

  const value = {
    compareItems,
    loading,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    getCompareCount,
    canAddMore,
    fetchCompareProducts,
    MAX_COMPARE_ITEMS
  };

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}

export default CompareContext;
