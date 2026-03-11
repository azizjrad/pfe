import axios from "axios";

// Get API URL from environment variable (fallback to localhost for development)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Configure axios instance with authentication settings
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // Enable credentials to allow HttpOnly cookie transmission for security
  withCredentials: true,
});

// Request interceptor - kept for compatibility but no longer adds Authorization header
// With HttpOnly cookies, the browser automatically sends auth_token with each request
api.interceptors.request.use(
  (config) => {
    // Token is automatically sent via HttpOnly cookie (immune to XSS attacks)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - handles authentication errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Cookie expired or invalid - clear user data and redirect to login
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ==================== Authentication Services ====================

export const authService = {
  /**
   * Register a new user
   * Token is stored in HttpOnly cookie by backend, only user data stored locally
   */
  register: async (userData) => {
    const response = await api.post("/register", userData);
    // Store user data in localStorage for immediate UI access (non-sensitive data only)
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Login user
   * Token is stored in HttpOnly cookie by backend with dynamic expiration
   */
  login: async (credentials) => {
    const response = await api.post("/login", credentials);
    // Cache user data locally to avoid API call on every page load
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Logout user
   * Revokes token in database and clears HttpOnly cookie
   */
  logout: async () => {
    try {
      await api.post("/logout");
    } finally {
      // Clean up local user data (cookie is automatically cleared by backend)
      localStorage.removeItem("user");
    }
  },

  /**
   * Get authenticated user from API
   * Validates cookie and refreshes local user data
   */
  getUser: async () => {
    const response = await api.get("/user");
    const userData = response.data.user;
    localStorage.setItem("user", JSON.stringify(userData));
    return userData;
  },

  /**
   * Check if user is authenticated
   * With HttpOnly cookies, we check if user data exists locally
   */
  isAuthenticated: () => {
    return !!localStorage.getItem("user");
  },

  /**
   * Get user data from localStorage
   * Returns cached user info without API call
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Update user profile
   * Syncs changes to both API and local cache
   */
  updateProfile: async (profileData) => {
    const response = await api.put("/profile", profileData);
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },
};

// ==================== Reservation Services ====================

export const reservationService = {
  getAll: () => api.get("/reservations"),
  getMy: () => api.get("/my-reservations"),
  getAgency: () => api.get("/agency/reservations"),
  getById: (id) => api.get(`/reservations/${id}`),
  create: (data) => api.post("/reservations", data),
  update: (id, data) => api.put(`/reservations/${id}`, data),
  updateStatus: (id, status) =>
    api.patch(`/reservations/${id}/status`, { status }),
  pickup: (id, notes = null) =>
    api.post(`/reservations/${id}/pickup`, { notes }),
  return: (id, data) => api.post(`/reservations/${id}/return`, data),
  cancel: (id, reason = null) =>
    api.post(`/reservations/${id}/cancel`, {
      cancellation_reason: reason,
    }),
  delete: (id) => api.delete(`/reservations/${id}`),
};

// ==================== Vehicle Services ====================

export const vehicleService = {
  getAll: () => api.get("/vehicles"),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post("/vehicles", data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

// ==================== Agency Services ====================

export const agencyService = {
  getAll: () => api.get("/agencies"),
  getById: (id) => api.get(`/agencies/${id}`),
  create: (data) => api.post("/agencies", data),
  update: (id, data) => api.put(`/agencies/${id}`, data),
  delete: (id) => api.delete(`/agencies/${id}`),
  // Agency admin dashboard
  getStats: () => api.get("/agency/stats"),
  getFinancialStats: () => api.get("/agency/financial-stats"),
  getReviews: () => api.get("/agency/reviews"),
};

// ==================== Client Services ====================

export const clientService = {
  getStats: () => api.get("/client/stats"),
  submitReview: (data) => api.post("/reviews", data),
  getNotifications: () => api.get("/user/notifications"),
};

// ==================== Admin Services ====================

export const adminService = {
  /**
   * Get platform-wide statistics for admin dashboard
   */
  getDashboardStats: async () => {
    const response = await api.get("/admin/stats");
    return response.data;
  },

  /**
   * Get all agencies with statistics
   */
  getAgencies: async () => {
    const response = await api.get("/admin/agencies");
    return response.data;
  },

  /**
   * Get all users
   */
  getUsers: async () => {
    const response = await api.get("/admin/users");
    return response.data;
  },

  /**
   * Update agency
   */
  updateAgency: async (id, data) => {
    const response = await api.put(`/admin/agencies/${id}`, data);
    return response.data;
  },

  /**
   * Delete agency
   */
  deleteAgency: async (id) => {
    const response = await api.delete(`/admin/agencies/${id}`);
    return response.data;
  },

  /**
   * Suspend or unsuspend an agency
   */
  suspendAgency: async (id, status) => {
    const response = await api.put(`/admin/agencies/${id}`, {
      status: status, // 'active' or 'inactive'
    });
    return response.data;
  },

  /**
   * Update user
   */
  updateUser: async (id, data) => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },

  /**
   * Delete user
   */
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Suspend or unsuspend a user
   */
  suspendUser: async (id, suspend = true) => {
    const response = await api.put(`/admin/users/${id}`, {
      is_suspended: suspend,
    });
    return response.data;
  },

  /**
   * Get financial statistics with monthly breakdown
   */
  getFinancialStats: async () => {
    const response = await api.get("/admin/financial-stats");
    return response.data;
  },

  /**
   * Get agency reviews (super admin sees all)
   */
  getReviews: () => api.get("/admin/reviews"),

  /**
   * Delete a review (super admin only)
   */
  deleteReview: async (id) => {
    const response = await api.delete(`/admin/reviews/${id}`);
    return response.data;
  },
  /**
   * Get all vehicles for a specific agency (vitrine)
   */
  getAgencyVehicles: async (agencyId) => {
    const response = await api.get(`/admin/agencies/${agencyId}/vehicles`);
    return response.data;
  },};

// ==================== Report Services ====================

export const reportService = {
  /**
   * Create a new report (all authenticated users)
   */
  create: async (data) => {
    const response = await api.post("/reports", data);
    return response.data;
  },

  /**
   * Get all active reports (super_admin only)
   */
  getAll: async () => {
    const response = await api.get("/admin/reports");
    return response.data;
  },
  /**
   * Get agency's vehicle reports (agency_admin only)
   */
  getAgencyReports: async () => {
    const response = await api.get("/agency/reports");
    return response.data;
  },
  /**
   * Get trashed reports (super_admin only)
   */
  getTrashed: async () => {
    const response = await api.get("/admin/reports/trashed");
    return response.data;
  },

  /**
   * Resolve a report (super_admin only)
   */
  resolve: async (id, adminNotes) => {
    const response = await api.post(`/admin/reports/${id}/resolve`, {
      admin_notes: adminNotes,
    });
    return response.data;
  },

  /**
   * Dismiss a report (super_admin only)
   */
  dismiss: async (id, adminNotes) => {
    const response = await api.post(`/admin/reports/${id}/dismiss`, {
      admin_notes: adminNotes,
    });
    return response.data;
  },

  /**
   * Move report to trash (soft delete) (super_admin only)
   */
  moveToTrash: async (id) => {
    const response = await api.delete(`/admin/reports/${id}`);
    return response.data;
  },

  /**
   * Restore a trashed report (super_admin only)
   */
  restore: async (id) => {
    const response = await api.post(`/admin/reports/${id}/restore`);
    return response.data;
  },

  /**
   * Permanently delete a report (super_admin only)
   */
  forceDelete: async (id) => {
    const response = await api.delete(`/admin/reports/${id}/force`);
    return response.data;
  },

  /**
   * Clean old trashed reports (30+ days) (super_admin only)
   */
  cleanOldTrash: async () => {
    const response = await api.post("/admin/reports/clean-trash");
    return response.data;
  },

  /**
   * Get reports submitted BY a user (super_admin only)
   */
  getUserReportsSubmitted: async (userId) => {
    const response = await api.get(`/admin/users/${userId}/reports-submitted`);
    return response.data;
  },

  /**
   * Get reports AGAINST a user (super_admin only)
   */
  getUserReportsAgainst: async (userId) => {
    const response = await api.get(`/admin/users/${userId}/reports-against`);
    return response.data;
  },

  /**
   * Get reports AGAINST an agency (super_admin only)
   */
  getAgencyReportsAgainst: async (agencyId) => {
    const response = await api.get(`/admin/agencies/${agencyId}/reports`);
    return response.data;
  },
};

/**
 * Review service
 */
export const reviewService = {
  /**
   * Get reviews written BY a user (super_admin only)
   */
  getUserReviews: async (userId) => {
    const response = await api.get(`/admin/users/${userId}/reviews`);
    return response.data;
  },
};

export default api;
