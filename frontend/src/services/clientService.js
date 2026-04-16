import http from "./http";
import { normalizeApiResponse } from "./apiResponse";

/**
 * Client service — handles client-specific API calls.
 */
export const clientService = {
  /** Get stats for the authenticated client */
  getStats: async () => normalizeApiResponse(await http.get("/client/stats")),

  /** Get notifications for the authenticated user */
  getNotifications: async (params = {}) =>
    normalizeApiResponse(await http.get("/user/notifications", { params })),

  /** Mark one notification as read */
  markNotificationRead: async (id) =>
    normalizeApiResponse(await http.patch(`/user/notifications/${id}/read`)),

  /** Mark all notifications as read */
  markAllNotificationsRead: async () =>
    normalizeApiResponse(await http.patch("/user/notifications/read-all")),
};
