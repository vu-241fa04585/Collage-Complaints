import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH SERVICES ====================
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ==================== COMPLAINT SERVICES ====================
export const complaintService = {
  create: (formData) =>
    api.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getMyComplaints: (params) => api.get('/complaints/my', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  updateStatus: (id, data) => api.patch(`/complaints/${id}/status`, data),
  submitFeedback: (id, data) => api.post(`/complaints/${id}/feedback`, data),
  reopen: (id, data) => api.patch(`/complaints/${id}/reopen`, data),
  getHistory: (id) => api.get(`/complaints/${id}/history`),
  addComment: (id, data) => api.post(`/complaints/${id}/comments`, data),

  // Department/Staff endpoints
  getDepartmentComplaints: (params) => api.get('/complaints/department', { params }),
  acceptComplaint: (id) => api.patch(`/complaints/${id}/accept`),
  resolveComplaint: (id, formData) =>
    api.patch(`/complaints/${id}/resolve`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  forwardComplaint: (id, data) => api.patch(`/complaints/${id}/forward`, data),
};

// ==================== ADMIN SERVICES ====================
export const adminService = {
  getAllComplaints: (params) => api.get('/admin/complaints', { params }),
  assignComplaint: (id, data) => api.patch(`/admin/complaints/${id}/assign`, data),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  getReports: (params) => api.get('/admin/reports', { params }),
  downloadReport: (params) =>
    api.get('/admin/reports/download', { params, responseType: 'blob' }),
  getDashboard: () => api.get('/admin/dashboard'),

  // User management
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/toggle-status`),

  // Category management
  getCategories: () => api.get('/admin/categories'),
  getSLAConfig: () => api.get('/admin/sla-config'),
  updateSLAConfig: (data) => api.put('/admin/sla-config', data),

  // Audit logs
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),

  // Escalation
  getEscalations: (params) => api.get('/admin/escalations', { params }),
};

// ==================== DEPARTMENT SERVICES ====================
export const departmentService = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.patch(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
  getStaff: (id) => api.get(`/departments/${id}/staff`),
  getDashboard: (id) => api.get(`/departments/${id}/dashboard`),
};

// ==================== NOTIFICATION SERVICES ====================
export const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

// ==================== MANAGEMENT SERVICES ====================
export const managementService = {
  getDashboard: () => api.get('/admin/management-dashboard'),
  getPerformanceReport: (params) => api.get('/admin/performance', { params }),
};

export default api;

