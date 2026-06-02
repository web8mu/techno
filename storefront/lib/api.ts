import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  withCredentials: true,
  headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
});

// Add session token header for guest cart
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('cart_session_token');
    if (token) config.headers['X-Cart-Session-Token'] = token;
  }
  return config;
});

export const catalogApi = {
  getProducts: (params?: Record<string, any>) => api.get('/api/v1/products', { params }),
  getProduct: (slug: string) => api.get(`/api/v1/products/${slug}`),
  getCategories: () => api.get('/api/v1/categories'),
  getBrands: () => api.get('/api/v1/brands'),
  getPublicSettings: () => api.get('/api/v1/settings/public'),
};

export const cartApi = {
  getCart: () => api.get('/api/v1/cart'),
  addItem: (product_id: number, qty: number) => api.post('/api/v1/cart/items', { product_id, qty }),
  updateItem: (id: number, qty: number) => api.put(`/api/v1/cart/items/${id}`, { qty }),
  removeItem: (id: number) => api.delete(`/api/v1/cart/items/${id}`),
  clearCart: () => api.delete('/api/v1/cart'),
  applyCoupon: (code: string) => api.post('/api/v1/cart/coupon', { code }),
  removeCoupon: () => api.delete('/api/v1/cart/coupon'),
  mergeCart: (session_token: string) => api.post('/api/v1/cart/merge', { session_token }),
};

export const authApi = {
  register: (data: any) => api.post('/api/v1/auth/register', data),
  login: (email: string, password: string) => api.post('/api/v1/auth/login', { email, password }),
  logout: () => api.post('/api/v1/auth/logout'),
  me: () => api.get('/api/v1/auth/me'),
  forgotPassword: (email: string) => api.post('/api/v1/auth/forgot-password', { email }),
  resetPassword: (data: any) => api.post('/api/v1/auth/reset-password', data),
};

export const checkoutApi = {
  placeOrder: (data: any) => api.post('/api/v1/checkout', data),
};

export const orderApi = {
  getOrder: (orderNumber: string, email: string) => api.get(`/api/v1/orders/${orderNumber}`, { params: { email } }),
  getMyOrders: () => api.get('/api/v1/orders'),
  uploadProof: (orderNumber: string, file: File) => {
    const form = new FormData();
    form.append('proof', file);
    return api.post(`/api/v1/orders/${orderNumber}/proof`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

// --- Dashboard (authenticated) ---
export const dashboardApi = {
  getProfile: () => api.get('/api/v1/me'),
  updateProfile: (data: any) => api.patch('/api/v1/me', data),
  changePassword: (data: any) => api.post('/api/v1/me/password', data),
  getOrders: (page = 1) => api.get('/api/v1/me/orders', { params: { page } }),
  getOrder: (orderNumber: string) => api.get(`/api/v1/me/orders/${orderNumber}`),
  downloadInvoice: (orderNumber: string) => api.get(`/api/v1/me/orders/${orderNumber}/invoice`, { responseType: 'blob' }),
  reorder: (orderNumber: string) => api.post(`/api/v1/me/orders/${orderNumber}/reorder`),
  getAddresses: () => api.get('/api/v1/me/addresses'),
  createAddress: (data: any) => api.post('/api/v1/me/addresses', data),
  updateAddress: (id: number, data: any) => api.put(`/api/v1/me/addresses/${id}`, data),
  deleteAddress: (id: number) => api.delete(`/api/v1/me/addresses/${id}`),
};

// --- Reviews ---
export const reviewApi = {
  getReviews: (slug: string, page = 1) => api.get(`/api/v1/products/${slug}/reviews`, { params: { page } }),
  submitReview: (slug: string, data: any) => api.post(`/api/v1/products/${slug}/reviews`, data),
};

// --- Newsletter ---
export const newsletterApi = {
  subscribe: (email: string, name?: string) => api.post('/api/v1/newsletter/subscribe', { email, name }),
};

// --- CMS ---
export const cmsApi = {
  getHomepageData: () => api.get('/api/v1/cms/homepage'),
  getPage: (slug: string) => api.get(`/api/v1/cms/pages/${slug}`),
  getServices: () => api.get('/api/v1/cms/services'),
  getFaqs: () => api.get('/api/v1/cms/faqs'),
  submitContact: (data: any) => api.post('/api/v1/cms/contact', data),
};

export default api;
