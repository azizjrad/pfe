import http from "./http";

/**
 * Review service — handles review-related API calls.
 */
export const reviewService = {
  /** Get reviews written BY a user (super admin only) */
  getUserReviews: async (userId) => {
    const response = await http.get(`/admin/users/${userId}/reviews`);
    return response.data;
  },
};
