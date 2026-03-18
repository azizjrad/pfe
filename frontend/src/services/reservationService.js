import http from "./http";

/**
 * Reservation service — handles all reservation-related API calls.
 */
export const reservationService = {
  /** Get all reservations (admin use) */
  getAll: () => http.get("/reservations"),

  /** Get reservations for the authenticated client */
  getMy: () => http.get("/my-reservations"),

  /** Get reservations for the authenticated agency */
  getAgency: () => http.get("/agency/reservations"),

  /** Get a single reservation by ID */
  getById: (id) => http.get(`/reservations/${id}`),

  /** Create a new reservation */
  create: (data) => http.post("/reservations", data),

  /** Update a pending reservation */
  update: (id, data) => http.put(`/reservations/${id}`, data),

  /** Update reservation status (agency admin only) */
  updateStatus: (id, status) =>
    http.patch(`/reservations/${id}/status`, { status }),

  /** Mark a confirmed reservation as picked up (agency admin only) */
  pickup: (id, notes = null) =>
    http.post(`/reservations/${id}/pickup`, { notes }),

  /** Mark an ongoing reservation as returned (agency admin only) */
  return: (id, data) => http.post(`/reservations/${id}/return`, data),

  /** Cancel a reservation */
  cancel: (id, reason = null) =>
    http.post(`/reservations/${id}/cancel`, {
      cancellation_reason: reason,
    }),

  /** Delete a reservation */
  delete: (id) => http.delete(`/reservations/${id}`),
};
