import axiosInstance from './axiosConfig';

export const authAPI = {
  register: (userData) => axiosInstance.post('/auth/register', userData),
  login: (credentials) => axiosInstance.post('/auth/login', credentials),
  getProfile: () => axiosInstance.get('/auth/profile'),
};

export const productsAPI = {
  getAll: (params = {}) => axiosInstance.get('/products', { params }),
  getById: (id) => axiosInstance.get(`/products/${id}`),
  getFeatured: () => axiosInstance.get('/products/featured/list'),
  search: (query, filters = {}) => axiosInstance.get('/products', { 
    params: { search: query, ...filters } 
  }),
};

export const categoriesAPI = {
  getAll: () => axiosInstance.get('/categories'),
};

export const cartAPI = {
  getCart: () => axiosInstance.get('/cart'),
  addItem: (productId, quantity = 1) => axiosInstance.post('/cart/items', { 
    product_id: productId, 
    quantity 
  }),
  updateItem: (itemId, quantity) => axiosInstance.put(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId) => axiosInstance.delete(`/cart/items/${itemId}`),
  clearCart: () => axiosInstance.delete('/cart'),
};

export const ordersAPI = {
  getOrders: (params = {}) => axiosInstance.get('/orders', { params }),
  getOrderById: (id) => axiosInstance.get(`/orders/${id}`),
  createOrder: (orderData) => axiosInstance.post('/orders', orderData),
  cancelOrder: (id) => axiosInstance.put(`/orders/${id}/cancel`),
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

export const getAuthToken = () => localStorage.getItem('token');
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const setAuthData = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => !!getAuthToken();