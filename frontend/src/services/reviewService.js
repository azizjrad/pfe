import http from "./http";

/**
 * Review service — handles review-related API calls.
 */
export const reviewService = {
  /** Submit a new review for an agency (clients only) */
  store: async (data) => {
    const response = await http.post("/reviews", data);
    return response.data;
  },

  /** Get reviews written BY a user (super admin only) */
  getUserReviews: async (userId) => {
    const response = await http.get(`/admin/users/${userId}/reviews`);
    return response.data;
  },
};
