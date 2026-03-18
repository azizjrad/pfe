import axios from "axios";
import { authEventEmitter } from "./authEventEmitter";

// Get API URL from environment variable (fallback to localhost for development)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

/**
 * Shared axios instance used by all domain services.
 * - Sends HttpOnly cookie automatically (withCredentials: true)
 * - Emits 'unauthorized' event on 401 (handled by AuthContext)
 */
const http = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // Enable credentials to allow HttpOnly cookie transmission for security
  withCredentials: true,
});

// Request interceptor — token is sent automatically via HttpOnly cookie (immune to XSS)
http.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

// Response interceptor — handles authentication errors globally
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Authorization failed - emit event for AuthContext to handle
      // This prevents race conditions where context state isn't properly cleaned up
      const reason = error.response?.data?.message || "Unauthorized";
      authEventEmitter.emit("unauthorized", { reason, error });
    }
    return Promise.reject(error);
  },
);

export default http;
