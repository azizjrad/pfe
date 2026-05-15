import http from "./http";
import { normalizeApiResponse } from "./apiResponse";

/**
 * Admin service — handles super-admin-only API calls.
 */
export const adminService = {
  /** Get platform-wide statistics for the admin dashboard */
  getDashboardStats: async () => {
    const response = await http.get("/admin/stats");
    return normalizeApiResponse(response);
  },

  /** Get all agencies with their statistics */
  getAgencies: async (params = {}) => {
    // Try admin endpoint first; if missing, fall back to public agencies
    try {
      const response = await http.get("/admin/agencies", { params });
      return normalizeApiResponse(response);
    } catch (err) {
      if (err.response?.status === 404) {
        const resp = await http.get("/public/agencies", { params });
        return normalizeApiResponse(resp);
      }
      throw err;
    }
  },

  /** Update an agency */
  updateAgency: async (id, data) => {
    const response = await http.put(`/admin/agencies/${id}`, data);
    return normalizeApiResponse(response);
  },

  /** Create an agency */
  createAgency: async (data) => {
    const response = await http.post("/admin/agencies", data);
    return normalizeApiResponse(response);
  },

  /**
   * Suspend or unsuspend an agency.
   * @param {string} status - 'active' or 'inactive'
   */
  suspendAgency: async (id, status) => {
    const response = await http.put(`/admin/agencies/${id}`, { status });
    return normalizeApiResponse(response);
  },

  /** Get clients list with reliability scores */
  getClients: async (params = {}) => {
    const response = await http.get("/admin/clients", { params });
    return normalizeApiResponse(response);
  },

  /** Get financial statistics with monthly breakdown */
  getFinancialStats: async (params = {}) => {
    // Some deployments expose agency-level financial stats at /agency/financial-stats
    // while others may expose admin-level endpoints. Try admin first, then agency.
    try {
      const response = await http.get("/admin/financial-stats", { params });
      return normalizeApiResponse(response);
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          const resp = await http.get("/agency/financial-stats", { params });
          return normalizeApiResponse(resp);
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
    return normalizeApiResponse(response);
  },
};
