// Centralized Admin API Client for Sri Manikanta Sai General Store

const TOKEN_KEY = 'sms_admin_token';
const ADMIN_USER_KEY = 'sms_admin_user';

const DEFAULT_PROD_API = 'https://grocery-k0jb.onrender.com';

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && 
   window.location.hostname && 
   !window.location.hostname.includes('localhost') && 
   !window.location.hostname.includes('127.0.0.1')
    ? DEFAULT_PROD_API
    : '');

function buildApiUrl(endpoint) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  if (API_BASE_URL) {
    const cleanBase = API_BASE_URL.replace(/\/+$/, '');
    if (cleanBase.endsWith('/api')) {
      return cleanBase + cleanEndpoint;
    }
    return cleanBase + '/api' + cleanEndpoint;
  }
  return '/api' + cleanEndpoint;
}

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
  },
  getUser: () => {
    try {
      const u = localStorage.getItem(ADMIN_USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user))
};

async function request(endpoint, options = {}) {
  const token = authStorage.getToken();
  const headers = {
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-access-token'] = token;
  }

  // Only set Content-Type if not sending FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(buildApiUrl(endpoint), {
    ...options,
    headers
  });

  if (res.status === 401 || res.status === 403) {
    // Session expired or invalid
    if (token) {
      authStorage.removeToken();
      window.dispatchEvent(new Event('sms_admin_auth_changed'));
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Authentication required or session expired.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(data.error || 'The authentication service could not be reached (404 Not Found). Please verify backend connectivity.');
    }
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      throw new Error(data.error || 'Backend service is starting up on Render. Please wait 10 seconds and try again.');
    }
    throw new Error(data.error || ('Request failed with status ' + res.status));
  }

  return data;
}

export const adminApi = {
  // Auth
  login: async (email, password) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) {
      authStorage.setToken(data.token);
      authStorage.setUser(data.admin);
      window.dispatchEvent(new Event('sms_admin_auth_changed'));
    }
    return data;
  },
  verify: () => request('/auth/verify'),
  changePassword: (currentPassword, newPassword) =>
    request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    }),

  // Stats
  getStats: () => request('/stats'),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ''}`);
  },
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (product) =>
    request('/products', {
      method: 'POST',
      body: JSON.stringify(product)
    }),
  updateProduct: (id, updates) =>
    request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),
  deleteProduct: (id) =>
    request(`/products/${id}`, {
      method: 'DELETE'
    }),
  bulkUpdateProducts: (action, productIds, payload) =>
    request('/products/bulk', {
      method: 'POST',
      body: JSON.stringify({ action, productIds, payload })
    }),

  // Categories
  getCategories: () => request('/categories'),
  createCategory: (cat) =>
    request('/categories', {
      method: 'POST',
      body: JSON.stringify(cat)
    }),
  updateCategory: (id, updates) =>
    request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),
  deleteCategory: (id) =>
    request(`/categories/${id}`, {
      method: 'DELETE'
    }),

  // Inventory
  adjustStock: (productId, change, reason, unit) =>
    request('/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify({ productId, change, reason, unit })
    }),
  getInventoryLogs: () => request('/inventory/logs'),

  // Orders
  getOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/orders${query ? `?${query}` : ''}`);
  },
  updateOrderStatus: (id, status, paymentStatus, cancelReason) =>
    request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, paymentStatus, cancelReason })
    }),

  // Customers
  getCustomers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/customers${query ? `?${query}` : ''}`);
  },

  // Coupons
  getCoupons: () => request('/coupons'),
  createCoupon: (coupon) =>
    request('/coupons', {
      method: 'POST',
      body: JSON.stringify(coupon)
    }),
  deleteCoupon: (id) =>
    request(`/coupons/${id}`, {
      method: 'DELETE'
    }),

  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (settings) =>
    request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }),

  // Logs
  getLogs: () => request('/logs'),

  // Image Upload
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const data = await request('/upload', {
      method: 'POST',
      body: formData
    });
    if (data && data.imageUrl && !data.imageUrl.startsWith('http')) {
      const base = API_BASE_URL || (typeof window !== 'undefined' && !window.location.hostname.includes('localhost') ? DEFAULT_PROD_API : '');
      if (base) {
        data.imageUrl = `${base}${data.imageUrl}`;
      }
    }
    return data;
  }
};
