import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import ProfileSettingsModal from "../modals/ProfileSettingsModal";

const DashboardHeader = ({ title, subtitle, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar when at top or scrolling up, hide when scrolling down
      if (currentScrollY < 10) {
        setShowNavbar(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down
        setShowNavbar(false);
      } else {
        // Scrolling up
        setShowNavbar(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const getRoleLabel = () => {
    const roleLabels = {
      client: t("roles.client"),
      agency_admin: t("roles.agency_admin"),
      super_admin: t("roles.super_admin"),
    };
    return roleLabels[user?.role] || t("roles.user");
  };

  const showControlRoomLabel = user?.role === "super_admin";

  const handleLogout = async () => {
    try {
      // Navigate first to prevent ProtectedRoute redirect
      navigate("/");

      // Then logout
      await logout();
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
    }
  };

  return (
    <>
      {/* Multi-Layer Glassmorphism Header - Matching Main Navbar */}
      <div
        className={`sticky top-0 z-40 px-4 md:px-6 py-2 transition-all duration-700 ${showNavbar ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="relative transition-all duration-700 bg-white/70 backdrop-blur-[20px] supports-[backdrop-filter]:bg-white/70 border border-gray-200/50 shadow-2xl shadow-primary-500/10 rounded-2xl md:rounded-3xl">
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/50 to-transparent" />
          {/* Multi-layer gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-primary-300/3 to-primary-500/5 opacity-100 rounded-2xl md:rounded-3xl"></div>

          {/* Glass reflection */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/10 to-transparent opacity-100 rounded-2xl md:rounded-3xl"></div>

          {/* Subtle inner glow */}
          <div className="absolute inset-0 shadow-inner shadow-primary-500/5 opacity-100 rounded-2xl md:rounded-3xl"></div>

          <div className="relative z-10 w-full px-6 md:px-8">
            <div className="flex items-center justify-between transition-all duration-700 py-4">
              {/* Left: Title Section with Icon */}
              <div className="flex items-center gap-4 flex-1">
                <div className="hidden sm:flex relative w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl items-center justify-center shadow-lg">
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-white/30" />
                  <div className="absolute -inset-1 rounded-2xl border border-primary-300/40" />
                  <svg
                    className="w-6 h-6 text-white relative z-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  {showControlRoomLabel && (
                    <p className="hidden sm:block text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-700/80 mb-0.5">
                      Control Room
                    </p>
                  )}
                  <h1 className="text-xl sm:text-[2.05rem] font-black leading-tight bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: User Actions */}
              <div className="flex items-center gap-2 sm:gap-3">
                {children}

                {/* User Info Card */}
                <div className="hidden lg:flex items-center px-4 py-2.5 bg-gray-100/60 backdrop-blur-[20px] border border-gray-300/30 rounded-2xl shadow-lg transition-all duration-500">
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-600">{getRoleLabel()}</p>
                  </div>
                </div>

                {/* Profile Settings Button */}
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="group relative px-3 sm:px-4 py-2.5 font-semibold rounded-2xl transition-all duration-500 overflow-hidden bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg hover:shadow-xl hover:shadow-primary-500/25 hover:scale-[1.04]"
                  title={t("nav.profileSettings")}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="hidden sm:inline">{t("nav.profile")}</span>
                  </span>

                  {/* Glass overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/25 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl"></div>

                  {/* Premium shimmer */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>

                  {/* Inner glow */}
                  <div className="absolute inset-0 shadow-inner shadow-primary-300/20 rounded-2xl"></div>
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="group relative px-3 sm:px-4 py-2.5 font-semibold rounded-2xl transition-all duration-500 overflow-hidden bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl hover:shadow-red-500/25 hover:scale-[1.04]"
                  title={t("nav.logout")}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span className="hidden sm:inline">{t("nav.quit")}</span>
                  </span>

                  {/* Glass overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/25 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl"></div>

                  {/* Premium shimmer */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>

                  {/* Inner glow */}
                  <div className="absolute inset-0 shadow-inner shadow-red-300/20 rounded-2xl"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Settings Modal */}
      {showProfileModal && (
        <ProfileSettingsModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </>
  );
};

export default DashboardHeader;
