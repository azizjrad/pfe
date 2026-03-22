import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";

/**
 * Protected route component for authentication and role-based access control
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component to render if authenticated
 * @param {string|string[]} props.allowedRoles - Role(s) allowed for this route
 * @param {string} props.redirectTo - Redirect URL if unauthorized
 */
const ProtectedRoute = ({
  children,
  allowedRoles = null,
  redirectTo = "/login",
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  // Show loader during authentication check
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based authorization if roles are specified
  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(user?.role)) {
      // Redirect to 403 forbidden page
      return <Navigate to="/forbidden" replace />;
    }
  }

  // User is authenticated and authorized
  return children;
};

export default ProtectedRoute;
