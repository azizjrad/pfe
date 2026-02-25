import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
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
import ConfirmationModal from "../components/ConfirmationModal";
import EditModal from "../components/EditModal";
import Toast from "../components/Toast";
import { adminService } from "../services/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // State for API data
  const [platformStats, setPlatformStats] = useState({
    totalAgencies: 0,
    totalUsers: 0,
    totalVehicles: 0,
    totalReservations: 0,
    monthlyRevenue: 0,
    activeReservations: 0,
  });
  const [agencies, setAgencies] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: null,
    item: null,
  });
  const [editModal, setEditModal] = useState({
    isOpen: false,
    type: null,
    item: null,
  });

  // Toast notification state
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast({ isVisible: false, message: "", type: "success" });
  };

  // Fetch data on component mount (only for super_admin)
  useEffect(() => {
    if (user?.role === "super_admin") {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, agenciesRes, usersRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAgencies(),
        adminService.getUsers(),
      ]);

      setPlatformStats(statsRes.data);
      setAgencies(agenciesRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      console.error("Error response:", error.response);

      // Show more specific error message
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors du chargement des données";
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete handlers
  const handleDeleteAgency = async (id) => {
    try {
      await adminService.deleteAgency(id);
      setAgencies(agencies.filter((a) => a.id !== id));
      setPlatformStats((prev) => ({
        ...prev,
        totalAgencies: prev.totalAgencies - 1,
      }));
      showToast("Agence supprimée avec succès", "success");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Erreur lors de la suppression",
        "error",
      );
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await adminService.deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
      setPlatformStats((prev) => ({
        ...prev,
        totalUsers: prev.totalUsers - 1,
      }));
      showToast("Utilisateur supprimé avec succès", "success");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Erreur lors de la suppression",
        "error",
      );
    }
  };

  // Edit handlers
  const handleEditAgency = async (updatedData) => {
    try {
      const response = await adminService.updateAgency(
        updatedData.id,
        updatedData,
      );
      setAgencies(
        agencies.map((a) =>
          a.id === updatedData.id ? { ...a, ...response.data } : a,
        ),
      );
      showToast("Agence modifiée avec succès", "success");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Erreur lors de la modification",
        "error",
      );
      throw error;
    }
  };

  const handleEditUser = async (updatedData) => {
    try {
      const response = await adminService.updateUser(
        updatedData.id,
        updatedData,
      );
      setUsers(
        users.map((u) =>
          u.id === updatedData.id ? { ...u, ...response.data } : u,
        ),
      );
      showToast("Utilisateur modifié avec succès", "success");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Erreur lors de la modification",
        "error",
      );
      throw error;
    }
  };

  // Role-based tab configuration
  const getTabsConfig = () => {
    switch (user?.role) {
      case "super_admin":
        return [
          { id: "overview", label: "Vue d'ensemble", icon: "home" },
          { id: "agencies", label: "Gérer Agences", icon: "building" },
          { id: "users", label: "Gérer Utilisateurs", icon: "users" },
          { id: "statistics", label: "Statistiques", icon: "chart" },
        ];
      case "agency_admin":
        return [
          { id: "overview", label: "Réservations", icon: "clipboard" },
          { id: "vehicles", label: "Gérer Véhicules", icon: "car" },
          { id: "alerts", label: "Alertes", icon: "bell" },
          { id: "statistics", label: "Statistiques", icon: "chart" },
        ];
      case "client":
        return [
          { id: "overview", label: "Mes Réservations", icon: "clipboard" },
          { id: "history", label: "Historique", icon: "clock" },
        ];
      default:
        return [];
    }
  };

  const tabs = getTabsConfig();

  // Role-based title
  const getDashboardTitle = () => {
    switch (user?.role) {
      case "super_admin":
        return {
          title: "Administration Globale",
          subtitle: "Gérez l'ensemble de la plateforme Elite Drive",
        };
      case "agency_admin":
        return {
          title: "Tableau de Bord Agence",
          subtitle: "Gérez votre agence et vos véhicules",
        };
      case "client":
        return {
          title: "Mon Espace Client",
          subtitle: "Gérez vos réservations et consultez votre historique",
        };
      default:
        return { title: "Tableau de Bord", subtitle: "" };
    }
  };

  const { title, subtitle } = getDashboardTitle();

  // Get statistics cards based on role
  const getStatsCards = () => {
    switch (user?.role) {
      case "super_admin":
        return [
          {
            title: "Agences",
            value: platformStats.totalAgencies?.toString() || "0",
            change: "Total",
            trend: "neutral",
            icon: "building",
            color: "blue",
          },
          {
            title: "Utilisateurs",
            value: platformStats.totalUsers?.toString() || "0",
            change: "Inscrits",
            trend: "up",
            icon: "users",
            color: "green",
          },
          {
            title: "Véhicules",
            value: platformStats.totalVehicles?.toString() || "0",
            change: "Total",
            trend: "neutral",
            icon: "car",
            color: "purple",
          },
          {
            title: "Revenu Mensuel",
            value: platformStats.monthlyRevenue
              ? `${platformStats.monthlyRevenue.toLocaleString()} DT`
              : "0 DT",
            change: "Ce mois",
            trend: "up",
            icon: "money",
            color: "emerald",
          },
        ];
      case "agency_admin":
        return [
          {
            title: "Véhicules Totaux",
            value: "24",
            change: "18 disponibles",
            trend: "neutral",
            icon: "car",
            color: "blue",
          },
          {
            title: "Réservations Actives",
            value: "12",
            change: "+3 cette semaine",
            trend: "up",
            icon: "clipboard",
            color: "green",
          },
          {
            title: "Revenu du Mois",
            value: "12 450 DT",
            change: "+8.3%",
            trend: "up",
            icon: "money",
            color: "emerald",
          },
          {
            title: "Alertes",
            value: "3",
            change: "2 maintenances",
            trend: "warning",
            icon: "bell",
            color: "yellow",
          },
        ];
      case "client":
        return [
          {
            title: "Réservations Actives",
            value: "1",
            change: "En cours",
            trend: "neutral",
            icon: "clipboard",
            color: "blue",
          },
          {
            title: "Historique Total",
            value: "8",
            change: "Locations complétées",
            trend: "neutral",
            icon: "clock",
            color: "green",
          },
          {
            title: "Dépenses Totales",
            value: "3 240 DT",
            change: "Cette année",
            trend: "neutral",
            icon: "money",
            color: "purple",
          },
          {
            title: "Score Fiabilité",
            value: "95%",
            change: "Excellent",
            trend: "up",
            icon: "star",
            color: "yellow",
          },
        ];
      default:
        return [];
    }
  };

  const statsCards = getStatsCards();

  // Get icon for stats cards
  const getStatIcon = (iconName) => {
    const icons = {
      building: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      ),
      users: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      ),
      car: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
        />
      ),
      money: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
      clipboard: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      ),
      bell: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      ),
      clock: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
      star: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      ),
    };
    return icons[iconName] || icons.building;
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: "from-blue-500 to-blue-600",
        light: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-200",
      },
      green: {
        bg: "from-green-500 to-green-600",
        light: "bg-green-50",
        text: "text-green-600",
        border: "border-green-200",
      },
      purple: {
        bg: "from-purple-500 to-purple-600",
        light: "bg-purple-50",
        text: "text-purple-600",
        border: "border-purple-200",
      },
      emerald: {
        bg: "from-emerald-500 to-emerald-600",
        light: "bg-emerald-50",
        text: "text-emerald-600",
        border: "border-emerald-200",
      },
      yellow: {
        bg: "from-yellow-500 to-yellow-600",
        light: "bg-yellow-50",
        text: "text-yellow-600",
        border: "border-yellow-200",
      },
    };
    return colors[color] || colors.blue;
  };

  const getTrendIcon = (trend) => {
    if (trend === "up")
      return (
        <svg
          className="w-4 h-4 text-green-500"
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
      );
    if (trend === "down")
      return (
        <svg
          className="w-4 h-4 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
          />
        </svg>
      );
    if (trend === "warning")
      return (
        <svg
          className="w-4 h-4 text-yellow-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      );
    return null;
  };

  // Get icon SVG based on name
  const getIcon = (iconName) => {
    const icons = {
      home: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      ),
      building: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      ),
      users: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      ),
      chart: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      ),
      clipboard: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      ),
      car: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
        />
      ),
      bell: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      ),
      clock: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
      calculator: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      ),
    };
    return icons[iconName] || icons.home;
  };

  // Render tab content based on role and active tab
  const renderTabContent = () => {
    const role = user?.role;

    if (role === "super_admin") {
      return (
        <AdminContent
          activeTab={activeTab}
          platformStats={platformStats}
          agencies={agencies}
          users={users}
          loading={loading}
          onDeleteAgency={(id) => {
            setDeleteModal({
              isOpen: true,
              type: "agency",
              item: agencies.find((a) => a.id === id),
            });
          }}
          onEditAgency={(item) => {
            setEditModal({ isOpen: true, type: "agency", item });
          }}
          onDeleteUser={(id) => {
            setDeleteModal({
              isOpen: true,
              type: "user",
              item: users.find((u) => u.id === id),
            });
          }}
          onEditUser={(item) => {
            setEditModal({ isOpen: true, type: "user", item });
          }}
        />
      );
    } else if (role === "agency_admin") {
      return <AgencyContent activeTab={activeTab} />;
    } else if (role === "client") {
      return <ClientContent activeTab={activeTab} navigate={navigate} />;
    }

    return (
      <div className="text-center py-12 text-gray-500">
        Rôle utilisateur non reconnu
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gray-50">
      <DashboardHeader title={title} subtitle={subtitle} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Home Button */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="group flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors duration-300"
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
              <span className="font-medium">Accueil</span>
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((card, index) => {
              const colorClasses = getColorClasses(card.color);
              return (
                <div
                  key={index}
                  className={`relative bg-white rounded-2xl border ${colorClasses.border} shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group`}
                >
                  {/* Gradient Background Accent */}
                  <div
                    className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses.bg} opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300`}
                  ></div>

                  <div className="relative p-6">
                    {/* Icon and Title */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 ${colorClasses.light} rounded-xl`}>
                        <svg
                          className={`w-6 h-6 ${colorClasses.text}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {getStatIcon(card.icon)}
                        </svg>
                      </div>
                      {getTrendIcon(card.trend)}
                    </div>

                    {/* Stats */}
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600">
                        {card.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {card.value}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        {card.change}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
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
                {tabs.find((t) => t.id === activeTab)?.label || "Dashboard"}
              </span>
              <div className="w-10"></div>
            </div>

            {/* Desktop Tabs */}
            <div className="hidden lg:block border-b border-white/40 bg-white/30">
              <nav className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-6 py-5 text-sm font-semibold transition-all duration-300 relative ${
                      activeTab === tab.id
                        ? "text-primary-700 bg-white/60"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/30"
                    }`}
                  >
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-full" />
                    )}
                    {tab.label}
                  </button>
                ))}
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
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setIsSidebarOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all ${
                            activeTab === tab.id
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
                            {getIcon(tab.icon)}
                          </svg>
                          {tab.label}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </>
            )}

            {/* Tab Content */}
            <div className="p-8">{renderTabContent()}</div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Modals */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, type: null, item: null })
        }
        onConfirm={() => {
          if (deleteModal.type === "agency") {
            handleDeleteAgency(deleteModal.item.id);
          } else if (deleteModal.type === "user") {
            handleDeleteUser(deleteModal.item.id);
          }
          setDeleteModal({ isOpen: false, type: null, item: null });
        }}
        title={`Supprimer ${deleteModal.type === "agency" ? "l'agence" : "l'utilisateur"}`}
        message={`Êtes-vous sûr de vouloir supprimer ${deleteModal.type === "agency" ? `l'agence "${deleteModal.item?.name}"` : `l'utilisateur "${deleteModal.item?.name}"`} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        danger
      />

      <EditModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, type: null, item: null })}
        onSave={async (updatedData) => {
          if (editModal.type === "agency") {
            await handleEditAgency(updatedData);
          } else if (editModal.type === "user") {
            await handleEditUser(updatedData);
          }
          setEditModal({ isOpen: false, type: null, item: null });
        }}
        type={editModal.type}
        item={editModal.item}
      />

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />

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

// Super Admin Content Component
const AdminContent = ({
  activeTab,
  platformStats,
  agencies,
  users,
  loading,
  onDeleteAgency,
  onEditAgency,
  onDeleteUser,
  onEditUser,
}) => {
  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const getStatusColor = (status) =>
    status === "active"
      ? "bg-green-100 text-green-600"
      : "bg-red-100 text-red-600";
  const getRoleBadge = (role) => {
    const badges = {
      super_admin: "bg-purple-100 text-purple-600",
      agency_admin: "bg-blue-100 text-blue-600",
      client: "bg-gray-100 text-gray-600",
    };
    return badges[role] || "bg-gray-100 text-gray-600";
  };

  if (activeTab === "overview") {
    return (
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
                    <p className="font-medium text-gray-800">{agency.name}</p>
                    <p className="text-sm text-gray-500">
                      {agency.vehicles} véhicules
                    </p>
                  </div>
                  <p className="font-bold text-primary-600">
                    {agency.revenue.toLocaleString()} DT
                  </p>
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
                <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Nouvelle agence créée
                  </p>
                  <p className="text-xs text-gray-500">Il y a 2 jours</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    15 nouveaux utilisateurs
                  </p>
                  <p className="text-xs text-gray-500">Aujourd'hui</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-yellow-500"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    45 réservations traitées
                  </p>
                  <p className="text-xs text-gray-500">Aujourd'hui</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "agencies") {
    return (
      <div className="space-y-5">
        <h2 className="text-xl font-bold text-gray-900">Gestion des Agences</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Agence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Localisation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Véhicules
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Revenu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {agencies.map((agency) => (
                <tr key={agency.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {agency.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {agency.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {agency.vehicles}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                    {agency.revenue.toLocaleString()} DT
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agency.status)}`}
                    >
                      {agency.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEditAgency(agency)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => onDeleteAgency(agency.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeTab === "users") {
    return (
      <div className="space-y-5">
        <h2 className="text-xl font-bold text-gray-900">
          Gestion des Utilisateurs
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Agence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Inscrit le
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}
                    >
                      {user.role === "client"
                        ? "Client"
                        : user.role === "agency_admin"
                          ? "Admin Agence"
                          : "Super Admin"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.agency || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.registeredAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEditUser(user)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => onDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeTab === "statistics") {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">
          Statistiques Globales
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-600 font-medium">
                Total Agences
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-3xl font-bold text-blue-900">
                {platformStats.totalAgencies}
              </span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-600 font-medium">
                Total Utilisateurs
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-3xl font-bold text-green-900">
                {platformStats.totalUsers}
              </span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-purple-600 font-medium">
                Revenu Mensuel
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-3xl font-bold text-purple-900">
                {platformStats.monthlyRevenue.toLocaleString()} DT
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Agency Admin Content Component
const AgencyContent = ({ activeTab }) => {
  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"];

  const revenueData = [
    { month: "Août", revenue: 8200 },
    { month: "Sept", revenue: 9500 },
    { month: "Oct", revenue: 11200 },
    { month: "Nov", revenue: 10800 },
    { month: "Déc", revenue: 15890 },
    { month: "Jan", revenue: 10230 },
    { month: "Fév", revenue: 12450 },
  ];

  const vehicles = [
    {
      id: 1,
      name: "Mercedes-Benz Classe E",
      category: "Luxe",
      price: 150,
      status: "available",
    },
    {
      id: 2,
      name: "BMW Série 3",
      category: "Luxe",
      price: 120,
      status: "rented",
    },
    {
      id: 3,
      name: "Renault Clio",
      category: "Économique",
      price: 45,
      status: "available",
    },
  ];

  if (activeTab === "overview") {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">
          Réservations Actives
        </h2>
        <div className="text-center py-8 text-gray-500">
          Aucune réservation active pour le moment
        </div>
      </div>
    );
  }

  if (activeTab === "vehicles") {
    return (
      <div className="space-y-5">
        <h2 className="text-xl font-bold text-gray-900">
          Gestion des Véhicules
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-gray-50 rounded-xl p-6 border border-gray-200"
            >
              <h3 className="font-semibold text-gray-900 mb-2">
                {vehicle.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{vehicle.category}</p>
              <p className="text-lg font-bold text-primary-600 mb-3">
                {vehicle.price} DT/jour
              </p>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  vehicle.status === "available"
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {vehicle.status === "available" ? "Disponible" : "Loué"}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === "alerts") {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">
          Alertes et Notifications
        </h2>
        <div className="text-center py-8 text-gray-500">
          Aucune alerte pour le moment
        </div>
      </div>
    );
  }

  if (activeTab === "statistics") {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">
          Statistiques de l'Agence
        </h2>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Évolution du Revenu</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Revenu (DT)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return null;
};

// Client Content Component
const ClientContent = ({ activeTab, navigate }) => {
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
  ];

  const getStatusColor = (status) => {
    const colors = {
      confirmed: "bg-green-100 text-green-600",
      pending: "bg-yellow-100 text-yellow-600",
      completed: "bg-gray-100 text-gray-600",
      cancelled: "bg-red-100 text-red-600",
    };
    return colors[status] || "bg-gray-100 text-gray-600";
  };

  const getStatusText = (status) => {
    const texts = {
      confirmed: "Confirmée",
      pending: "En attente",
      completed: "Terminée",
      cancelled: "Annulée",
    };
    return texts[status] || status;
  };

  if (activeTab === "overview") {
    return (
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Mes Réservations</h2>
          <button
            onClick={() => navigate("/vehicles")}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Nouvelle réservation
          </button>
        </div>

        <div className="grid gap-5">
          {reservations
            .filter((r) => r.status === "confirmed")
            .map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {reservation.vehicle}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {reservation.agency}
                    </p>
                    <div className="flex gap-4 mt-3 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Début:</span>{" "}
                        {reservation.startDate}
                      </div>
                      <div>
                        <span className="font-medium">Fin:</span>{" "}
                        {reservation.endDate}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}
                    >
                      {getStatusText(reservation.status)}
                    </span>
                    <p className="text-lg font-bold text-primary-600 mt-3">
                      {reservation.price} DT
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  if (activeTab === "history") {
    return (
      <div className="space-y-5">
        <h2 className="text-xl font-bold text-gray-900">
          Historique des Réservations
        </h2>
        <div className="grid gap-5">
          {reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="bg-white rounded-xl p-6 border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {reservation.vehicle}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {reservation.agency}
                  </p>
                  <div className="flex gap-4 mt-3 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Début:</span>{" "}
                      {reservation.startDate}
                    </div>
                    <div>
                      <span className="font-medium">Fin:</span>{" "}
                      {reservation.endDate}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}
                  >
                    {getStatusText(reservation.status)}
                  </span>
                  <p className="text-lg font-bold text-primary-600 mt-3">
                    {reservation.price} DT
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default Dashboard;
