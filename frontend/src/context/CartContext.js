import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], subtotal: 0, discount: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Fetch cart on mount and when auth changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // For guest users, use localStorage
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '{"items":[]}');
      setCart({ ...guestCart, subtotal: 0, discount: 0, total: 0 });
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      setCart(response.data.data || { items: [], subtotal: 0, discount: 0, total: 0 });
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    }
  };

  const addToCart = async (product, quantity = 1, variant = null) => {
    try {
      setLoading(true);
      
      if (isAuthenticated) {
        const response = await api.post('/cart/items', { productId: product._id, quantity, variant });
        setCart(response.data.data);
        toast.success('Added to cart');
      } else {
        // Guest cart
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '{"items":[]}');
        const existingIndex = guestCart.items.findIndex(
          item => item.product._id === product._id && JSON.stringify(item.variant) === JSON.stringify(variant)
        );

        if (existingIndex > -1) {
          guestCart.items[existingIndex].quantity += quantity;
        } else {
          guestCart.items.push({ product, quantity, variant, addedAt: new Date() });
        }

        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        setCart({ items: guestCart.items, subtotal: 0, discount: 0, total: 0 });
        toast.success('Added to cart');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      setLoading(true);
      const response = await api.put(`/cart/items/${itemId}`, { quantity });
      setCart(response.data.data);
      toast.success('Cart updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      const response = await api.delete(`/cart/items/${itemId}`);
      setCart(response.data.data);
      toast.success('Removed from cart');
    } catch (err) {
      // For guest users
      if (!isAuthenticated) {
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '{"items":[]}');
        guestCart.items = guestCart.items.filter((_, i) => i !== parseInt(itemId));
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        setCart({ items: guestCart.items, subtotal: 0, discount: 0, total: 0 });
        toast.success('Removed from cart');
      } else {
        toast.error('Failed to remove');
      }
    } finally {
      setLoading(false);
    }
  };

  const saveForLater = async (itemId) => {
    try {
      const response = await api.post(`/cart/save-for-later/${itemId}`);
      setCart(response.data.data);
    } catch (err) {
      toast.error('Failed to save for later');
    }
  };

  const moveToCart = async (itemId) => {
    try {
      const response = await api.post(`/cart/move-to-cart/${itemId}`);
      setCart(response.data.data);
    } catch (err) {
      toast.error('Failed to move to cart');
    }
  };

  const applyCoupon = async (code, discount, type) => {
    try {
      const response = await api.post('/cart/apply-coupon', { code, discount, type });
      setCart(response.data.data);
      toast.success('Coupon applied');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    }
  };

  const removeCoupon = async () => {
    try {
      await api.delete('/cart/coupon');
      setCart(prev => ({ ...prev, coupon: null }));
      toast.success('Coupon removed');
    } catch (err) {
      toast.error('Failed to remove coupon');
    }
  };

  const clearCart = async () => {
    try {
      if (isAuthenticated) {
        await api.delete('/cart');
      } else {
        localStorage.removeItem('guestCart');
      }
      setCart({ items: [], subtotal: 0, discount: 0, total: 0 });
    } catch (err) {
      toast.error('Failed to clear cart');
    }
  };

  const getCartCount = () => {
    return cart.items.filter(item => !item.savedForLater).reduce((sum, item) => sum + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cart.items
      .filter(item => !item.savedForLater)
      .reduce((sum, item) => sum + (item.product?.price || item.price) * item.quantity, 0);
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    saveForLater,
    moveToCart,
    applyCoupon,
    removeCoupon,
    clearCart,
    fetchCart,
    getCartCount,
    getCartTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
