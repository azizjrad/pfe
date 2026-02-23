import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Footer from "../components/Footer";
import DashboardHeader from "../components/DashboardHeader";

const AgencyDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Mock agency data
  const agency = {
    name: "Elite Drive Centre-Ville",
    location: "Tunis",
    totalVehicles: 15,
    activeReservations: 8,
    monthlyRevenue: 12450,
    pendingReturns: 3,
    revenueGrowth: 21.5,
    occupationRate: 78,
    avgDailyRevenue: 414,
  };

  // Financial data for charts
  const revenueData = [
    { month: "Août", revenue: 8200, reservations: 45 },
    { month: "Sept", revenue: 9500, reservations: 52 },
    { month: "Oct", revenue: 11200, reservations: 61 },
    { month: "Nov", revenue: 10800, reservations: 58 },
    { month: "Déc", revenue: 15890, reservations: 78 },
    { month: "Jan", revenue: 10230, reservations: 56 },
    { month: "Fév", revenue: 12450, reservations: 68 },
  ];

  const occupationData = [
    { week: "Sem 1", occupied: 12, available: 3 },
    { week: "Sem 2", occupied: 10, available: 5 },
    { week: "Sem 3", occupied: 14, available: 1 },
    { week: "Sem 4", occupied: 11, available: 4 },
  ];

  const categoryRevenueData = [
    { name: "Économique", value: 3200, percentage: 26 },
    { name: "Berline", value: 4800, percentage: 38 },
    { name: "SUV", value: 2400, percentage: 19 },
    { name: "Luxe", value: 2050, percentage: 17 },
  ];

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"];

  const dailyRevenueData = [
    { day: "Lun", revenue: 380 },
    { day: "Mar", revenue: 520 },
    { day: "Mer", revenue: 450 },
    { day: "Jeu", revenue: 610 },
    { day: "Ven", revenue: 720 },
    { day: "Sam", revenue: 890 },
    { day: "Dim", revenue: 650 },
  ];

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
      {/* Dashboard Header */}
      <DashboardHeader
        title="Tableau de bord Agence"
        subtitle={`${agency.name} - ${agency.location}`}
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

          <div className="mb-8">
            <p className="text-gray-600">
              {agency.name} - {agency.location}
            </p>
          </div>

          {/* Enhanced Stats Cards with Glassmorphism */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Vehicles */}
            <div className="group bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
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
                      d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                    />
                  </svg>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {agency.totalVehicles}
              </p>
              <p className="text-sm text-gray-600 font-medium">
                Véhicules totaux
              </p>
            </div>

            {/* Active Reservations */}
            <div className="group bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="px-2 py-1 bg-purple-100 rounded-lg">
                  <span className="text-xs font-bold text-purple-600">
                    Actif
                  </span>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {agency.activeReservations}
              </p>
              <p className="text-sm text-gray-600 font-medium">
                Réservations actives
              </p>
            </div>

            {/* Monthly Revenue with Growth */}
            <div className="group bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
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
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-lg">
                  <svg
                    className="w-3 h-3 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                  <span className="text-xs font-bold text-green-600">
                    +{agency.revenueGrowth}%
                  </span>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {agency.monthlyRevenue.toLocaleString()} DT
              </p>
              <p className="text-sm text-gray-600 font-medium">
                Revenus ce mois
              </p>
            </div>

            {/* Occupation Rate */}
            <div className="group bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div className="w-16 h-16 relative">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="#E5E7EB"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="#F59E0B"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${agency.occupationRate * 1.76} 176`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-700">
                      {agency.occupationRate}%
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {agency.occupationRate}%
              </p>
              <p className="text-sm text-gray-600 font-medium">
                Taux d'occupation
              </p>
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
                {activeTab === "overview" && "Réservations"}
                {activeTab === "vehicles" && "Gérer Véhicules"}
                {activeTab === "alerts" && "Alertes"}
                {activeTab === "statistics" && "Statistiques"}
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
                  Réservations
                </button>
                <button
                  onClick={() => setActiveTab("vehicles")}
                  className={`flex-1 px-6 py-5 text-sm font-semibold transition-all duration-300 relative ${
                    activeTab === "vehicles"
                      ? "text-primary-700 bg-white/60"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/30"
                  }`}
                >
                  {activeTab === "vehicles" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-full" />
                  )}
                  Gérer Véhicules
                </button>
                <button
                  onClick={() => setActiveTab("alerts")}
                  className={`flex-1 px-6 py-5 text-sm font-semibold transition-all duration-300 relative ${
                    activeTab === "alerts"
                      ? "text-primary-700 bg-white/60"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/30"
                  }`}
                >
                  {activeTab === "alerts" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-full" />
                  )}
                  Alertes
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
                        Réservations
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab("vehicles");
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all ${
                          activeTab === "vehicles"
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
                            d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                          />
                        </svg>
                        Gérer Véhicules
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab("alerts");
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all ${
                          activeTab === "alerts"
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
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                        Alertes
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
              {/* Reservations Tab */}
              {activeTab === "overview" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Traiter les réservations
                    </h2>
                  </div>
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
                            Client: {reservation.client}
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
                      {reservation.status === "pending" && (
                        <div className="flex gap-3">
                          <button className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 text-sm font-bold shadow-lg hover:shadow-xl">
                            Approuver
                          </button>
                          <button className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-3 rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-300 text-sm font-bold shadow-lg hover:shadow-xl">
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
                <div className="space-y-5">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Gérer les véhicules
                    </h2>
                    <button className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 font-bold flex items-center gap-2 shadow-lg hover:shadow-xl">
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
                      className="group bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-lg rounded-2xl p-6 border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                            {vehicle.name}
                          </h3>
                          <p className="text-sm text-gray-600 font-medium">
                            {vehicle.category} • {vehicle.registrationNumber}
                          </p>
                        </div>
                        <span
                          className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${getStatusColor(
                            vehicle.status,
                          )}`}
                        >
                          {getStatusText(vehicle.status)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-4 py-2 rounded-xl">
                          <p className="text-2xl font-bold text-primary-700">
                            {vehicle.price} DT
                            <span className="text-sm font-medium text-primary-600">
                              /jour
                            </span>
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <button className="bg-white/80 backdrop-blur-sm border border-white/60 text-gray-700 px-5 py-2 rounded-xl hover:bg-white transition-all duration-300 text-sm font-bold shadow-md hover:shadow-lg">
                            Modifier
                          </button>
                          <button className="bg-white/80 backdrop-blur-sm border border-red-200 text-red-600 px-5 py-2 rounded-xl hover:bg-red-50 transition-all duration-300 text-sm font-bold shadow-md hover:shadow-lg">
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Voir les alertes
                  </h2>
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-4 p-5 rounded-2xl border backdrop-blur-lg shadow-lg hover:shadow-xl transition-all duration-300 ${
                        alert.type === "warning"
                          ? "bg-gradient-to-r from-yellow-50/90 to-amber-50/80 border-yellow-200/60"
                          : alert.type === "info"
                            ? "bg-gradient-to-r from-blue-50/90 to-cyan-50/80 border-blue-200/60"
                            : "bg-gradient-to-r from-green-50/90 to-emerald-50/80 border-green-200/60"
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 p-2 rounded-xl ${
                          alert.type === "warning"
                            ? "text-yellow-600 bg-yellow-100/80"
                            : alert.type === "info"
                              ? "text-blue-600 bg-blue-100/80"
                              : "text-green-600 bg-green-100/80"
                        }`}
                      >
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 font-medium">
                          {new Date(alert.date).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Enhanced Statistics Tab with Charts */}
              {activeTab === "statistics" && (
                <div>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Consulter les statistiques
                    </h2>
                    <p className="text-gray-600">
                      Analyse financière et performance de votre agence
                    </p>
                  </div>

                  {/* Financial KPIs Row */}
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-lg rounded-2xl p-6 border border-blue-200/50 shadow-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
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
                              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                            />
                          </svg>
                        </div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                          vs mois dernier
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 font-semibold mb-1">
                        Revenus moyens/jour
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mb-2">
                        {agency.avgDailyRevenue} DT
                      </p>
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                          />
                        </svg>
                        <span className="text-sm font-bold text-green-600">
                          +18.5%
                        </span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/5 backdrop-blur-lg rounded-2xl p-6 border border-green-200/50 shadow-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
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
                        <span className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                          Février 2026
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 font-semibold mb-1">
                        Revenus totaux
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mb-2">
                        {agency.monthlyRevenue.toLocaleString()} DT
                      </p>
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                          />
                        </svg>
                        <span className="text-sm font-bold text-green-600">
                          +{agency.revenueGrowth}%
                        </span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-lg rounded-2xl p-6 border border-purple-200/50 shadow-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
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
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                        </div>
                        <span className="text-xs font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                          Performance
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 font-semibold mb-1">
                        Taux d'occupation
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mb-2">
                        {agency.occupationRate}%
                      </p>
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                          />
                        </svg>
                        <span className="text-sm font-bold text-green-600">
                          +12%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Trend Chart */}
                  <div className="bg-gradient-to-br from-white/90 to-white/50 backdrop-blur-xl rounded-3xl p-8 border border-white/60 shadow-xl mb-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          Tendance des revenus
                        </h3>
                        <p className="text-sm text-gray-600">
                          Évolution mensuelle sur 7 mois
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-600">
                            Revenus
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-600">
                            Réservations
                          </span>
                        </div>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient
                            id="colorRevenue"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#2D3748"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#2D3748"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="colorReservations"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#3B82F6"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#3B82F6"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                          dataKey="month"
                          stroke="#6B7280"
                          style={{ fontSize: "12px", fontWeight: 600 }}
                        />
                        <YAxis
                          stroke="#6B7280"
                          style={{ fontSize: "12px", fontWeight: 600 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(229, 231, 235, 0.8)",
                            borderRadius: "12px",
                            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                            fontWeight: 600,
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#2D3748"
                          strokeWidth={3}
                          fill="url(#colorRevenue)"
                        />
                        <Area
                          type="monotone"
                          dataKey="reservations"
                          stroke="#3B82F6"
                          strokeWidth={3}
                          fill="url(#colorReservations)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Charts Grid */}
                  <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    {/* Occupation Chart */}
                    <div className="bg-gradient-to-br from-white/90 to-white/50 backdrop-blur-xl rounded-3xl p-8 border border-white/60 shadow-xl">
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          Taux d'occupation hebdomadaire
                        </h3>
                        <p className="text-sm text-gray-600">
                          Véhicules occupés vs disponibles
                        </p>
                      </div>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={occupationData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#E5E7EB"
                          />
                          <XAxis
                            dataKey="week"
                            stroke="#6B7280"
                            style={{ fontSize: "12px", fontWeight: 600 }}
                          />
                          <YAxis
                            stroke="#6B7280"
                            style={{ fontSize: "12px", fontWeight: 600 }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(255, 255, 255, 0.95)",
                              backdropFilter: "blur(10px)",
                              border: "1px solid rgba(229, 231, 235, 0.8)",
                              borderRadius: "12px",
                              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                              fontWeight: 600,
                            }}
                          />
                          <Legend
                            wrapperStyle={{ fontWeight: 600, fontSize: "13px" }}
                          />
                          <Bar
                            dataKey="occupied"
                            fill="#10B981"
                            radius={[8, 8, 0, 0]}
                            name="Occupés"
                          />
                          <Bar
                            dataKey="available"
                            fill="#6B7280"
                            radius={[8, 8, 0, 0]}
                            name="Disponibles"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Revenue by Category */}
                    <div className="bg-gradient-to-br from-white/90 to-white/50 backdrop-blur-xl rounded-3xl p-8 border border-white/60 shadow-xl">
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          Revenus par catégorie
                        </h3>
                        <p className="text-sm text-gray-600">
                          Distribution mensuelle
                        </p>
                      </div>
                      <div className="flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={280}>
                          <PieChart>
                            <Pie
                              data={categoryRevenueData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {categoryRevenueData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(229, 231, 235, 0.8)",
                                borderRadius: "12px",
                                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                                fontWeight: 600,
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        {categoryRevenueData.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-xl p-3"
                          >
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: COLORS[index] }}
                            ></div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-600 font-semibold">
                                {item.name}
                              </p>
                              <p className="text-sm font-bold text-gray-900">
                                {item.value} DT
                              </p>
                            </div>
                            <span className="text-xs font-bold text-gray-500">
                              {item.percentage}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Daily Revenue Chart */}
                  <div className="bg-gradient-to-br from-white/90 to-white/50 backdrop-blur-xl rounded-3xl p-8 border border-white/60 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          Revenus journaliers
                        </h3>
                        <p className="text-sm text-gray-600">Cette semaine</p>
                      </div>
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg">
                        <p className="text-xs font-semibold">Total semaine</p>
                        <p className="text-lg font-bold">
                          {dailyRevenueData
                            .reduce((sum, day) => sum + day.revenue, 0)
                            .toLocaleString()}{" "}
                          DT
                        </p>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={dailyRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                          dataKey="day"
                          stroke="#6B7280"
                          style={{ fontSize: "12px", fontWeight: 600 }}
                        />
                        <YAxis
                          stroke="#6B7280"
                          style={{ fontSize: "12px", fontWeight: 600 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(229, 231, 235, 0.8)",
                            borderRadius: "12px",
                            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                            fontWeight: 600,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#8B5CF6"
                          strokeWidth={3}
                          dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 5 }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
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

export default AgencyDashboard;
