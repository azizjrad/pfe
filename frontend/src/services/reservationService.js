import http from "./http";
import { normalizeApiResponse } from "./apiResponse";

/**
 * Reservation service — handles all reservation-related API calls.
 */
export const reservationService = {
  /** Get all reservations (admin use) */
  getAll: async (params = {}) =>
    normalizeApiResponse(await http.get("/admin/reservations", { params })),

  /** Get reservations for the authenticated client */
  getMy: async (params = {}) =>
    normalizeApiResponse(await http.get("/my-reservations", { params })),

  /** Get reservations for the authenticated agency */
  getAgency: async (params = {}) =>
    normalizeApiResponse(await http.get("/agency/reservations", { params })),

  /** Get a single reservation by ID */
  getById: async (id) =>
    normalizeApiResponse(await http.get(`/reservations/${id}`)),

  /** Create a new reservation */
  create: async (data) =>
    normalizeApiResponse(await http.post("/reservations", data)),

  /** Update a pending reservation */
  update: async (id, data) =>
    normalizeApiResponse(await http.put(`/reservations/${id}`, data)),

  /** Update reservation status (agency admin only) */
  updateStatus: async (id, status) =>
    normalizeApiResponse(
      await http.patch(`/reservations/${id}/status`, { status }),
    ),

  /** Mark a confirmed reservation as picked up (agency admin only) */
  pickup: async (id, notes = null) =>
    normalizeApiResponse(
      await http.post(`/reservations/${id}/pickup`, { notes }),
    ),

  /** Mark an ongoing reservation as returned (agency admin only) */
  return: async (id, data) =>
    normalizeApiResponse(await http.post(`/reservations/${id}/return`, data)),

  /** Cancel a reservation */
  cancel: async (id, reason = null) =>
    normalizeApiResponse(
      await http.post(`/reservations/${id}/cancel`, {
        cancellation_reason: reason,
      }),
    ),

  /** Delete a reservation */
  delete: async (id) =>
    normalizeApiResponse(await http.delete(`/reservations/${id}`)),
};
