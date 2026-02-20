import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

const AgencyDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock agency data
  const agency = {
    name: "Elite Drive Centre-Ville",
    location: "Tunis",
    totalVehicles: 15,
    activeReservations: 8,
    monthlyRevenue: 12450,
    pendingReturns: 3,
  };

  // Mock vehicles data
  const vehicles = [
    {
      id: 1,
      name: "Mercedes-Benz Classe E",
      category: "Luxe",
      price: 150,
      status: "available",
      registrationNumber: "123 TUN 456",
    },
    {
      id: 2,
      name: "BMW Série 3",
      category: "Luxe",
      price: 120,
      status: "rented",
      registrationNumber: "234 TUN 567",
    },
    {
      id: 3,
      name: "Renault Clio",
      category: "Économique",
      price: 45,
      status: "maintenance",
      registrationNumber: "345 TUN 678",
    },
  ];

  // Mock reservations data
  const reservations = [
    {
      id: 1,
      client: "Ahmed Ben Salem",
      vehicle: "Mercedes-Benz Classe E",
      startDate: "2026-03-01",
      endDate: "2026-03-05",
      status: "pending",
      price: 600,
    },
    {
      id: 2,
      client: "Fatma Trabelsi",
      vehicle: "BMW Série 3",
      startDate: "2026-02-25",
      endDate: "2026-02-28",
      status: "active",
      price: 360,
    },
  ];

  // Mock alerts
  const alerts = [
    {
      id: 1,
      type: "warning",
      message: "Véhicule Mercedes-Benz nécessite une maintenance dans 2 jours",
      date: "2026-02-20",
    },
    {
      id: 2,
      type: "info",
      message: "Nouvelle réservation en attente de validation",
      date: "2026-02-19",
    },
    {
      id: 3,
      type: "success",
      message: "Paiement reçu pour la réservation #1234",
      date: "2026-02-18",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-600";
      case "rented":
        return "bg-blue-100 text-blue-600";
      case "maintenance":
        return "bg-yellow-100 text-yellow-600";
      case "pending":
        return "bg-orange-100 text-orange-600";
      case "active":
        return "bg-blue-100 text-blue-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "available":
        return "Disponible";
      case "rented":
        return "Loué";
      case "maintenance":
        return "Maintenance";
      case "pending":
        return "En attente";
      case "active":
        return "Active";
      default:
        return status;
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "warning":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "info":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "success":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
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
              Tableau de bord Agence
            </h1>
            <p className="text-gray-600">
              {agency.name} - {agency.location}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
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
                      d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {agency.totalVehicles}
              </p>
              <p className="text-sm text-gray-600">Véhicules totaux</p>
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {agency.activeReservations}
              </p>
              <p className="text-sm text-gray-600">Réservations actives</p>
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
                {agency.monthlyRevenue} DT
              </p>
              <p className="text-sm text-gray-600">Revenus ce mois</p>
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {agency.pendingReturns}
              </p>
              <p className="text-sm text-gray-600">Retours en attente</p>
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
                  Réservations
                </button>
                <button
                  onClick={() => setActiveTab("vehicles")}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === "vehicles"
                      ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Gérer Véhicules
                </button>
                <button
                  onClick={() => setActiveTab("alerts")}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === "alerts"
                      ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Alertes
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
              {/* Reservations Tab */}
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      Traiter les réservations
                    </h2>
                  </div>
                  {reservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {reservation.vehicle}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Client: {reservation.client}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            reservation.status,
                          )}`}
                        >
                          {getStatusText(reservation.status)}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Début</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(reservation.startDate).toLocaleDateString(
                              "fr-FR",
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Fin</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(reservation.endDate).toLocaleDateString(
                              "fr-FR",
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Prix total
                          </p>
                          <p className="text-sm font-bold text-primary-600">
                            {reservation.price} DT
                          </p>
                        </div>
                      </div>
                      {reservation.status === "pending" && (
                        <div className="flex gap-2">
                          <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                            Approuver
                          </button>
                          <button className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                            Rejeter
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Vehicles Tab */}
              {activeTab === "vehicles" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      Gérer les véhicules
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
                      Ajouter véhicule
                    </button>
                  </div>
                  {vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {vehicle.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {vehicle.category} • {vehicle.registrationNumber}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            vehicle.status,
                          )}`}
                        >
                          {getStatusText(vehicle.status)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-bold text-primary-600">
                          {vehicle.price} DT/jour
                        </p>
                        <div className="flex gap-2">
                          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                            Modifier
                          </button>
                          <button className="bg-white border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium">
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Alerts Tab */}
              {activeTab === "alerts" && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Voir les alertes
                  </h2>
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-4 p-4 rounded-xl border ${
                        alert.type === "warning"
                          ? "bg-yellow-50 border-yellow-200"
                          : alert.type === "info"
                            ? "bg-blue-50 border-blue-200"
                            : "bg-green-50 border-green-200"
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 ${
                          alert.type === "warning"
                            ? "text-yellow-600"
                            : alert.type === "info"
                              ? "text-blue-600"
                              : "text-green-600"
                        }`}
                      >
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(alert.date).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Statistics Tab */}
              {activeTab === "statistics" && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Consulter les statistiques
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Revenus mensuels
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Février 2026
                          </span>
                          <span className="text-lg font-bold text-primary-600">
                            12,450 DT
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Janvier 2026
                          </span>
                          <span className="text-lg font-bold text-gray-900">
                            10,230 DT
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Décembre 2025
                          </span>
                          <span className="text-lg font-bold text-gray-900">
                            15,890 DT
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Taux d'occupation
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Cette semaine
                          </span>
                          <span className="text-lg font-bold text-primary-600">
                            78%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Ce mois</span>
                          <span className="text-lg font-bold text-gray-900">
                            65%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Moyenne</span>
                          <span className="text-lg font-bold text-gray-900">
                            72%
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

export default AgencyDashboard;
