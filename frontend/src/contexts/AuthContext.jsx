import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
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

          // Phase 2: Validate cookie in background and refresh user data
          try {
            const freshUserData = await authService.getUser();
            setUser(freshUserData);
          } catch (error) {
            // Cookie expired or invalid - logout user
            console.warn("Cookie expired or invalid, logging out...");
            await authService.logout();
            setUser(null);
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
  }, []);

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
    isClient: user?.role === "client",
    isAgencyAdmin: user?.role === "agency_admin",
    isSuperAdmin: user?.role === "super_admin",
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
