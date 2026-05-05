import http from "./http";

/**
 * Authentication service
 * Token is stored in an HttpOnly cookie by the backend.
 * Only non-sensitive user data is cached in localStorage.
 */
export const authService = {
  normalizeResponse: (response) => {
    const payload = response.data || {};
    const data = payload.data ?? payload;
    const user = data.user ?? data;

    return {
      ...payload,
      data,
      user,
    };
  },

  /**
   * Register a new user.
   * Token is stored in HttpOnly cookie by backend; only user data stored locally.
   */
  register: async (userData) => {
    const response = await http.post("/register", userData);
    const payload = authService.normalizeResponse(response);
    return payload;
  },

  /**
   * Login user.
   * Token is stored in HttpOnly cookie by backend with dynamic expiration.
   */
  login: async (credentials) => {
    const response = await http.post("/login", credentials);
    const payload = authService.normalizeResponse(response);
    // Cache user data locally to avoid API call on every page load
    if (payload.user) {
      localStorage.setItem("user", JSON.stringify(payload.user));
    }
    return payload;
  },

  /**
   * Logout user.
   * Revokes token in database and clears HttpOnly cookie.
   */
  logout: async () => {
    try {
      await http.post("/logout");
    } finally {
      // Clean up local user data (cookie is automatically cleared by backend)
      localStorage.removeItem("user");
    }
  },

  /**
   * Get authenticated user from API.
   * Validates cookie and refreshes local user data.
   */
  getUser: async () => {
    const response = await http.get("/user");
    const payload = authService.normalizeResponse(response);
    const userData = payload.user;
    localStorage.setItem("user", JSON.stringify(userData));
    return userData;
  },

  /**
   * Check if user is authenticated.
   * With HttpOnly cookies, we check if user data exists locally.
   */
  isAuthenticated: () => {
    return !!localStorage.getItem("user");
  },

  /**
   * Get user data from localStorage.
   * Returns cached user info without making an API call.
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Update user profile.
   * Syncs changes to both API and local cache.
   */
  updateProfile: async (profileData) => {
    const response = await http.put("/profile", profileData);
    const payload = authService.normalizeResponse(response);

    if (payload.user) {
      localStorage.setItem("user", JSON.stringify(payload.user));
    }
    return payload;
  },
};
