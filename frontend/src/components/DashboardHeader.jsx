import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ProfileSettingsModal from "./ProfileSettingsModal";

const DashboardHeader = ({ title, subtitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const getRoleLabel = () => {
    const roleLabels = {
      client: "Client",
      agency_admin: "Administrateur Agence",
      super_admin: "Super Administrateur",
    };
    return roleLabels[user?.role] || "Utilisateur";
  };

  const getInitials = () => {
    if (!user?.name) return "U";
    const names = user.name.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
    }
  };

  return (
    <>
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Title Section */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
              )}
            </div>

            {/* Right: User Actions */}
            <div className="flex items-center gap-3">
              {/* User Info */}
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500">{getRoleLabel()}</p>
                </div>
              </div>

              {/* Profile Settings Button */}
              <button
                onClick={() => setShowProfileModal(true)}
                className="group relative flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                title="Paramètres du profil"
              >
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
                <span className="hidden sm:inline font-medium">Profil</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="group relative flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                title="Déconnexion"
              >
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
                <span className="hidden sm:inline font-medium">
                  Déconnexion
                </span>
              </button>
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
