import http from "./http";

/**
 * Vehicle service — handles all vehicle-related API calls.
 */
export const vehicleService = {
  /** Get all vehicles */
  getAll: (params = {}) => http.get("/vehicles", { params }),

  /** Get a single vehicle by ID */
  getById: (id) => http.get(`/vehicles/${id}`),

  /** Create a new vehicle (agency admin) */
  create: (data) => http.post("/vehicles", data),

  /** Update a vehicle (agency admin) */
  update: (id, data) => http.put(`/vehicles/${id}`, data),

  /** Delete a vehicle (agency admin) */
  delete: (id) => http.delete(`/vehicles/${id}`),
};
