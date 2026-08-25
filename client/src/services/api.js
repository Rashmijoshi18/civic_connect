import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('civicconnect_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiry and auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage
      localStorage.removeItem('civicconnect_token');
      localStorage.removeItem('civicconnect_user');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ─── Problems API ─────────────────────────────────────────────────────────────
export const problemsAPI = {
  getAll: (params) => api.get('/problems', { params }),
  getById: (id) => api.get(`/problems/${id}`),
  create: (formData) => api.post('/problems', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/problems/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/problems/${id}`),
};

// ─── Solutions API ────────────────────────────────────────────────────────────
export const solutionsAPI = {
  getByProblem: (problemId) => api.get(`/problems/${problemId}/solutions`),
  create: (problemId, formData) => api.post(`/problems/${problemId}/solutions`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  vote: (solutionId) => api.post(`/solutions/${solutionId}/vote`),
  update: (id, data) => api.put(`/solutions/${id}`, data),
};

// ─── Users API ────────────────────────────────────────────────────────────────
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getStats: () => api.get('/users/stats'),
  getMyProblems: (params) => api.get('/users/my-problems', { params }),
  getMySolutions: (params) => api.get('/users/my-solutions', { params }),
  getOrgDashboard: () => api.get('/users/org/dashboard'),
};

// ─── Admin API ────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, isActive) => api.put(`/admin/users/${id}/status`, { isActive }),
  verifyProblem: (id, action, note) => api.put(`/admin/problems/${id}/verify`, { action, note }),
  updateProblemStatus: (id, data) => api.put(`/admin/problems/${id}/status`, data),
  getSolutions: (params) => api.get('/admin/solutions', { params }),
  updateSolutionStatus: (id, status) => api.put(`/admin/solutions/${id}/status`, { status }),
};

export default api;
