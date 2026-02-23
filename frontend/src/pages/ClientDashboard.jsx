import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import DashboardHeader from "../components/DashboardHeader";

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Mock user data - replace with actual API call
  const user = {
    name: "Ahmed Ben Salem",
    email: "ahmed@example.com",
    phone: "+216 98 765 432",
    clientScore: 85,
    reservations: 12,
    totalSpent: 4580,
  };

  // Mock reservations data
  const reservations = [
    {
      id: 1,
      vehicle: "Mercedes-Benz Classe E",
      startDate: "2026-03-01",
      endDate: "2026-03-05",
      status: "confirmed",
      price: 600,
      agency: "Elite Drive Centre-Ville",
    },
    {
      id: 2,
      vehicle: "BMW Série 3",
      startDate: "2026-02-15",
      endDate: "2026-02-18",
      status: "completed",
      price: 360,
      agency: "Elite Drive La Marsa",
    },
    {
      id: 3,
      vehicle: "Renault Clio",
      startDate: "2026-01-10",
      endDate: "2026-01-12",
      status: "completed",
      price: 90,
      agency: "Elite Drive Sousse",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-600";
      case "completed":
        return "bg-green-100 text-green-600";
      case "cancelled":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return "Confirmée";
      case "completed":
        return "Terminée";
      case "cancelled":
        return "Annulée";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Dashboard Header */}
      <DashboardHeader
        title="Tableau de bord Client"
        subtitle={`Bienvenue, ${user.name}`}
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
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {/* Total Reservations */}
            <div className="group bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {user.reservations}
              </p>
              <p className="text-sm text-gray-600 font-medium">
                Réservations totales
              </p>
            </div>

            {/* Total Spent */}
            <div className="group bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg
                    className="w-7 h-7 text-white"
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
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {user.totalSpent} DT
              </p>
              <p className="text-sm text-gray-600 font-medium">
                Dépenses totales
              </p>
            </div>

            {/* Client Score */}
            <div className="group bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </div>
                <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 rounded-full">
                  <span className="text-xs font-bold text-yellow-700">
                    Excellent
                  </span>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {user.clientScore}/100
              </p>
              <p className="text-sm text-gray-600 font-medium">
                Score de fiabilité
              </p>
            </div>

            {/* CTA Card */}
            <div className="group bg-gradient-to-br from-primary-600 to-primary-700 backdrop-blur-xl rounded-3xl p-6 shadow-2xl text-white hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 hover:from-primary-700 hover:to-primary-800">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg
                    className="w-7 h-7"
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
              </div>
              <p className="text-2xl font-bold mb-2">Nouvelle réservation</p>
              <button
                onClick={() => navigate("/vehicles")}
                className="mt-2 w-full text-sm bg-white/20 hover:bg-white/30 backdrop-blur-sm px-5 py-3 rounded-xl transition-all duration-300 font-bold flex items-center justify-center gap-2 border border-white/30"
              >
                Réserver maintenant
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
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
                {activeTab === "overview" && "Mes Réservations"}
                {activeTab === "history" && "Historique"}
                {activeTab === "simulator" && "Simulateur de prix"}
                {activeTab === "profile" && "Mon Profil"}
              </span>
              <div className="w-10"></div>
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
                  Mes Réservations
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex-1 px-6 py-5 text-sm font-semibold transition-all duration-300 relative ${
                    activeTab === "history"
                      ? "text-primary-700 bg-white/60"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/30"
                  }`}
                >
                  {activeTab === "history" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-full" />
                  )}
                  Historique
                </button>
                <button
                  onClick={() => setActiveTab("simulator")}
                  className={`flex-1 px-6 py-5 text-sm font-semibold transition-all duration-300 relative ${
                    activeTab === "simulator"
                      ? "text-primary-700 bg-white/60"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/30"
                  }`}
                >
                  {activeTab === "simulator" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-full" />
                  )}
                  Simulateur de prix
                </button>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex-1 px-6 py-5 text-sm font-semibold transition-all duration-300 relative ${
                    activeTab === "profile"
                      ? "text-primary-700 bg-white/60"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/30"
                  }`}
                >
                  {activeTab === "profile" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-full" />
                  )}
                  Mon Profil
                </button>
              </nav>
            </div>

            {/* Mobile Sidebar */}
            {isSidebarOpen && (
              <>
                <div
                  className="lg:hidden fixed inset-0 bg-black/50 z-40"
                  onClick={() => setIsSidebarOpen(false)}
                ></div>

                <div className="lg:hidden fixed left-0 top-0 bottom-0 w-72 z-50 animate-slideInLeft">
                  <div className="h-full bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-2xl border-r border-white/60 shadow-2xl rounded-r-3xl flex flex-col">
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
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        Mes Réservations
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab("history");
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all ${
                          activeTab === "history"
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
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Historique
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab("simulator");
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all ${
                          activeTab === "simulator"
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
                            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                        Simulateur de prix
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab("profile");
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all ${
                          activeTab === "profile"
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
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Mon Profil
                      </button>
                    </nav>
                  </div>
                </div>
              </>
            )}

            <div className="p-8">
              {/* Reservations Tab */}
              {activeTab === "overview" && (
                <div className="space-y-5">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Réservations en cours
                  </h2>
                  {reservations
                    .filter((r) => r.status === "confirmed")
                    .map((reservation) => (
                      <div
                        key={reservation.id}
                        className="group bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-lg rounded-2xl p-6 border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                              {reservation.vehicle}
                            </h3>
                            <p className="text-sm text-gray-600 font-medium">
                              {reservation.agency}
                            </p>
                          </div>
                          <span
                            className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${getStatusColor(
                              reservation.status,
                            )}`}
                          >
                            {getStatusText(reservation.status)}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-white/50 rounded-xl p-3">
                            <p className="text-xs text-gray-500 mb-1 font-semibold">
                              Début
                            </p>
                            <p className="text-sm font-bold text-gray-900">
                              {new Date(
                                reservation.startDate,
                              ).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                          <div className="bg-white/50 rounded-xl p-3">
                            <p className="text-xs text-gray-500 mb-1 font-semibold">
                              Fin
                            </p>
                            <p className="text-sm font-bold text-gray-900">
                              {new Date(reservation.endDate).toLocaleDateString(
                                "fr-FR",
                              )}
                            </p>
                          </div>
                          <div className="bg-white/50 rounded-xl p-3">
                            <p className="text-xs text-gray-500 mb-1 font-semibold">
                              Prix total
                            </p>
                            <p className="text-lg font-bold text-primary-600">
                              {reservation.price} DT
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-3 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 text-sm font-bold shadow-lg hover:shadow-xl">
                            Télécharger contrat
                          </button>
                          <button className="flex-1 bg-white/80 backdrop-blur-sm border border-white/60 text-gray-700 px-4 py-3 rounded-xl hover:bg-white transition-all duration-300 text-sm font-bold shadow-md hover:shadow-lg">
                            Voir détails
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* History Tab */}
              {activeTab === "history" && (
                <div className="space-y-5">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Historique complet
                  </h2>
                  {reservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="group bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-lg rounded-2xl p-6 border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                            {reservation.vehicle}
                          </h3>
                          <p className="text-sm text-gray-600 font-medium">
                            {reservation.agency}
                          </p>
                        </div>
                        <span
                          className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${getStatusColor(
                            reservation.status,
                          )}`}
                        >
                          {getStatusText(reservation.status)}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-white/50 rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-1 font-semibold">
                            Début
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            {new Date(reservation.startDate).toLocaleDateString(
                              "fr-FR",
                            )}
                          </p>
                        </div>
                        <div className="bg-white/50 rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-1 font-semibold">
                            Fin
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            {new Date(reservation.endDate).toLocaleDateString(
                              "fr-FR",
                            )}
                          </p>
                        </div>
                        <div className="bg-white/50 rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-1 font-semibold">
                            Prix total
                          </p>
                          <p className="text-lg font-bold text-primary-600">
                            {reservation.price} DT
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Price Simulator Tab */}
              {activeTab === "simulator" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Simuler le prix de location
                  </h2>
                  <div className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-lg rounded-2xl p-8 border border-white/60 shadow-xl">
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          Catégorie de véhicule
                        </label>
                        <select className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none bg-white/80 backdrop-blur-sm font-medium shadow-sm hover:shadow-md transition-all">
                          <option>Économique</option>
                          <option>SUV</option>
                          <option>Luxe</option>
                          <option>Sport</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          Nombre de jours
                        </label>
                        <input
                          type="number"
                          min="1"
                          defaultValue="3"
                          className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none bg-white/80 backdrop-blur-sm font-medium shadow-sm hover:shadow-md transition-all"
                        />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-primary-50 to-blue-50 backdrop-blur-sm rounded-2xl p-8 border-2 border-primary-200 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-2 font-semibold">
                            Prix estimé
                          </p>
                          <p className="text-4xl font-bold text-primary-600">
                            135 DT
                          </p>
                        </div>
                        <button className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 font-bold shadow-lg hover:shadow-xl flex items-center gap-2">
                          Réserver maintenant
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
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Gérer mon profil
                  </h2>
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-lg rounded-2xl p-8 border border-white/60 shadow-xl">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3">
                            Nom complet
                          </label>
                          <input
                            type="text"
                            defaultValue={user.name}
                            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none bg-white/80 backdrop-blur-sm font-medium shadow-sm hover:shadow-md transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3">
                            Email
                          </label>
                          <input
                            type="email"
                            defaultValue={user.email}
                            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none bg-white/80 backdrop-blur-sm font-medium shadow-sm hover:shadow-md transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3">
                            Téléphone
                          </label>
                          <input
                            type="tel"
                            defaultValue={user.phone}
                            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none bg-white/80 backdrop-blur-sm font-medium shadow-sm hover:shadow-md transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3">
                            Permis de conduire
                          </label>
                          <input
                            type="text"
                            placeholder="Numéro de permis"
                            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none bg-white/80 backdrop-blur-sm font-medium shadow-sm hover:shadow-md transition-all"
                          />
                        </div>
                      </div>
                      <div className="mt-8 flex gap-4">
                        <button className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 font-bold shadow-lg hover:shadow-xl">
                          Enregistrer les modifications
                        </button>
                        <button className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl hover:bg-white transition-all duration-300 font-bold shadow-md hover:shadow-lg">
                          Annuler
                        </button>
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

export default ClientDashboard;
