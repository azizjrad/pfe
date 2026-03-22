import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { ROLES } from "../constants/roles";
import { authEventEmitter } from "../services/authEventEmitter";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize authentication state on app mount
  // Uses a two-phase loading strategy: cached data first, then validate
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Phase 1: Load cached user immediately for instant UI rendering
        const cachedUser = authService.getCurrentUser();

        if (cachedUser) {
          setUser(cachedUser);
          setLoading(false);

          // Phase 2: Validate session with server to detect suspensions/invalidations
          try {
            const freshUserData = await authService.getUser();
            setUser(freshUserData);
          } catch (error) {
            // Cookie expired, invalid, or server rejected the session
            console.warn(
              "Session invalid. User might be suspended or unauthorized.",
              error,
            );
            await authService.logout();
            setUser(null);
            navigate("/login", { replace: true });
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error during authentication initialization:", error);
        setLoading(false);
      }
    };

    initAuth();
  }, [navigate]);

  // Listen for unauthorized errors from HTTP interceptor
  // This handles cases where user is suspended AFTER login
  useEffect(() => {
    const unsubscribe = authEventEmitter.on("unauthorized", async (reason) => {
      console.warn("Authorization failed:", reason);

      // Clear auth state
      setUser(null);
      setError("Authorization failed. Please log in again.");

      // Clear localStorage
      await authService.logout();

      // Navigate to login
      navigate("/login", { replace: true });
    });

    return unsubscribe;
  }, [navigate]);

  // Periodically validate session (detect suspensions/changes server-side)
  // Validates every 30 seconds when user is authenticated
  useEffect(() => {
    if (!user) return;

    const validateSessionInterval = setInterval(async () => {
      try {
        const freshData = await authService.getUser();

        // Check if user status changed (suspended, role changed, etc.)
        if (freshData?.is_suspended && !user?.is_suspended) {
          console.warn("User was suspended server-side");
          setUser(null);
          setError("Your account has been suspended. Please contact support.");
          await authService.logout();
          navigate("/login", { replace: true });
          return;
        }

        // Update user data if any changes detected
        if (JSON.stringify(freshData) !== JSON.stringify(user)) {
          setUser(freshData);
        }
      } catch (err) {
        console.error("Session validation error:", err);
        // On validation error, emit unauthorized to trigger logout
        if (err.response?.status === 401) {
          authEventEmitter.emit("unauthorized", {
            reason: "Session validation failed",
          });
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(validateSessionInterval);
  }, [user, navigate]);

  /**
   * Register a new user
   * Creates account and automatically logs them in
   */
  const register = async (userData) => {
    setError(null);
    try {
      const response = await authService.register(userData);
      setUser(response.user);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Registration failed";
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Login user with credentials
   * Stores auth cookie and user data
   */
  const login = async (credentials) => {
    setError(null);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Invalid credentials";
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Logout user
   * Clears cookie and local user data
   */
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  /**
   * Refresh user data from API
   * Useful after profile updates or permission changes
   */
  const refreshUser = async () => {
    try {
      const userData = await authService.getUser();
      setUser(userData);
    } catch (err) {
      console.error("Error refreshing user data:", err);
    }
  };

  /**
   * Check if user has a specific role
   */
  const hasRole = (role) => {
    return user?.role === role;
  };

  /**
   * Check if user has any of the provided roles
   */
  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    refreshUser,
    hasRole,
    hasAnyRole,
    isAuthenticated: !!user,
    isClient: user?.role === ROLES.CLIENT,
    isAgencyAdmin: user?.role === ROLES.AGENCY_ADMIN,
    isSuperAdmin: user?.role === ROLES.SUPER_ADMIN,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook pour utiliser le contexte d'authentification
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};

export default AuthContext;
