import http from "./http";

/**
 * Report service — handles report-related API calls.
 */
export const reportService = {
  /** Create a new report (all authenticated users) */
  create: async (data) => {
    const response = await http.post("/reports", data);
    return response.data;
  },

  /** Get all active reports (super admin only) */
  getAll: async (params = {}) => {
    const response = await http.get("/admin/reports", { params });
    return response.data;
  },

  /** Get vehicle reports for the authenticated agency (agency admin only) */
  getAgencyReports: async (params = {}) => {
    const response = await http.get("/agency/reports", { params });
    return response.data;
  },

  /** Get trashed reports (super admin only) */
  getTrashed: async (params = {}) => {
    const response = await http.get("/admin/reports/trashed", { params });
    return response.data;
  },

  /** Resolve a report (super admin only) */
  resolve: async (id, adminNotes) => {
    const response = await http.patch(`/admin/reports/${id}/status`, {
      status: "resolved",
      admin_notes: adminNotes,
    });
    return response.data;
  },

  /** Dismiss a report (super admin only) */
  dismiss: async (id, adminNotes) => {
    const response = await http.patch(`/admin/reports/${id}/status`, {
      status: "dismissed",
      admin_notes: adminNotes,
    });
    return response.data;
  },

  /** Move report to trash (soft delete) (super admin only) */
  moveToTrash: async (id) => {
    const response = await http.delete(`/admin/reports/${id}`);
    return response.data;
  },

  /** Restore a trashed report (super admin only) */
  restore: async (id) => {
    const response = await http.post(`/admin/reports/${id}/restore`);
    return response.data;
  },

  /** Permanently delete a report (super admin only) */
  forceDelete: async (id) => {
    const response = await http.delete(`/admin/reports/${id}/force`);
    return response.data;
  },

  /** Clean old trashed reports (30+ days) (super admin only) */
  cleanOldTrash: async () => {
    const response = await http.post("/admin/reports/clean-trash");
    return response.data;
  },

  /** Get reports submitted BY a user (super admin only) */
  getUserReportsSubmitted: async (userId, params = {}) => {
    const response = await http.get(
      `/admin/users/${userId}/reports-submitted`,
      {
        params,
      },
    );
    return response.data;
  },

  /** Get reports AGAINST a user (super admin only) */
  getUserReportsAgainst: async (userId, params = {}) => {
    const response = await http.get(`/admin/users/${userId}/reports-against`, {
      params,
    });
    return response.data;
  },

  /** Get reports AGAINST an agency (super admin only) */
  getAgencyReportsAgainst: async (agencyId, params = {}) => {
    const response = await http.get(`/admin/agencies/${agencyId}/reports`, {
      params,
    });
    return response.data;
  },
};
