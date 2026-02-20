import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

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
              Tableau de bord Client
            </h1>
            <p className="text-gray-600">Bienvenue, {user.name}</p>
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {user.reservations}
              </p>
              <p className="text-sm text-gray-600">Réservations totales</p>
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
                {user.totalSpent} DT
              </p>
              <p className="text-sm text-gray-600">Dépenses totales</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-yellow-600"
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
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {user.clientScore}/100
              </p>
              <p className="text-sm text-gray-600">Score de fiabilité</p>
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold mb-1">Nouvelle réservation</p>
              <button
                onClick={() => navigate("/vehicles")}
                className="mt-2 text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                Réserver maintenant →
              </button>
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
                  Mes Réservations
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === "history"
                      ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Historique
                </button>
                <button
                  onClick={() => setActiveTab("simulator")}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === "simulator"
                      ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Simulateur de prix
                </button>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === "profile"
                      ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Mon Profil
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* Reservations Tab */}
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Réservations en cours
                  </h2>
                  {reservations
                    .filter((r) => r.status === "confirmed")
                    .map((reservation) => (
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
                              {reservation.agency}
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
                              {new Date(
                                reservation.startDate,
                              ).toLocaleDateString("fr-FR")}
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
                        <div className="flex gap-2">
                          <button className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                            Télécharger contrat
                          </button>
                          <button className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                            Voir détails
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* History Tab */}
              {activeTab === "history" && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Historique complet
                  </h2>
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
                            {reservation.agency}
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
                      <div className="grid md:grid-cols-3 gap-4">
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
                    </div>
                  ))}
                </div>
              )}

              {/* Price Simulator Tab */}
              {activeTab === "simulator" && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Simuler le prix de location
                  </h2>
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Catégorie de véhicule
                        </label>
                        <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none bg-white">
                          <option>Économique</option>
                          <option>SUV</option>
                          <option>Luxe</option>
                          <option>Sport</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre de jours
                        </label>
                        <input
                          type="number"
                          min="1"
                          defaultValue="3"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 border-2 border-primary-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Prix estimé
                          </p>
                          <p className="text-3xl font-bold text-primary-600">
                            135 DT
                          </p>
                        </div>
                        <button className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium">
                          Réserver maintenant
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Gérer mon profil
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nom complet
                          </label>
                          <input
                            type="text"
                            defaultValue={user.name}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            defaultValue={user.email}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Téléphone
                          </label>
                          <input
                            type="tel"
                            defaultValue={user.phone}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Permis de conduire
                          </label>
                          <input
                            type="text"
                            placeholder="Numéro de permis"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none bg-white"
                          />
                        </div>
                      </div>
                      <div className="mt-6 flex gap-3">
                        <button className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium">
                          Enregistrer les modifications
                        </button>
                        <button className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium">
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
    </div>
  );
};

export default ClientDashboard;
