import http from "./http";
import { normalizeApiResponse } from "./apiResponse";

/**
 * Vehicle service — handles all vehicle-related API calls.
 */
export const vehicleService = {
  /** Get all vehicles */
  getAll: async (params = {}) =>
    normalizeApiResponse(await http.get("/vehicles", { params })),

  /** Get a single vehicle by ID */
  getById: async (id) =>
    normalizeApiResponse(await http.get(`/vehicles/${id}`)),

  /** Create a new vehicle (agency admin) */
  create: async (data) =>
    normalizeApiResponse(await http.post("/vehicles", data)),

  /** Update a vehicle (agency admin) */
  update: async (id, data) =>
    normalizeApiResponse(await http.put(`/vehicles/${id}`, data)),

  /** Delete a vehicle (agency admin) */
  delete: async (id) =>
    normalizeApiResponse(await http.delete(`/vehicles/${id}`)),
};
