import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import DashboardHeader from "../components/DashboardHeader";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Mock platform data
  const platformStats = {
    totalAgencies: 12,
    totalUsers: 487,
    totalVehicles: 156,
    totalReservations: 1234,
    monthlyRevenue: 145890,
    activeReservations: 89,
  };

  // Mock agencies data
  const agencies = [
    {
      id: 1,
      name: "Elite Drive Centre-Ville",
      location: "Tunis",
      vehicles: 15,
      revenue: 12450,
      status: "active",
    },
    {
      id: 2,
      name: "Elite Drive La Marsa",
      location: "La Marsa",
      vehicles: 12,
      revenue: 10230,
      status: "active",
    },
    {
      id: 3,
      name: "Elite Drive Sousse",
      location: "Sousse",
      vehicles: 8,
      revenue: 5890,
      status: "inactive",
    },
  ];

  // Mock users data
  const users = [
    {
      id: 1,
      name: "Ahmed Ben Salem",
      email: "ahmed@example.com",
      role: "client",
      registeredAt: "2025-12-15",
    },
    {
      id: 2,
      name: "Mohamed Trabelsi",
      email: "mohamed@example.com",
      role: "agency_admin",
      agency: "Elite Drive Centre-Ville",
      registeredAt: "2025-11-10",
    },
    {
      id: 3,
      name: "Fatma Jrad",
      email: "fatma@example.com",
      role: "client",
      registeredAt: "2026-01-20",
    },
  ];

  const getStatusColor = (status) => {
    return status === "active"
      ? "bg-green-100 text-green-600"
      : "bg-red-100 text-red-600";
  };

  const getStatusText = (status) => {
    return status === "active" ? "Active" : "Inactive";
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-100 text-purple-600";
      case "agency_admin":
        return "bg-blue-100 text-blue-600";
      case "client":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "agency_admin":
        return "Admin Agence";
      case "client":
        return "Client";
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Dashboard Header */}
      <DashboardHeader
        title="Tableau de bord Administrateur"
        subtitle="Gestion de la plateforme Elite Drive"
      />

      <div className="pt-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Home Button */}
          <button
            onClick={() => navigate("/")}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors group"
          >
            <svg
              className="w-5 h-5 group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="font-medium">Accueil</span>
          </button>

          {/* Enhanced Stats Cards with Glassmorphism */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            {/* Agencies */}
            <div className="group bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {platformStats.totalAgencies}
              </p>
              <p className="text-sm text-gray-600 font-medium">Agences</p>
            </div>

            {/* Users */}
            <div className="group bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {platformStats.totalUsers}
              </p>
              <p className="text-sm text-gray-600 font-medium">Utilisateurs</p>
            </div>

            {/* Vehicles */}
            <div className="group bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                  />
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {platformStats.totalVehicles}
              </p>
              <p className="text-sm text-gray-600 font-medium">Véhicules</p>
            </div>

            {/* Reservations */}
            <div className="group bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {platformStats.totalReservations}
              </p>
              <p className="text-sm text-gray-600 font-medium">Réservations</p>
            </div>

            {/* Revenue */}
            <div className="group bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {platformStats.monthlyRevenue.toLocaleString()} DT
              </p>
              <p className="text-sm text-gray-600 font-medium">
                Revenus totaux
              </p>
            </div>

            {/* Active Reservations */}
            <div className="group bg-gradient-to-br from-primary-600 to-primary-700 backdrop-blur-xl rounded-3xl p-6 shadow-2xl text-white hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 hover:from-primary-700 hover:to-primary-800">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6"
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
              <p className="text-3xl font-bold mb-1">
                {platformStats.activeReservations}
              </p>
              <p className="text-sm text-white/90 font-medium">Actives</p>
            </div>
          </div>

          {/* Enhanced Tabs with Glassmorphism */}
          <div className="bg-gradient-to-br from-white/90 to-white/50 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-2xl overflow-hidden">
            {/* Mobile Hamburger Button */}
            <div className="lg:hidden flex items-center justify-between border-b border-white/40 bg-white/30 px-4 py-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-white/40 transition-colors"
              >
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <span className="text-sm font-semibold text-gray-700">
                {activeTab === "overview" && "Vue d'ensemble"}
                {activeTab === "agencies" && "Gérer Agences"}
                {activeTab === "users" && "Gérer Utilisateurs"}
                {activeTab === "statistics" && "Statistiques"}
              </span>
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            {/* Desktop Tabs */}
            <div className="hidden lg:block border-b border-white/40 bg-white/30">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`flex-1 px-6 py-5 text-sm font-semibold transition-all duration-300 relative ${
                    activeTab === "overview"
                      ? "text-primary-700 bg-white/60"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/30"
                  }`}
                >
                  {activeTab === "overview" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-full" />
                  )}
                  Vue d'ensemble
                </button>
                <button
                  onClick={() => setActiveTab("agencies")}
                  className={`flex-1 px-6 py-5 text-sm font-semibold transition-all duration-300 relative ${
                    activeTab === "agencies"
                      ? "text-primary-700 bg-white/60"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/30"
                  }`}
                >
                  {activeTab === "agencies" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-full" />
                  )}
                  Gérer Agences
                </button>
                <button
                  onClick={() => setActiveTab("users")}
                  className={`flex-1 px-6 py-5 text-sm font-semibold transition-all duration-300 relative ${
                    activeTab === "users"
                      ? "text-primary-700 bg-white/60"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/30"
                  }`}
                >
                  {activeTab === "users" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-full" />
                  )}
                  Gérer Utilisateurs
                </button>
                <button
                  onClick={() => setActiveTab("statistics")}
                  className={`flex-1 px-6 py-5 text-sm font-semibold transition-all duration-300 relative ${
                    activeTab === "statistics"
                      ? "text-primary-700 bg-white/60"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/30"
                  }`}
                >
                  {activeTab === "statistics" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-full" />
                  )}
                  Statistiques
                </button>
              </nav>
            </div>

            {/* Mobile Sidebar */}
            {isSidebarOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
                  onClick={() => setIsSidebarOpen(false)}
                ></div>

                {/* Sidebar */}
                <div className="lg:hidden fixed left-0 top-0 bottom-0 w-72 z-50 animate-slideInLeft">
                  <div className="h-full bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-2xl border-r border-white/60 shadow-2xl rounded-r-3xl flex flex-col">
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/40">
                      <h3 className="text-lg font-bold text-gray-900">Menu</h3>
                      <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-2 rounded-lg hover:bg-white/60 transition-colors"
                      >
                        <svg
                          className="w-5 h-5 text-gray-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 p-4 space-y-2">
                      <button
                        onClick={() => {
                          setActiveTab("overview");
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all ${
                          activeTab === "overview"
                            ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                            : "text-gray-700 hover:bg-white/60"
                        }`}
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
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        Vue d'ensemble
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab("agencies");
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all ${
                          activeTab === "agencies"
                            ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                            : "text-gray-700 hover:bg-white/60"
                        }`}
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
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        Gérer Agences
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab("users");
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all ${
                          activeTab === "users"
                            ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                            : "text-gray-700 hover:bg-white/60"
                        }`}
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
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        Gérer Utilisateurs
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab("statistics");
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all ${
                          activeTab === "statistics"
                            ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                            : "text-gray-700 hover:bg-white/60"
                        }`}
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
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        Statistiques
                      </button>
                    </nav>
                  </div>
                </div>
              </>
            )}

            <div className="p-8">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Aperçu de la plateforme
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Performances des agences
                      </h3>
                      <div className="space-y-3">
                        {agencies.slice(0, 3).map((agency) => (
                          <div
                            key={agency.id}
                            className="flex justify-between items-center"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {agency.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {agency.vehicles} véhicules
                              </p>
                            </div>
                            <span className="text-sm font-bold text-primary-600">
                              {agency.revenue.toLocaleString()} DT
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Activité récente
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">
                              Nouvelle agence créée
                            </p>
                            <p className="text-xs text-gray-500">Il y a 2h</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">
                              15 nouveaux utilisateurs
                            </p>
                            <p className="text-xs text-gray-500">Aujourd'hui</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5"></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">
                              45 réservations traitées
                            </p>
                            <p className="text-xs text-gray-500">Aujourd'hui</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Agencies Tab */}
              {activeTab === "agencies" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      Gérer les agences
                    </h2>
                    <button className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center gap-2">
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Ajouter agence
                    </button>
                  </div>
                  {agencies.map((agency) => (
                    <div
                      key={agency.id}
                      className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {agency.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {agency.location}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            agency.status,
                          )}`}
                        >
                          {getStatusText(agency.status)}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Véhicules
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {agency.vehicles}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Revenus ce mois
                          </p>
                          <p className="text-sm font-bold text-primary-600">
                            {agency.revenue.toLocaleString()} DT
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                          Voir détails
                        </button>
                        <button className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                          Modifier
                        </button>
                        <button className="bg-white border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium">
                          {agency.status === "active"
                            ? "Désactiver"
                            : "Activer"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Users Tab */}
              {activeTab === "users" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      Gérer les utilisateurs
                    </h2>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                      />
                      <select className="px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none bg-white">
                        <option>Tous les rôles</option>
                        <option>Clients</option>
                        <option>Admins Agences</option>
                        <option>Super Admins</option>
                      </select>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Utilisateur
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rôle
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Agence
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Inscrit le
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {user.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {user.email}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadge(
                                  user.role,
                                )}`}
                              >
                                {getRoleText(user.role)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.agency || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.registeredAt).toLocaleDateString(
                                "fr-FR",
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-primary-600 hover:text-primary-900 mr-3">
                                Modifier
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                Supprimer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Statistics Tab */}
              {activeTab === "statistics" && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Statistiques de la plateforme
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Revenus par mois
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Février 2026
                          </span>
                          <span className="text-lg font-bold text-primary-600">
                            145,890 DT
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Janvier 2026
                          </span>
                          <span className="text-lg font-bold text-gray-900">
                            132,450 DT
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Décembre 2025
                          </span>
                          <span className="text-lg font-bold text-gray-900">
                            178,230 DT
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Croissance des utilisateurs
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Ce mois</span>
                          <span className="text-lg font-bold text-green-600">
                            +48
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Total actif
                          </span>
                          <span className="text-lg font-bold text-gray-900">
                            487
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Taux de croissance
                          </span>
                          <span className="text-lg font-bold text-gray-900">
                            +12%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Performance des réservations
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Taux de conversion
                          </span>
                          <span className="text-lg font-bold text-primary-600">
                            68%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Durée moyenne
                          </span>
                          <span className="text-lg font-bold text-gray-900">
                            4.2 jours
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Valeur moyenne
                          </span>
                          <span className="text-lg font-bold text-gray-900">
                            385 DT
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Taux d'occupation global
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Cette semaine
                          </span>
                          <span className="text-lg font-bold text-primary-600">
                            74%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Ce mois</span>
                          <span className="text-lg font-bold text-gray-900">
                            69%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Moyenne</span>
                          <span className="text-lg font-bold text-gray-900">
                            71%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Mobile Sidebar Animation Styles */}
      <style>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
