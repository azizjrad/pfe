import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/features/ProtectedRoute";
import ScrollToTop from "./components/common/ScrollToTop";
import Chatbot from "./components/features/Chatbot";

// Lazy-load pages for route-based code splitting
const Home = React.lazy(() => import("./pages/public/Home"));
const Login = React.lazy(() => import("./pages/auth/Login"));
const Register = React.lazy(() => import("./pages/auth/Register"));
const ForgotPassword = React.lazy(() => import("./pages/auth/ForgotPassword"));
const TermsOfService = React.lazy(
  () => import("./pages/public/TermsOfService"),
);
const PrivacyPolicy = React.lazy(() => import("./pages/public/PrivacyPolicy"));
const Contact = React.lazy(() => import("./pages/public/Contact"));
const Vehicles = React.lazy(() => import("./pages/vehicles/Vehicles"));
const VehicleDetails = React.lazy(
  () => import("./pages/vehicles/VehicleDetails"),
);
const Agencies = React.lazy(() => import("./pages/agencies/Agencies"));
const AgencyDetails = React.lazy(
  () => import("./pages/agencies/AgencyDetails"),
);
const About = React.lazy(() => import("./pages/public/About"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const NotFound = React.lazy(() => import("./pages/error/NotFound"));
const Forbidden = React.lazy(() => import("./pages/error/Forbidden"));

// Fallback loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

// Component to redirect admins away from public pages
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "super_admin" || user?.role === "agency_admin";

  // Redirect admins to dashboard - they shouldn't access public pages
  if (isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <div className="min-h-screen">
          <Routes>
            {/* Public routes - admins redirected to dashboard */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <React.Suspense fallback={<PageLoader />}>
                    <Home />
                  </React.Suspense>
                </PublicRoute>
              }
            />

            {/* Auth routes - accessible to everyone */}
            <Route
              path="/login"
              element={
                <React.Suspense fallback={<PageLoader />}>
                  <Login />
                </React.Suspense>
              }
            />
            <Route
              path="/register"
              element={
                <React.Suspense fallback={<PageLoader />}>
                  <Register />
                </React.Suspense>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <React.Suspense fallback={<PageLoader />}>
                  <ForgotPassword />
                </React.Suspense>
              }
            />

            {/* Static pages - accessible to non-admins */}
            <Route
              path="/terms-of-service"
              element={
                <PublicRoute>
                  <React.Suspense fallback={<PageLoader />}>
                    <TermsOfService />
                  </React.Suspense>
                </PublicRoute>
              }
            />
            <Route
              path="/privacy-policy"
              element={
                <PublicRoute>
                  <React.Suspense fallback={<PageLoader />}>
                    <PrivacyPolicy />
                  </React.Suspense>
                </PublicRoute>
              }
            />
            <Route
              path="/contact"
              element={
                <PublicRoute>
                  <React.Suspense fallback={<PageLoader />}>
                    <Contact />
                  </React.Suspense>
                </PublicRoute>
              }
            />

            {/* Booking pages - clients only, admins manage via dashboard */}
            <Route
              path="/vehicles"
              element={
                <PublicRoute>
                  <React.Suspense fallback={<PageLoader />}>
                    <Vehicles />
                  </React.Suspense>
                </PublicRoute>
              }
            />
            <Route
              path="/vehicle/:id"
              element={
                <PublicRoute>
                  <React.Suspense fallback={<PageLoader />}>
                    <VehicleDetails />
                  </React.Suspense>
                </PublicRoute>
              }
            />
            <Route
              path="/agencies"
              element={
                <PublicRoute>
                  <React.Suspense fallback={<PageLoader />}>
                    <Agencies />
                  </React.Suspense>
                </PublicRoute>
              }
            />
            <Route
              path="/agency/:id"
              element={
                <PublicRoute>
                  <React.Suspense fallback={<PageLoader />}>
                    <AgencyDetails />
                  </React.Suspense>
                </PublicRoute>
              }
            />
            <Route
              path="/about"
              element={
                <PublicRoute>
                  <React.Suspense fallback={<PageLoader />}>
                    <About />
                  </React.Suspense>
                </PublicRoute>
              }
            />

            {/* Protected Route - Universal Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <React.Suspense fallback={<PageLoader />}>
                    <Dashboard />
                  </React.Suspense>
                </ProtectedRoute>
              }
            />

            {/* 403 - Forbidden */}
            <Route
              path="/forbidden"
              element={
                <React.Suspense fallback={<PageLoader />}>
                  <Forbidden />
                </React.Suspense>
              }
            />

            {/* 404 - Catch all undefined routes */}
            <Route
              path="*"
              element={
                <React.Suspense fallback={<PageLoader />}>
                  <NotFound />
                </React.Suspense>
              }
            />
          </Routes>
          <Chatbot />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
