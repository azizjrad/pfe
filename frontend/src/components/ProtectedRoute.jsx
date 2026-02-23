import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * Composant pour protéger les routes nécessitant une authentification
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Le composant à rendre si authentifié
 * @param {string|string[]} props.allowedRoles - Rôle(s) autorisé(s) pour cette route
 * @param {string} props.redirectTo - URL de redirection si non autorisé
 */
const ProtectedRoute = ({
  children,
  allowedRoles = null,
  redirectTo = "/login",
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Rediriger vers login si non authentifié
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Vérifier les rôles autorisés
  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(user?.role)) {
      // Rediriger vers le dashboard universel
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Utilisateur authentifié et autorisé
  return children;
};

export default ProtectedRoute;
