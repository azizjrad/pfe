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
  getAgencies: async (params = {}) => {
    // Try admin endpoint first; if missing, fall back to public agencies
    try {
      const response = await http.get("/admin/agencies", { params });
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const resp = await http.get("/public/agencies", { params });
        return resp.data;
      }
      throw err;
    }
  },

  /** Get all users */
  getUsers: async (params = {}) => {
    const response = await http.get("/admin/users", { params });
    return response.data;
  },

  /** Update an agency */
  updateAgency: async (id, data) => {
    const response = await http.put(`/admin/agencies/${id}`, data);
    return response.data;
  },

  /** Create an agency */
  createAgency: async (data) => {
    const response = await http.post("/admin/agencies", data);
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

  /** Create a user */
  createUser: async (data) => {
    const response = await http.post("/admin/users", data);
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
    // Some deployments expose agency-level financial stats at /agency/financial-stats
    // while others may expose admin-level endpoints. Try admin first, then agency.
    try {
      const response = await http.get("/admin/financial-stats");
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          const resp = await http.get("/agency/financial-stats");
          return resp.data;
        } catch (err2) {
          // Fallback to empty structure when endpoint isn't available
          return {
            monthly: [],
            byAgency: [],
            paymentMethods: [],
            totals: { revenue: 0, commission: 0, profit: 0, avgMonthly: 0 },
          };
        }
      }
      throw err;
    }
  },

  /** Get all vehicles for a specific agency */
  getAgencyVehicles: async (agencyId, params = {}) => {
    const response = await http.get(`/admin/agencies/${agencyId}/vehicles`, {
      params,
    });
    return response.data;
  },
};
