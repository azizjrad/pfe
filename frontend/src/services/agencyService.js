import http from "./http";

/**
 * Agency service — handles public and agency-admin API calls.
 */
export const agencyService = {
  /** Get all agencies (public) */
  getAll: () => http.get("/agencies"),

  /** Get a single agency by ID (public) */
  getById: (id) => http.get(`/agencies/${id}`),

  /** Create a new agency (super admin) */
  create: (data) => http.post("/agencies", data),

  /** Update an agency (super admin) */
  update: (id, data) => http.put(`/agencies/${id}`, data),

  /** Delete an agency (super admin) */
  delete: (id) => http.delete(`/agencies/${id}`),

  // ── Agency admin dashboard ────────────────────────────────────────────────

  /** Get stats for the authenticated agency admin */
  getStats: () => http.get("/agency/stats"),

  /** Get financial stats for the authenticated agency admin */
  getFinancialStats: () => http.get("/agency/financial-stats"),

  /** Get reviews for the authenticated agency */
  getReviews: () => http.get("/agency/reviews"),
};
