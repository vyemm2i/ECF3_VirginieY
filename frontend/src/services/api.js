import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Instance Axios configurée
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medibook_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('medibook_token');
      localStorage.removeItem('medibook_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// Services d'authentification
// ============================================
export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('medibook_token', response.data.token);
      localStorage.setItem('medibook_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('medibook_token', response.data.token);
      localStorage.setItem('medibook_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('medibook_token');
    localStorage.removeItem('medibook_user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('medibook_user');
    return user ? JSON.parse(user) : null;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  }
};

// ============================================
// Services des praticiens
// ============================================
export const practitionerService = {
  search: async (params = {}) => {
    const response = await api.get('/practitioners', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/practitioners/${id}`);
    return response.data;
  },

  getSlots: async (id, params = {}) => {
    const response = await api.get(`/practitioners/${id}/slots`, { params });
    return response.data;
  }
};

// ============================================
// Services des rendez-vous
// ============================================
export const appointmentService = {
  getAll: async (params = {}) => {
    const response = await api.get('/appointments', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  create: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  cancel: async (id, reason) => {
    const response = await api.put(`/appointments/${id}/cancel`, { reason });
    return response.data;
  },

  complete: async (id, notes) => {
    const response = await api.put(`/appointments/${id}/complete`, { notes });
    return response.data;
  }
};

// ============================================
// Services des spécialités
// ============================================
export const specialtyService = {
  getAll: async () => {
    const response = await api.get('/specialties');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/specialties/${id}`);
    return response.data;
  }
};

// ============================================
// Services utilisateur
// ============================================
export const userService = {
  updateProfile: async (data) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/users/password', { currentPassword, newPassword });
    return response.data;
  }
};

// ============================================
// Services des notifications
// ============================================
export const notificationService = {
  getAll: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  }
};

export default api;
