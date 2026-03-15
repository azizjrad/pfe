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
import Footer from "../components/common/Footer";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import ConfirmationModal from "../components/modals/ConfirmationModal";
import EditModal from "../components/modals/EditModal";
import Toast from "../components/common/Toast";
import ReservationDetailsModal from "../components/modals/ReservationDetailsModal";
import DetailsModal from "../components/modals/DetailsModal";
import Pagination from "../components/features/Pagination";
import NotificationButton from "../components/dashboard/NotificationButton";
import VehicleCard from "../components/cards/VehicleCard";
import AdminContent from "../components/dashboard/AdminContent";
import AgencyContent from "../components/dashboard/AgencyContent";
import ClientContent from "../components/dashboard/ClientContent";
import {
  adminService,
  agencyService,
  clientService,
  contactService,
  reservationService,
  reportService,
  reviewService,
} from "../services/api";

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
  const [allReservations, setAllReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: null,
    item: null,
  });
  const [suspendModal, setSuspendModal] = useState({
    isOpen: false,
    type: null, // 'user' or 'agency'
    item: null,
  });
  const [editModal, setEditModal] = useState({
    isOpen: false,
    type: null,
    item: null,
  });
  const [detailsModal, setDetailsModal] = useState({
    isOpen: false,
    type: null, // 'agency' or 'user'
    item: null,
    userReviews: [], // Reviews written BY the user
    reports: [], // Reports against this user/agency
    userReportsSubmitted: [], // Reports submitted BY the user (for users only)
    vehicles: [], // Vehicles belonging to the agency (for agencies only)
  });
  const [reports, setReports] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [agencyReviews, setAgencyReviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [financialStats, setFinancialStats] = useState({
    monthly: [],
    byAgency: [],
    paymentMethods: [],
    totals: { revenue: 0, commission: 0, profit: 0, avgMonthly: 0 },
  });
  const [agencyStats, setAgencyStats] = useState({
    totalVehicles: 0,
    availableVehicles: 0,
    maintenanceVehicles: 0,
    activeReservations: 0,
    monthlyRevenue: 0,
    alertsCount: 0,
  });
  const [clientStats, setClientStats] = useState({
    activeReservations: 0,
    completedReservations: 0,
    totalSpend: 0,
    reliabilityScore: 100,
    riskLabel: "Excellent",
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

  // State for statistics sub-tabs
  const [statisticsSubTab, setStatisticsSubTab] = useState("finance");

  // Handle refresh button click
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (user?.role === "super_admin") {
        await fetchDashboardData();
        await fetchContactMessages();
        if (activeTab === "statistics" && statisticsSubTab === "finance") {
          await fetchFinancialStats();
        }
      } else if (user?.role === "agency_admin") {
        await Promise.all([
          fetchAgencyStats(),
          fetchReports(),
          fetchNotifications(),
        ]);
      } else if (user?.role === "client") {
        await Promise.all([fetchClientStats(), fetchNotifications()]);
      }
      showToast("Données actualisées avec succès", "success");
    } catch (error) {
      console.error("Error refreshing data:", error);
      showToast("Erreur lors de l'actualisation des données", "error");
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch financial stats when statistics tab with finance sub-tab is opened
  useEffect(() => {
    if (
      user?.role === "super_admin" &&
      activeTab === "statistics" &&
      statisticsSubTab === "finance"
    ) {
      fetchFinancialStats();
    }
  }, [activeTab, statisticsSubTab, user]);

  // Fetch data on component mount (only for super_admin)
  useEffect(() => {
    if (user?.role === "super_admin") {
      fetchDashboardData();
      fetchContactMessages();
    } else if (user?.role === "agency_admin") {
      fetchAgencyStats();
      fetchReports(); // Agencies can view vehicle reports
      fetchNotifications();
    } else if (user?.role === "client") {
      fetchClientStats();
      fetchNotifications();
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

      // Fetch other dashboard data
      await fetchAgencyReviews();
      await fetchNotifications();
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

  // Fetch agency reviews from API
  const fetchAgencyReviews = async () => {
    try {
      const response = await adminService.getReviews();
      const reviews = response.data?.data || response.data || [];
      setAgencyReviews(Array.isArray(reviews) ? reviews : []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setAgencyReviews([]);
    }
  };

  // Fetch agency stats for agency_admin dashboard
  const fetchAgencyStats = async () => {
    try {
      const response = await agencyService.getStats();
      setAgencyStats(response.data.data);
    } catch (error) {
      console.error("Error fetching agency stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch client stats for client dashboard
  const fetchClientStats = async () => {
    try {
      const response = await clientService.getStats();
      setClientStats(response.data.data);
    } catch (error) {
      console.error("Error fetching client stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications derived from reservation events
  const fetchNotifications = async () => {
    try {
      const response = await clientService.getNotifications();
      setNotifications(response.data.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Initialize mock notifications (TODO: Replace with API call)

  // Fetch reports from API
  // Fetch user details (reviews and reports) for DetailsModal
  const fetchUserDetails = async (userId) => {
    try {
      const [userReviews, reportsAgainst, reportsSubmitted] = await Promise.all(
        [
          reviewService.getUserReviews(userId),
          reportService.getUserReportsAgainst(userId),
          reportService.getUserReportsSubmitted(userId),
        ],
      );

      return {
        userReviews: userReviews.data || [],
        reports: reportsAgainst.data || [],
        userReportsSubmitted: reportsSubmitted.data || [],
      };
    } catch (error) {
      console.error("Error fetching user details:", error);
      return {
        userReviews: [],
        reports: [],
        userReportsSubmitted: [],
      };
    }
  };

  // Fetch agency details (reports + vehicles) for DetailsModal
  const fetchAgencyDetails = async (agencyId) => {
    try {
      const [reportsAgainst, vehiclesRes] = await Promise.all([
        reportService.getAgencyReportsAgainst(agencyId),
        adminService.getAgencyVehicles(agencyId),
      ]);

      return {
        reports: reportsAgainst.data || [],
        vehicles: vehiclesRes.data || [],
      };
    } catch (error) {
      console.error("Error fetching agency details:", error);
      return {
        reports: [],
        vehicles: [],
      };
    }
  };

  // Open user details modal with data
  const openUserDetailsModal = async (user) => {
    try {
      const details = await fetchUserDetails(user.id);
      setDetailsModal({
        isOpen: true,
        type: "user",
        item: user,
        ...details,
      });
    } catch (error) {
      console.error("Error opening user details:", error);
      showToast(
        "Erreur lors du chargement des détails de l'utilisateur",
        "error",
      );
    }
  };

  // Open agency details modal with data
  const openAgencyDetailsModal = async (agency) => {
    try {
      const details = await fetchAgencyDetails(agency.id);
      setDetailsModal({
        isOpen: true,
        type: "agency",
        item: agency,
        reports: details.reports,
        vehicles: details.vehicles,
        userReviews: [],
        userReportsSubmitted: [],
      });
    } catch (error) {
      console.error("Error opening agency details:", error);
      showToast("Erreur lors du chargement des détails de l'agence", "error");
    }
  };

  const fetchReports = async () => {
    try {
      const agencyReports = await reportService.getAgencyReports();

      const mappedReports = agencyReports.data.map((report) => ({
        id: report.id,
        reportType: report.report_type,
        targetId: report.target_id,
        targetName: report.target_name,
        reason: report.reason,
        description: report.description,
        reportedBy: report.reported_by_name,
        reportedAt: report.created_at,
        status: report.status,
        adminNotes: report.admin_notes,
        resolvedAt: report.resolved_at,
      }));

      setReports(mappedReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      showToast(
        error.response?.data?.message ||
          "Erreur lors du chargement des signalements",
        "error",
      );
    }
  };

  const fetchContactMessages = async () => {
    try {
      const response = await contactService.getAll();
      const messages = response.data || [];
      setContactMessages(Array.isArray(messages) ? messages : []);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      showToast(
        error.response?.data?.message ||
          "Erreur lors du chargement des messages de contact",
        "error",
      );
    }
  };

  const handleMarkMessageRead = async (id) => {
    try {
      await contactService.markAsRead(id);
      setContactMessages((prev) =>
        prev.map((message) =>
          message.id === id ? { ...message, is_read: true } : message,
        ),
      );
      showToast("Message marque comme lu", "success");
    } catch (error) {
      console.error("Error marking message as read:", error);
      showToast(
        error.response?.data?.message || "Erreur lors de la mise a jour",
        "error",
      );
    }
  };

  const handleDeleteContactMessage = async (id) => {
    try {
      await contactService.delete(id);
      setContactMessages((prev) => prev.filter((message) => message.id !== id));
      showToast("Message supprime avec succes", "success");
    } catch (error) {
      console.error("Error deleting contact message:", error);
      showToast(
        error.response?.data?.message || "Erreur lors de la suppression",
        "error",
      );
    }
  };

  // Fetch financial statistics from API
  const fetchFinancialStats = async () => {
    try {
      const response = await adminService.getFinancialStats();
      setFinancialStats(response.data);
    } catch (error) {
      console.error("Error fetching financial stats:", error);
      showToast(
        error.response?.data?.message ||
          "Erreur lors du chargement des statistiques financières",
        "error",
      );
    }
  };

  // Handle agency review submission
  const handleSubmitReview = async (reviewData) => {
    try {
      // TODO: Replace with API call
      const newReview = {
        id: agencyReviews.length + 1,
        ...reviewData,
        user_id: user.id,
        user_name: user.name,
        created_at: new Date().toISOString(),
      };
      setAgencyReviews((prev) => [newReview, ...prev]);
      showToast("Avis publié avec succès");
    } catch (error) {
      console.error("Error submitting review:", error);
      showToast("Erreur lors de la publication de l'avis", "error");
      throw error;
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
          { id: "users", label: "Gérer Utilisateurs", icon: "users" },
          { id: "agencies", label: "Gérer Agences", icon: "building" },
          { id: "messages", label: "Messages Contact", icon: "mail" },
          { id: "statistics", label: "Consulter Statistiques", icon: "chart" },
        ];
      case "agency_admin":
        return [
          { id: "overview", label: "Actives", icon: "clipboard" },
          { id: "reservations", label: "Toutes", icon: "list" },
          { id: "vehicles", label: "Véhicules", icon: "car" },
          { id: "reports", label: "Signalements", icon: "flag" },
          { id: "financial", label: "Finances", icon: "credit-card" },
          { id: "alerts", label: "Alertes", icon: "bell" },
          { id: "statistics", label: "Statistiques", icon: "chart" },
        ];
      case "client":
        return [
          { id: "overview", label: "Mes Réservations", icon: "clipboard" },
          { id: "saved", label: "Véhicules Sauvegardés", icon: "heart" },
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
            value: agencyStats.totalVehicles.toString(),
            change: `${agencyStats.availableVehicles} disponibles`,
            trend: "neutral",
            icon: "car",
            color: "blue",
          },
          {
            title: "Réservations Actives",
            value: agencyStats.activeReservations.toString(),
            change: "En cours",
            trend: "up",
            icon: "clipboard",
            color: "green",
          },
          {
            title: "Revenu du Mois",
            value: `${agencyStats.monthlyRevenue.toLocaleString()} DT`,
            change: "Ce mois",
            trend: "up",
            icon: "money",
            color: "emerald",
          },
          {
            title: "Alertes",
            value: agencyStats.alertsCount.toString(),
            change: `${agencyStats.maintenanceVehicles} maintenances`,
            trend: agencyStats.alertsCount > 0 ? "warning" : "neutral",
            icon: "bell",
            color: "yellow",
          },
        ];
      case "client":
        return [
          {
            title: "Réservations Actives",
            value: clientStats.activeReservations.toString(),
            change: "En cours",
            trend: "neutral",
            icon: "clipboard",
            color: "blue",
          },
          {
            title: "Historique Total",
            value: clientStats.completedReservations.toString(),
            change: "Locations complétées",
            trend: "neutral",
            icon: "clock",
            color: "green",
          },
          {
            title: "Dépenses Totales",
            value: `${Number(clientStats.totalSpend).toLocaleString()} DT`,
            change: "Cette année",
            trend: "neutral",
            icon: "money",
            color: "purple",
          },
          {
            title: "Score Fiabilité",
            value: `${clientStats.reliabilityScore}%`,
            change: clientStats.riskLabel,
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
      flag: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
        />
      ),
      list: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 10h16M4 14h16M4 18h16"
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
      heart: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      ),
      "credit-card": (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      ),
      mail: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8m-18 9h18a2 2 0 002-2V7a2 2 0 00-2-2H3a2 2 0 00-2 2v8a2 2 0 002 2z"
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
          statisticsSubTab={statisticsSubTab}
          setStatisticsSubTab={setStatisticsSubTab}
          platformStats={platformStats}
          agencies={agencies}
          users={users}
          loading={loading}
          contactMessages={contactMessages}
          financialStats={financialStats}
          user={user}
          onDeleteAgency={(id) => {
            setDeleteModal({
              isOpen: true,
              type: "agency",
              item: agencies.find((a) => a.id === id),
            });
          }}
          onEditAgency={(item) => {
            setSuspendModal({
              isOpen: true,
              type: "agency",
              item: agency,
            });
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
          onSuspendUser={(user) => {
            setSuspendModal({
              isOpen: true,
              type: "user",
              item: user,
            });
          }}
          onViewUserDetails={async (user) => {
            try {
              await openUserDetailsModal(user);
            } catch (error) {
              console.error("Error viewing user details:", error);
              showToast("Erreur lors de l'ouverture des détails", "error");
            }
          }}
          onViewAgencyDetails={async (agency) => {
            try {
              await openAgencyDetailsModal(agency);
            } catch (error) {
              console.error("Error viewing agency details:", error);
              showToast("Erreur lors de l'ouverture des détails", "error");
            }
          }}
          onResolveReport={handleResolveReport}
          onDismissReport={handleDismissReport}
          onDeleteReport={handleDeleteReport}
          onRestoreReport={handleRestoreReport}
          onPermanentDeleteReport={handlePermanentDeleteReport}
          onMarkMessageRead={handleMarkMessageRead}
          onDeleteContactMessage={handleDeleteContactMessage}
          onViewReportDetails={(report) => {
            setReportDetailsModal({ isOpen: true, report });
          }}
        />
      );
    } else if (role === "agency_admin") {
      return <AgencyContent activeTab={activeTab} reports={reports} />;
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
      <DashboardHeader title={title} subtitle={subtitle}>
        <NotificationButton
          userRole={user?.role}
          notifications={notifications}
        />
      </DashboardHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Refresh Data Button */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`group p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg ${
                refreshing ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title="Actualiser les données"
            >
              <svg
                className={`w-5 h-5 transition-transform duration-500 ${
                  refreshing ? "animate-spin" : "group-hover:rotate-180"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
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
                  className="lg:hidden fixed inset-0 bg-black/50 z-[100]"
                  onClick={() => setIsSidebarOpen(false)}
                ></div>

                <div className="lg:hidden fixed left-0 top-0 bottom-0 w-72 z-[110] animate-slideInLeft">
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

                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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

      {/* Suspend/Block Confirmation Modal */}
      <ConfirmationModal
        isOpen={suspendModal.isOpen}
        onClose={() =>
          setSuspendModal({ isOpen: false, type: null, item: null })
        }
        onConfirm={async () => {
          try {
            if (suspendModal.type === "agency") {
              const agency = suspendModal.item;
              const newStatus =
                agency.status === "active" ? "inactive" : "active";
              await adminService.suspendAgency(agency.id, newStatus);
              showToast(
                agency.status === "inactive"
                  ? "Agence débloquée avec succès"
                  : "Agence bloquée avec succès",
                "success",
              );
            } else if (suspendModal.type === "user") {
              const user = suspendModal.item;
              await adminService.suspendUser(user.id, !user.is_suspended);
              showToast(
                user.is_suspended
                  ? "Utilisateur débloqué avec succès"
                  : "Utilisateur bloqué avec succès",
                "success",
              );
            }
            fetchDashboardData();
          } catch (error) {
            console.error("Error suspending:", error);
            showToast("Erreur lors de la modification du statut", "error");
          }
          setSuspendModal({ isOpen: false, type: null, item: null });
        }}
        title={
          suspendModal.type === "agency"
            ? suspendModal.item?.status === "inactive"
              ? "Débloquer l'agence"
              : "Bloquer l'agence"
            : suspendModal.item?.is_suspended
              ? "Débloquer l'utilisateur"
              : "Bloquer l'utilisateur"
        }
        message={
          suspendModal.type === "agency"
            ? suspendModal.item?.status === "inactive"
              ? `Êtes-vous sûr de vouloir débloquer l'agence "${suspendModal.item?.name}" ? Elle pourra à nouveau fonctionner normalement.`
              : `Êtes-vous sûr de vouloir bloquer l'agence "${suspendModal.item?.name}" ? Elle ne pourra plus accepter de réservations.`
            : suspendModal.item?.is_suspended
              ? `Êtes-vous sûr de vouloir débloquer l'utilisateur "${suspendModal.item?.name}" ? Il pourra à nouveau accéder à son compte.`
              : `Êtes-vous sûr de vouloir bloquer l'utilisateur "${suspendModal.item?.name}" ? Il ne pourra plus se connecter.`
        }
        confirmText={
          suspendModal.type === "agency"
            ? suspendModal.item?.status === "inactive"
              ? "Débloquer"
              : "Bloquer"
            : suspendModal.item?.is_suspended
              ? "Débloquer"
              : "Bloquer"
        }
        cancelText="Annuler"
        danger={
          suspendModal.type === "agency"
            ? suspendModal.item?.status === "active"
            : !suspendModal.item?.is_suspended
        }
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
        agencies={agencies}
        reviews={
          editModal.type === "agency" && editModal.item?.id
            ? (Array.isArray(agencyReviews) ? agencyReviews : []).filter(
                (r) => r.agency_id === editModal.item.id,
              )
            : []
        }
        userRole={user?.role}
        userId={user?.id}
        userReservations={allReservations.filter(
          (r) => r.user_id === user?.id || r.client_id === user?.id,
        )}
        onSubmitReview={handleSubmitReview}
      />

      <DetailsModal
        isOpen={detailsModal.isOpen}
        onClose={() =>
          setDetailsModal({
            isOpen: false,
            type: null,
            item: null,
            userReviews: [],
            reports: [],
            userReportsSubmitted: [],
            vehicles: [],
          })
        }
        type={detailsModal.type}
        item={detailsModal.item}
        reviews={
          detailsModal.type === "agency" && detailsModal.item?.id
            ? (Array.isArray(agencyReviews) ? agencyReviews : []).filter(
                (r) => r.agency_id === detailsModal.item.id,
              )
            : []
        }
        reservations={allReservations}
        userReviews={detailsModal.userReviews || []}
        reports={detailsModal.reports || []}
        userReportsSubmitted={detailsModal.userReportsSubmitted || []}
        vehicles={detailsModal.vehicles || []}
        onEdit={(item) => {
          setDetailsModal({
            isOpen: false,
            type: null,
            item: null,
            userReviews: [],
            reports: [],
            userReportsSubmitted: [],
            vehicles: [],
          });
          setEditModal({ isOpen: true, type: detailsModal.type, item });
        }}
        onDelete={(itemId) => {
          const item =
            detailsModal.type === "agency"
              ? agencies.find((a) => a.id === itemId)
              : users.find((u) => u.id === itemId);
          setDetailsModal({
            isOpen: false,
            type: null,
            item: null,
            userReviews: [],
            reports: [],
            userReportsSubmitted: [],
            vehicles: [],
          });
          setDeleteModal({
            isOpen: true,
            type: detailsModal.type,
            item,
          });
        }}
        onSuspend={(user) => {
          setDetailsModal({
            isOpen: false,
            type: null,
            item: null,
            userReviews: [],
            reports: [],
            userReportsSubmitted: [],
            vehicles: [],
          });
          setSuspendModal({
            isOpen: true,
            type: "user",
            item: user,
          });
        }}
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
export default Dashboard;
