import http from "./http";

/**
 * Admin service — handles super-admin-only API calls.
 */
export const adminService = {
  /** Get platform-wide statistics for the admin dashboard */
  getDashboardStats: async () => {
    const response = await http.get("/admin/stats");
    return response.data;
  },

  /** Get all agencies with their statistics */
  getAgencies: async () => {
    const response = await http.get("/admin/agencies");
    return response.data;
  },

  /** Get all users */
  getUsers: async () => {
    const response = await http.get("/admin/users");
    return response.data;
  },

  /** Update an agency */
  updateAgency: async (id, data) => {
    const response = await http.put(`/admin/agencies/${id}`, data);
    return response.data;
  },

  /** Delete an agency */
  deleteAgency: async (id) => {
    const response = await http.delete(`/admin/agencies/${id}`);
    return response.data;
  },

  /**
   * Suspend or unsuspend an agency.
   * @param {string} status - 'active' or 'inactive'
   */
  suspendAgency: async (id, status) => {
    const response = await http.put(`/admin/agencies/${id}`, { status });
    return response.data;
  },

  /** Update a user */
  updateUser: async (id, data) => {
    const response = await http.put(`/admin/users/${id}`, data);
    return response.data;
  },

  /** Delete a user */
  deleteUser: async (id) => {
    const response = await http.delete(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Suspend or unsuspend a user.
   * @param {boolean} suspend - true to suspend, false to unsuspend
   */
  suspendUser: async (id, suspend = true) => {
    const response = await http.put(`/admin/users/${id}`, {
      is_suspended: suspend,
    });
    return response.data;
  },

  /** Get financial statistics with monthly breakdown */
  getFinancialStats: async () => {
    const response = await http.get("/admin/financial-stats");
    return response.data;
  },

  /** Get all agency reviews (super admin sees all) */
  getReviews: () => http.get("/admin/reviews"),

  /** Delete a review (super admin only) */
  deleteReview: async (id) => {
    const response = await http.delete(`/admin/reviews/${id}`);
    return response.data;
  },

  /** Get all vehicles for a specific agency */
  getAgencyVehicles: async (agencyId) => {
    const response = await http.get(`/admin/agencies/${agencyId}/vehicles`);
    return response.data;
  },
};
