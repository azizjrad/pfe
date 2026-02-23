import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger l'utilisateur au montage du composant (persistence de session)
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. Charger immédiatement depuis localStorage (feedback instantané)
        const cachedUser = authService.getCurrentUser();
        const token = localStorage.getItem("token");

        if (cachedUser && token) {
          setUser(cachedUser);
          setLoading(false); // Afficher l'UI tout de suite

          // 2. Valider le token avec l'API en arrière-plan
          try {
            const freshUserData = await authService.getUser();
            setUser(freshUserData); // Mettre à jour avec les données fraîches
          } catch (error) {
            // Token expiré ou invalide
            console.warn("Token invalide ou expiré, déconnexion...");
            await authService.logout();
            setUser(null);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation:", error);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Inscription
   */
  const register = async (userData) => {
    setError(null);
    try {
      const response = await authService.register(userData);
      setUser(response.user);
      return response;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Erreur lors de l'inscription";
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Connexion
   */
  const login = async (credentials) => {
    setError(null);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      return response;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Identifiants incorrects";
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Déconnexion
   */
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  /**
   * Rafraîchir les données utilisateur
   */
  const refreshUser = async () => {
    try {
      const userData = await authService.getUser();
      setUser(userData);
    } catch (err) {
      console.error("Erreur lors du rafraîchissement:", err);
    }
  };

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  const hasRole = (role) => {
    return user?.role === role;
  };

  /**
   * Vérifier si l'utilisateur a l'un des rôles
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
