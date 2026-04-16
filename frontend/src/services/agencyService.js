import http from "./http";
import { normalizeApiResponse } from "./apiResponse";

/**
 * Agency service — handles public and agency-admin API calls.
 */
export const agencyService = {
  /** Get all agencies (public) */
  getAll: async () => normalizeApiResponse(await http.get("/agencies")),

  /** Get a single agency by ID (public) */
  getById: async (id) =>
    normalizeApiResponse(await http.get(`/agencies/${id}`)),

  /** Create a new agency (super admin) */
  create: async (data) =>
    normalizeApiResponse(await http.post("/agencies", data)),

  /** Update an agency (super admin) */
  update: async (id, data) =>
    normalizeApiResponse(await http.put(`/agencies/${id}`, data)),

  /** Delete an agency (super admin) */
  delete: async (id) =>
    normalizeApiResponse(await http.delete(`/agencies/${id}`)),

  // ── Agency admin dashboard ────────────────────────────────────────────────

  /** Get stats for the authenticated agency admin */
  getStats: async () => normalizeApiResponse(await http.get("/agency/stats")),

  /** Get financial stats for the authenticated agency admin */
  getFinancialStats: async () =>
    normalizeApiResponse(await http.get("/agency/financial-stats")),
};
