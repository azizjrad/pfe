import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import Chatbot from "./components/Chatbot";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Contact from "./pages/Contact";
import Vehicles from "./pages/Vehicles";
import VehicleDetails from "./pages/VehicleDetails";
import Agencies from "./pages/Agencies";
import AgencyDetails from "./pages/AgencyDetails";
import Services from "./pages/Services";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Forbidden from "./pages/Forbidden";

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
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen">
          <Routes>
            {/* Public routes - admins redirected to dashboard */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <Home />
                </PublicRoute>
              }
            />

            {/* Auth routes - accessible to everyone */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Static pages - accessible to non-admins */}
            <Route
              path="/terms-of-service"
              element={
                <PublicRoute>
                  <TermsOfService />
                </PublicRoute>
              }
            />
            <Route
              path="/privacy-policy"
              element={
                <PublicRoute>
                  <PrivacyPolicy />
                </PublicRoute>
              }
            />
            <Route
              path="/contact"
              element={
                <PublicRoute>
                  <Contact />
                </PublicRoute>
              }
            />

            {/* Booking pages - clients only, admins manage via dashboard */}
            <Route
              path="/vehicles"
              element={
                <PublicRoute>
                  <Vehicles />
                </PublicRoute>
              }
            />
            <Route
              path="/vehicle/:id"
              element={
                <PublicRoute>
                  <VehicleDetails />
                </PublicRoute>
              }
            />
            <Route
              path="/agencies"
              element={
                <PublicRoute>
                  <Agencies />
                </PublicRoute>
              }
            />
            <Route
              path="/agency/:id"
              element={
                <PublicRoute>
                  <AgencyDetails />
                </PublicRoute>
              }
            />
            <Route
              path="/services"
              element={
                <PublicRoute>
                  <Services />
                </PublicRoute>
              }
            />
            <Route
              path="/about"
              element={
                <PublicRoute>
                  <About />
                </PublicRoute>
              }
            />

            {/* Protected Route - Universal Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* 403 - Forbidden */}
            <Route path="/forbidden" element={<Forbidden />} />

            {/* 404 - Catch all undefined routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Chatbot />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
