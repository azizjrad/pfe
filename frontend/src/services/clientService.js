import http from "./http";

/**
 * Client service — handles client-specific API calls.
 */
export const clientService = {
  /** Get stats for the authenticated client */
  getStats: () => http.get("/client/stats"),

  /** Submit a review for an agency */
  submitReview: (data) => http.post("/reviews", data),

  /** Get notifications for the authenticated user */
  getNotifications: () => http.get("/user/notifications"),

  /** Mark one notification as read */
  markNotificationRead: (id) => http.patch(`/user/notifications/${id}/read`),

  /** Mark all notifications as read */
  markAllNotificationsRead: () => http.patch("/user/notifications/read-all"),
};
