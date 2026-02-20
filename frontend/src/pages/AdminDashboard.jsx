import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

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

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Tableau de bord Administrateur
            </h1>
            <p className="text-gray-600">
              Gestion de la plateforme Elite Drive
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary-600"
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
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {platformStats.totalAgencies}
              </p>
              <p className="text-sm text-gray-600">Agences</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600"
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
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {platformStats.totalUsers}
              </p>
              <p className="text-sm text-gray-600">Utilisateurs</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-indigo-600"
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
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {platformStats.totalVehicles}
              </p>
              <p className="text-sm text-gray-600">Véhicules</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-orange-600"
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
              <p className="text-2xl font-bold text-gray-900">
                {platformStats.totalReservations}
              </p>
              <p className="text-sm text-gray-600">Réservations</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
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
              <p className="text-2xl font-bold text-gray-900">
                {platformStats.monthlyRevenue.toLocaleString()} DT
              </p>
              <p className="text-sm text-gray-600">Revenus totaux</p>
            </div>

            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 shadow-lg text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
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
              </div>
              <p className="text-2xl font-bold">
                {platformStats.activeReservations}
              </p>
              <p className="text-sm text-white/80">Actives</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === "overview"
                      ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Vue d'ensemble
                </button>
                <button
                  onClick={() => setActiveTab("agencies")}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === "agencies"
                      ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Gérer Agences
                </button>
                <button
                  onClick={() => setActiveTab("users")}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === "users"
                      ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Gérer Utilisateurs
                </button>
                <button
                  onClick={() => setActiveTab("statistics")}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === "statistics"
                      ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Statistiques
                </button>
              </nav>
            </div>

            <div className="p-6">
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
    </div>
  );
};

export default AdminDashboard;
