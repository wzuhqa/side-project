import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export const apiMethods = {
  // Products
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (idOrSlug) => api.get(`/products/${idOrSlug}`),
  getFeaturedProducts: () => api.get('/products/featured'),
  getBestSellers: () => api.get('/products/best-sellers'),
  getNewArrivals: () => api.get('/products/new-arrivals'),
  getRelatedProducts: (productId) => api.get(`/products/related/${productId}`),
  getBrands: () => api.get('/products/brands'),
  
  // Categories
  getCategories: () => api.get('/categories'),
  getCategory: (slug) => api.get(`/categories/${slug}`),
  
  // Cart
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity, variant) => api.post('/cart/items', { productId, quantity, variant }),
  updateCartItem: (itemId, quantity) => api.put(`/cart/items/${itemId}`, { quantity }),
  removeFromCart: (itemId) => api.delete(`/cart/items/${itemId}`),
  saveForLater: (itemId) => api.post(`/cart/save-for-later/${itemId}`),
  moveToCart: (itemId) => api.post(`/cart/move-to-cart/${itemId}`),
  applyCoupon: (coupon) => api.post('/cart/apply-coupon', coupon),
  removeCoupon: () => api.delete('/cart/coupon'),
  clearCart: () => api.delete('/cart'),
  
  // Orders
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (orderData) => api.post('/orders', orderData),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
  
  // Payments
  createPaymentIntent: (orderId, amount) => api.post('/payments/create-intent', { orderId, amount }),
  confirmPayment: (orderId, paymentIntentId) => api.post('/payments/confirm', { orderId, paymentIntentId }),
  getPaymentMethods: () => api.get('/payments/methods'),
  
  // Reviews
  getProductReviews: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  createReview: (reviewData) => api.post('/reviews', reviewData),
  updateReview: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  markReviewHelpful: (id) => api.post(`/reviews/${id}/helpful`),
  
  // User
  getProfile: () => api.get('/users/me'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  changePassword: (passwords) => api.put('/users/password', passwords),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (address) => api.post('/users/addresses', address),
  updateAddress: (id, address) => api.put(`/users/addresses/${id}`, address),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  getWishlist: () => api.get('/users/wishlist'),
  addToWishlist: (productId) => api.post(`/users/wishlist/${productId}`),
  removeFromWishlist: (productId) => api.delete(`/users/wishlist/${productId}`),
  
  // Newsletter
  subscribeNewsletter: (email) => api.post('/newsletter/subscribe', { email }),
  unsubscribeNewsletter: (email) => api.delete('/newsletter/unsubscribe', { data: { email } }),
  
  // Admin
  getDashboard: () => api.get('/analytics/dashboard'),
  getSalesAnalytics: (params) => api.get('/analytics/sales', { params }),
  getProductAnalytics: (params) => api.get('/analytics/products', { params }),
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  getAllOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  getCustomers: (params) => api.get('/admin/customers', { params }),
};

export default api;
