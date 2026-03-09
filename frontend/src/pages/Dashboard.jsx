import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import ReservationDetailsModal from "../components/ReservationDetailsModal";
import DetailsModal from "../components/DetailsModal";
import ReportDetailsModal from "../components/ReportDetailsModal";
import ResolveReportModal from "../components/ResolveReportModal";
import ReportsHistoryModal from "../components/ReportsHistoryModal";
import Pagination from "../components/Pagination";
import NotificationButton from "../components/NotificationButton";
import VehicleCard from "../components/VehicleCard";
import {
  adminService,
  agencyService,
  clientService,
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
  });
  const [reportDetailsModal, setReportDetailsModal] = useState({
    isOpen: false,
    report: null,
  });
  const [historyModal, setHistoryModal] = useState({
    isOpen: false,
    resolvedReports: [],
  });
  const [reports, setReports] = useState([]);
  const [trashedReports, setTrashedReports] = useState([]);
  const [reportsView, setReportsView] = useState("active"); // 'active' or 'trash'
  const [reportsFilter, setReportsFilter] = useState("all"); // 'all', 'pending', 'resolved', 'dismissed'
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

  // Fetch financial stats when statistics tab with finance sub-tab is opened
  useEffect(() => {
    if (user?.role === "super_admin" && activeTab === "statistics" && statisticsSubTab === "finance") {
      fetchFinancialStats();
    }
  }, [activeTab, statisticsSubTab, user]);

  // Fetch data on component mount (only for super_admin)
  useEffect(() => {
    if (user?.role === "super_admin") {
      fetchDashboardData();
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

      // Fetch reports and other data
      await fetchReports();
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
      setAgencyReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
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
      const [userReviews, reportsAgainst, reportsSubmitted] = await Promise.all([
        reviewService.getUserReviews(userId),
        reportService.getUserReportsAgainst(userId),
        reportService.getUserReportsSubmitted(userId),
      ]);

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

  // Fetch agency details (reports) for DetailsModal
  const fetchAgencyDetails = async (agencyId) => {
    try {
      const reportsAgainst = await reportService.getAgencyReportsAgainst(agencyId);

      return {
        reports: reportsAgainst.data || [],
      };
    } catch (error) {
      console.error("Error fetching agency details:", error);
      return {
        reports: [],
      };
    }
  };

  // Open user details modal with data
  const openUserDetailsModal = async (user) => {
    const details = await fetchUserDetails(user.id);
    setDetailsModal({
      isOpen: true,
      type: "user",
      item: user,
      ...details,
    });
  };

  // Open agency details modal with data
  const openAgencyDetailsModal = async (agency) => {
    const details = await fetchAgencyDetails(agency.id);
    setDetailsModal({
      isOpen: true,
      type: "agency",
      item: agency,
      reports: details.reports,
      userReviews: [],
      userReportsSubmitted: [],
    });
  };

  const fetchReports = async () => {
    try {
      // Agency admins only see reports about their vehicles (no trash access)
      if (user?.role === "agency_admin") {
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
        setTrashedReports([]); // Agencies don't have trash access
      } else {
        // Super admin sees all reports with trash
        const [activeReports, trashedReports] = await Promise.all([
          reportService.getAll(),
          reportService.getTrashed(),
        ]);

        // Map API response to frontend format
        const mappedActiveReports = activeReports.data.map((report) => ({
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

        const mappedTrashedReports = trashedReports.data.map((report) => ({
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
          autoDeleteAt: report.auto_delete_at,
        }));

        setReports(mappedActiveReports);
        setTrashedReports(mappedTrashedReports);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      showToast(
        error.response?.data?.message ||
          "Erreur lors du chargement des signalements",
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

  // Report handlers
  const handleResolveReport = async (report, notes) => {
    try {
      await reportService.resolve(report.id, notes);

      // Update local state
      setReports(
        reports.map((r) =>
          r.id === report.id
            ? {
                ...r,
                status: "resolved",
                resolvedAt: new Date().toISOString(),
                adminNotes: notes,
              }
            : r,
        ),
      );
      showToast("Signalement marqué comme résolu", "success");
    } catch (error) {
      console.error("Error resolving report:", error);
      showToast(
        error.response?.data?.message ||
          "Erreur lors de la résolution du signalement",
        "error",
      );
    }
  };

  const handleDismissReport = async (report, notes) => {
    try {
      await reportService.dismiss(report.id, notes);

      // Update local state
      setReports(
        reports.map((r) =>
          r.id === report.id
            ? {
                ...r,
                status: "dismissed",
                resolvedAt: new Date().toISOString(),
                adminNotes: notes,
              }
            : r,
        ),
      );
      showToast("Signalement rejeté", "success");
    } catch (error) {
      console.error("Error dismissing report:", error);
      showToast(
        error.response?.data?.message || "Erreur lors du rejet du signalement",
        "error",
      );
    }
  };

  const handleDeleteReport = async (report) => {
    try {
      await reportService.moveToTrash(report.id);

      // Move to trash locally with auto-delete date
      const trashedReport = {
        ...report,
        autoDeleteAt: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(), // 30 days from now
      };

      setReports(reports.filter((r) => r.id !== report.id));
      setTrashedReports([...trashedReports, trashedReport]);
      showToast("Signalement déplacé vers la corbeille", "success");
    } catch (error) {
      console.error("Error deleting report:", error);
      showToast(
        error.response?.data?.message ||
          "Erreur lors de la suppression du signalement",
        "error",
      );
    }
  };

  const handleRestoreReport = async (report) => {
    try {
      await reportService.restore(report.id);

      // Restore from trash locally
      const { autoDeleteAt, ...restoredReport } = report;

      setTrashedReports(trashedReports.filter((r) => r.id !== report.id));
      setReports([...reports, restoredReport]);
      showToast("Signalement restauré", "success");
    } catch (error) {
      console.error("Error restoring report:", error);
      showToast(
        error.response?.data?.message ||
          "Erreur lors de la restauration du signalement",
        "error",
      );
    }
  };

  const handlePermanentDeleteReport = async (report) => {
    try {
      await reportService.forceDelete(report.id);

      // Remove from trash locally
      setTrashedReports(trashedReports.filter((r) => r.id !== report.id));
      showToast("Signalement supprimé définitivement", "success");
    } catch (error) {
      console.error("Error permanently deleting report:", error);
      showToast(
        error.response?.data?.message ||
          "Erreur lors de la suppression définitive",
        "error",
      );
    }
  };

  // Auto-delete reports older than 30 days from trash
  useEffect(() => {
    const checkAndDeleteOldReports = () => {
      setTrashedReports((currentTrashedReports) => {
        const now = new Date().getTime();
        const filtered = currentTrashedReports.filter((report) => {
          const autoDeleteTime = new Date(report.autoDeleteAt).getTime();
          return autoDeleteTime > now;
        });

        if (filtered.length !== currentTrashedReports.length) {
          const deletedCount = currentTrashedReports.length - filtered.length;
          if (deletedCount > 0) {
            showToast(
              `${deletedCount} signalement(s) supprimé(s) automatiquement après 30 jours`,
              "info",
            );
          }
          return filtered;
        }
        return currentTrashedReports;
      });
    };

    // Check on mount and every hour
    checkAndDeleteOldReports();
    const interval = setInterval(checkAndDeleteOldReports, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

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
          { id: "reports", label: "Traiter Signalements", icon: "flag" },
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
          reports={reports}
          loading={loading}
          trashedReports={trashedReports}
          reportsView={reportsView}
          reportsFilter={reportsFilter}
          setReportsView={setReportsView}
          setReportsFilter={setReportsFilter}
          setHistoryModal={setHistoryModal}
          financialStats={financialStats}
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
          onSuspendAgency={(agency) => {
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
            await openUserDetailsModal(user);
          }}
          onResolveReport={handleResolveReport}
          onDismissReport={handleDismissReport}
          onDeleteReport={handleDeleteReport}
          onRestoreReport={handleRestoreReport}
          onPermanentDeleteReport={handlePermanentDeleteReport}
          onViewReportDetails={(report) => {
            setReportDetailsModal({ isOpen: true, report });
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
      <DashboardHeader title={title} subtitle={subtitle}>
        <NotificationButton
          userRole={user?.role}
          notifications={notifications}
        />
      </DashboardHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Home Button */}
          <div className="flex items-center justify-between">
            <Link
              to="/"
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
            </Link>
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
              const newStatus = agency.status === "active" ? "inactive" : "active";
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
        title={suspendModal.type === "agency" 
          ? (suspendModal.item?.status === "inactive" ? "Débloquer l'agence" : "Bloquer l'agence")
          : (suspendModal.item?.is_suspended ? "Débloquer l'utilisateur" : "Bloquer l'utilisateur")
        }
        message={suspendModal.type === "agency"
          ? (suspendModal.item?.status === "inactive" 
              ? `Êtes-vous sûr de vouloir débloquer l'agence "${suspendModal.item?.name}" ? Elle pourra à nouveau fonctionner normalement.`
              : `Êtes-vous sûr de vouloir bloquer l'agence "${suspendModal.item?.name}" ? Elle ne pourra plus accepter de réservations.`
            )
          : (suspendModal.item?.is_suspended
              ? `Êtes-vous sûr de vouloir débloquer l'utilisateur "${suspendModal.item?.name}" ? Il pourra à nouveau accéder à son compte.`
              : `Êtes-vous sûr de vouloir bloquer l'utilisateur "${suspendModal.item?.name}" ? Il ne pourra plus se connecter.`
            )
        }
        confirmText={suspendModal.type === "agency"
          ? (suspendModal.item?.status === "inactive" ? "Débloquer" : "Bloquer")
          : (suspendModal.item?.is_suspended ? "Débloquer" : "Bloquer")
        }
        cancelText="Annuler"
        danger={suspendModal.type === "agency" 
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
            ? agencyReviews.filter((r) => r.agency_id === editModal.item.id)
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
          })
        }
        type={detailsModal.type}
        item={detailsModal.item}
        reviews={
          detailsModal.type === "agency" && detailsModal.item?.id
            ? agencyReviews.filter((r) => r.agency_id === detailsModal.item.id)
            : []
        }
        reservations={allReservations}
        userReviews={detailsModal.userReviews || []}
        reports={detailsModal.reports || []}
        userReportsSubmitted={detailsModal.userReportsSubmitted || []}
        onEdit={(item) => {
          setDetailsModal({
            isOpen: false,
            type: null,
            item: null,
            userReviews: [],
            reports: [],
            userReportsSubmitted: [],
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
          });
          setSuspendModal({
            isOpen: true,
            type: "user",
            item: user,
          });
        }}
      />

      <ReportDetailsModal
        isOpen={reportDetailsModal.isOpen}
        onClose={() => setReportDetailsModal({ isOpen: false, report: null })}
        report={reportDetailsModal.report}
        onResolve={handleResolveReport}
        onDismiss={handleDismissReport}
        onDelete={handleDeleteReport}
      />

      <ReportsHistoryModal
        isOpen={historyModal.isOpen}
        onClose={() => setHistoryModal({ isOpen: false, resolvedReports: [] })}
        resolvedReports={historyModal.resolvedReports}
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
  statisticsSubTab,
  setStatisticsSubTab,
  platformStats,
  agencies,
  users,
  reports,
  loading,
  trashedReports,
  reportsView,
  reportsFilter,
  setReportsView,
  setReportsFilter,
  setHistoryModal,
  financialStats,
  onDeleteAgency,
  onEditAgency,
  onSuspendAgency,
  onDeleteUser,
  onEditUser,
  onSuspendUser,
  onViewUserDetails,
  onResolveReport,
  onDismissReport,
  onDeleteReport,
  onRestoreReport,
  onPermanentDeleteReport,
  onViewReportDetails,
}) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Resolve/Dismiss modal state
  const [resolveModal, setResolveModal] = useState({
    isOpen: false,
    type: null,
    report: null,
  });

  // Permanent delete confirmation modal state
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    isOpen: false,
    report: null,
  });

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
    const totalPages = Math.ceil((agencies || []).length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAgencies = (agencies || []).slice(startIndex, endIndex);

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Gestion des Agences
          </h2>
          <button
            onClick={() =>
              onEditAgency({
                id: null,
                name: "",
                address: "",
                phone: "",
                email: "",
                location: "",
              })
            }
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Ajouter une agence
          </button>
        </div>
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
              {paginatedAgencies.map((agency) => (
                <tr
                  key={agency.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={async () => await openAgencyDetailsModal(agency)}
                >
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
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditAgency(agency);
                      }}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSuspendAgency && onSuspendAgency(agency);
                      }}
                      className={`mr-3 ${
                        agency.status === "inactive"
                          ? "text-green-600 hover:text-green-900"
                          : "text-orange-600 hover:text-orange-900"
                      }`}
                    >
                      {agency.status === "inactive" ? "Débloquer" : "Bloquer"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteAgency(agency.id);
                      }}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            itemsPerPage={itemsPerPage}
            totalItems={(agencies || []).length}
          />
        )}
      </div>
    );
  }

  if (activeTab === "users") {
    const totalPages = Math.ceil((users || []).length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsers = (users || []).slice(startIndex, endIndex);

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Gestion des Utilisateurs
          </h2>
          <button
            onClick={() =>
              onEditUser({
                id: null,
                name: "",
                email: "",
                phone: "",
                role: "client",
                agency_id: null,
              })
            }
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Ajouter un utilisateur
          </button>
        </div>
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
              {paginatedUsers.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => onViewUserDetails && onViewUserDetails(user)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
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
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditUser(user);
                      }}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSuspendUser && onSuspendUser(user);
                      }}
                      className={`${
                        user.is_suspended
                          ? "text-green-600 hover:text-green-900"
                          : "text-orange-600 hover:text-orange-900"
                      }`}
                    >
                      {user.is_suspended ? "Débloquer" : "Bloquer"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            itemsPerPage={itemsPerPage}
            totalItems={(users || []).length}
          />
        )}
      </div>
    );
  }

  if (activeTab === "reports") {
    // Get the correct reports list based on view
    const currentReports = reportsView === "active" ? reports : trashedReports;

    // Filter reports based on selected filter (only for active view)
    const filteredReports =
      reportsView === "active"
        ? reportsFilter === "all"
          ? currentReports
          : currentReports.filter((r) => r.status === reportsFilter)
        : currentReports;

    const totalPages = Math.ceil((filteredReports || []).length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedReports = (filteredReports || []).slice(
      startIndex,
      endIndex,
    );

    // Get resolved reports for history
    const resolvedReports = reports.filter((r) => r.status === "resolved");

    return (
      <div className="space-y-5">
        {/* Header with Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {user?.role === "agency_admin"
                ? "Signalements de mes véhicules"
                : reportsView === "active"
                  ? "Signalements"
                  : "Corbeille"}
            </h2>
            {reportsView === "trash" && user?.role === "super_admin" && (
              <p className="text-sm text-gray-500 mt-1">
                Suppression automatique après 30 jours
              </p>
            )}
          </div>
          {user?.role === "super_admin" && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setHistoryModal({
                    isOpen: true,
                    resolvedReports: resolvedReports,
                  });
                }}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium flex items-center gap-2"
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Historique ({resolvedReports.length})
              </button>
              <button
                onClick={() => {
                  setReportsView(reportsView === "active" ? "trash" : "active");
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 ${
                  reportsView === "trash"
                    ? "bg-primary-600 text-white hover:bg-primary-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {reportsView === "trash" ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                )}
              </svg>
              {reportsView === "trash"
                ? "Retour"
                : `Corbeille (${trashedReports.length})`}
            </button>
          </div>
        </div>

        {/* Filter Buttons (only for active view) */}
        {reportsView === "active" && (
          <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl shadow-sm">
            <span className="text-sm font-medium text-gray-700">Filtrer:</span>
            <button
              onClick={() => {
                setReportsFilter("all");
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                reportsFilter === "all"
                  ? "bg-primary-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tous ({reports.length})
            </button>
            <button
              onClick={() => {
                setReportsFilter("pending");
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                reportsFilter === "pending"
                  ? "bg-yellow-600 text-white shadow-md"
                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
              }`}
            >
              En attente ({reports.filter((r) => r.status === "pending").length}
              )
            </button>
            <button
              onClick={() => {
                setReportsFilter("resolved");
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                reportsFilter === "resolved"
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              Résolus ({reports.filter((r) => r.status === "resolved").length})
            </button>
            <button
              onClick={() => {
                setReportsFilter("dismissed");
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                reportsFilter === "dismissed"
                  ? "bg-gray-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Rejetés ({reports.filter((r) => r.status === "dismissed").length})
            </button>
          </div>
        )}

        {/* Trash Info Banner */}
        {reportsView === "trash" && trashedReports.length > 0 && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5"
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
              <div>
                <p className="text-sm font-medium text-orange-800">
                  Suppression automatique après 30 jours
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Les signalements dans la corbeille seront automatiquement
                  supprimés définitivement après 30 jours. Vous pouvez restaurer
                  ou supprimer manuellement les signalements ci-dessous.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {paginatedReports.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  reportsView === "trash"
                    ? "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    : "M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                }
              />
            </svg>
            <p className="text-gray-500 text-lg">
              {reportsView === "trash"
                ? "La corbeille est vide"
                : reportsFilter === "all"
                  ? "Aucun signalement pour le moment"
                  : `Aucun signalement ${
                      reportsFilter === "pending"
                        ? "en attente"
                        : reportsFilter === "resolved"
                          ? "résolu"
                          : "rejeté"
                    }`}
            </p>
            {reportsView === "trash" && (
              <p className="text-gray-400 text-sm mt-2">
                Les signalements supprimés sont automatiquement effacés après 30
                jours
              </p>
            )}
          </div>
        )}

        {/* Reports Table */}
        {paginatedReports.length > 0 && (
          <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Signalé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Raison
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  {reportsView === "active" && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Statut
                    </th>
                  )}
                  {reportsView === "trash" && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Suppression auto
                    </th>
                  )}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedReports.map((report) => (
                  <tr
                    key={report.id}
                    onClick={() =>
                      reportsView === "active" &&
                      setReportDetailsModal({ isOpen: true, report })
                    }
                    className={`${
                      reportsView === "active" ? "cursor-pointer" : ""
                    } transition-colors ${
                      report.status === "pending"
                        ? "bg-yellow-50/50 hover:bg-yellow-100/70"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {report.reportType === "vehicle"
                          ? "Véhicule"
                          : report.reportType === "agency"
                            ? "Agence"
                            : "Client"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {report.targetName}
                      </div>
                      <div className="text-sm text-gray-500">
                        Par: {report.reportedBy}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {report.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(
                        report.reportedAt || report.created_at,
                      ).toLocaleDateString("fr-FR")}
                    </td>
                    {reportsView === "active" && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {report.status === "pending" && (
                            <span className="flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-yellow-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                            </span>
                          )}
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              report.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : report.status === "resolved"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {report.status === "pending"
                              ? "En attente"
                              : report.status === "resolved"
                                ? "Résolu"
                                : "Rejeté"}
                          </span>
                        </div>
                      </td>
                    )}
                    {reportsView === "trash" && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {Math.ceil(
                          (new Date(report.autoDeleteAt).getTime() -
                            Date.now()) /
                            (1000 * 60 * 60 * 24),
                        )}{" "}
                        jours
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {reportsView === "active" ? (
                        <>
                          {/* Only super_admin can resolve/dismiss/delete */}
                          {user?.role === "super_admin" && (
                            <>
                              {report.status === "pending" && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setResolveModal({
                                        isOpen: true,
                                        type: "resolve",
                                        report: report,
                                      });
                                    }}
                                    className="text-green-600 hover:text-green-900 mr-3"
                                  >
                                    Résoudre
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setResolveModal({
                                        isOpen: true,
                                        type: "dismiss",
                                        report: report,
                                      });
                                    }}
                                    className="text-gray-600 hover:text-gray-900 mr-3"
                                  >
                                    Rejeter
                                  </button>
                                </>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteReport(report);
                                }}
                                className="text-red-600 hover:text-red-900"
                                title="Déplacer vers la corbeille"
                              >
                                <svg
                                  className="w-5 h-5 inline"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </>
                          )}
                          {/* Agency admins can only view */}
                          {user?.role === "agency_admin" && (
                            <span className="text-gray-500 text-sm italic">
                              Lecture seule
                            </span>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRestoreReport(report);
                            }}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                            title="Restaurer"
                          >
                            <svg
                              className="w-5 h-5 inline mr-1"
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
                            Restaurer
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmModal({
                                isOpen: true,
                                report: report,
                              });
                            }}
                            className="text-red-600 hover:text-red-900 font-medium"
                            title="Supprimer définitivement"
                          >
                            <svg
                              className="w-5 h-5 inline mr-1"
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
                            Supprimer
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            itemsPerPage={itemsPerPage}
            totalItems={(filteredReports || []).length}
          />
        )}

        {/* Resolve/Dismiss Modal */}
        <ResolveReportModal
          isOpen={resolveModal.isOpen}
          onClose={() =>
            setResolveModal({ isOpen: false, type: null, report: null })
          }
          report={resolveModal.report}
          type={resolveModal.type}
          onConfirm={(report, notes) => {
            if (resolveModal.type === "resolve") {
              onResolveReport && onResolveReport(report, notes);
            } else if (resolveModal.type === "dismiss") {
              onDismissReport && onDismissReport(report, notes);
            }
            setResolveModal({ isOpen: false, type: null, report: null });
          }}
        />

        {/* Permanent Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={deleteConfirmModal.isOpen}
          onClose={() => setDeleteConfirmModal({ isOpen: false, report: null })}
          onConfirm={() => {
            if (deleteConfirmModal.report) {
              onPermanentDeleteReport(deleteConfirmModal.report);
              setDeleteConfirmModal({ isOpen: false, report: null });
            }
          }}
          title="Supprimer définitivement ?"
          message={`Êtes-vous sûr de vouloir supprimer définitivement le signalement "${deleteConfirmModal.report?.targetName}" ? Cette action est irréversible et le signalement sera perdu à jamais.`}
          confirmText="Supprimer définitivement"
          cancelText="Annuler"
          danger={true}
        />
      </div>
    );
  }

  if (activeTab === "statistics") {
    const statisticsSubTabs = [
      { id: "finance", label: "💰 Finances" },
      { id: "global", label: "📊 Statistiques Globales" },
    ];

    // Financial tab content
    const renderFinancialContent = () => {
      const monthlyRevenue = financialStats.monthly;
      const revenueByAgency = financialStats.byAgency;
      const paymentMethods = financialStats.paymentMethods.map(
        (method, index) => {
          const colors = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"];
          return {
            name: method.name,
            value: method.value,
            color: colors[index % colors.length],
          };
        },
      );

      const totalRevenue = financialStats.totals.revenue;
      const totalProfit = financialStats.totals.profit;
      const totalCommission = financialStats.totals.commission;
      const avgMonthlyRevenue = financialStats.totals.avgMonthly;

      if (monthlyRevenue.length === 0) {
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">
                Chargement des données financières...
              </p>
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              💰 Tableau de Bord Financier
            </h2>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2">
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Exporter Rapport
            </button>
          </div>

          {/* Key Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-slideUp"
              style={{ animationDelay: "0ms" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <svg
                    className="w-8 h-8"
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
                <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                  +12.5%
                </span>
              </div>
              <p className="text-blue-100 text-sm font-medium mb-1">
                Revenu Total
              </p>
              <p className="text-3xl font-bold">
                {totalRevenue.toLocaleString()} DT
              </p>
              <p className="text-blue-100 text-xs mt-2">Derniers 6 mois</p>
            </div>

            <div
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-slideUp"
              style={{ animationDelay: "100ms" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <svg
                    className="w-8 h-8"
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
                <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                  +8.3%
                </span>
              </div>
              <p className="text-green-100 text-sm font-medium mb-1">
                Profit Net
              </p>
              <p className="text-3xl font-bold">
                {totalProfit.toLocaleString()} DT
              </p>
              <p className="text-green-100 text-xs mt-2">
                Marge: {((totalProfit / totalRevenue) * 100).toFixed(1)}%
              </p>
            </div>

            <div
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-slideUp"
              style={{ animationDelay: "200ms" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <svg
                    className="w-8 h-8"
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
                </div>
                <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                  15%
                </span>
              </div>
              <p className="text-purple-100 text-sm font-medium mb-1">
                Commission Platform
              </p>
              <p className="text-3xl font-bold">
                {totalCommission.toLocaleString()} DT
              </p>
              <p className="text-purple-100 text-xs mt-2">Sur le revenu total</p>
            </div>

            <div
              className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-slideUp"
              style={{ animationDelay: "300ms" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <svg
                    className="w-8 h-8"
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
                <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                  Moy.
                </span>
              </div>
              <p className="text-orange-100 text-sm font-medium mb-1">
                Revenu Mensuel Moy.
              </p>
              <p className="text-3xl font-bold">
                {avgMonthlyRevenue.toLocaleString()} DT
              </p>
              <p className="text-orange-100 text-xs mt-2">Tendance croissante</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart */}
            <div
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-slideUp"
              style={{ animationDelay: "400ms" }}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                Évolution du Revenu
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #E5E7EB",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Revenu"
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stroke="#10B981"
                    fillOpacity={1}
                    fill="url(#colorProfit)"
                    name="Profit"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Payment Methods Distribution */}
            <div
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-slideUp"
              style={{ animationDelay: "500ms" }}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                Méthodes de Paiement
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethods}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {paymentMethods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue by Agency */}
          <div
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-slideUp"
            style={{ animationDelay: "600ms" }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Performance des Agences (Top 5)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByAgency}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="revenue"
                  fill="#3B82F6"
                  name="Revenu"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="commission"
                  fill="#10B981"
                  name="Commission"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Financial Summary Table */}
          <div
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-slideUp"
            style={{ animationDelay: "700ms" }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Détails Mensuels
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Mois
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">
                      Revenu Total
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">
                      Commission (8%)
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">
                      Profit
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">
                      Marge
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyRevenue.map((month, index) => (
                    <tr
                      key={month.month}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {month.month}
                      </td>
                      <td className="text-right py-3 px-4 text-blue-600 font-semibold">
                        {month.revenue.toLocaleString()} DT
                      </td>
                      <td className="text-right py-3 px-4 text-purple-600">
                        {month.commission.toLocaleString()} DT
                      </td>
                      <td className="text-right py-3 px-4 text-green-600 font-semibold">
                        {month.profit.toLocaleString()} DT
                      </td>
                      <td className="text-right py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            month.revenue > 0 &&
                            (month.profit / month.revenue) * 100 > 5
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {month.revenue > 0
                            ? ((month.profit / month.revenue) * 100).toFixed(1)
                            : 0}
                          %
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            
            @keyframes slideUp {
              from { 
                opacity: 0;
                transform: translateY(20px);
              }
              to { 
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            .animate-fadeIn {
              animation: fadeIn 0.5s ease-out;
            }
            
            .animate-slideUp {
              animation: slideUp 0.6s ease-out both;
            }
          `}</style>
        </div>
      );
    };

    // Global statistics content
    const renderGlobalContent = () => {
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">
            📊 Statistiques Globales
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
    };

    return (
      <div className="space-y-6">
        {/* Sub-tabs Navigation */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
          {statisticsSubTabs.map((subTab) => (
            <button
              key={subTab.id}
              onClick={() => setStatisticsSubTab(subTab.id)}
              className={`px-6 py-2.5 font-semibold rounded-lg transition-all duration-300 ${
                statisticsSubTab === subTab.id
                  ? "bg-white text-primary-600 shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {subTab.label}
            </button>
          ))}
        </div>

        {/* Sub-tab Content */}
        {statisticsSubTab === "finance" ? renderFinancialContent() : renderGlobalContent()}
      </div>
    );
  }
                  />
                </svg>
              </div>
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                +8.3%
              </span>
            </div>
            <p className="text-green-100 text-sm font-medium mb-1">
              Profit Net
            </p>
            <p className="text-3xl font-bold">
              {totalProfit.toLocaleString()} DT
            </p>
            <p className="text-green-100 text-xs mt-2">
              Marge: {((totalProfit / totalRevenue) * 100).toFixed(1)}%
            </p>
          </div>

          <div
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-slideUp"
            style={{ animationDelay: "200ms" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <svg
                  className="w-8 h-8"
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
              </div>
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                15%
              </span>
            </div>
            <p className="text-purple-100 text-sm font-medium mb-1">
              Commission Platform
            </p>
            <p className="text-3xl font-bold">
              {totalCommission.toLocaleString()} DT
            </p>
            <p className="text-purple-100 text-xs mt-2">Sur le revenu total</p>
          </div>

          <div
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-slideUp"
            style={{ animationDelay: "300ms" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <svg
                  className="w-8 h-8"
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
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                Moy.
              </span>
            </div>
            <p className="text-orange-100 text-sm font-medium mb-1">
              Revenu Mensuel Moy.
            </p>
            <p className="text-3xl font-bold">
              {avgMonthlyRevenue.toLocaleString()} DT
            </p>
            <p className="text-orange-100 text-xs mt-2">Tendance croissante</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend Chart */}
          <div
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-slideUp"
            style={{ animationDelay: "400ms" }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Évolution du Revenu
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Revenu"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                  name="Profit"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Methods Distribution */}
          <div
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-slideUp"
            style={{ animationDelay: "500ms" }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
              Méthodes de Paiement
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethods}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {paymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Agency */}
        <div
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-slideUp"
          style={{ animationDelay: "600ms" }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Performance des Agences (Top 5)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByAgency}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
              <Bar
                dataKey="revenue"
                fill="#3B82F6"
                name="Revenu"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="commission"
                fill="#10B981"
                name="Commission"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Financial Summary Table */}
        <div
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-slideUp"
          style={{ animationDelay: "700ms" }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Détails Mensuels
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    Mois
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">
                    Revenu Total
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">
                    Commission (8%)
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">
                    Profit
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">
                    Marge
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthlyRevenue.map((month, index) => (
                  <tr
                    key={month.month}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {month.month}
                    </td>
                    <td className="text-right py-3 px-4 text-blue-600 font-semibold">
                      {month.revenue.toLocaleString()} DT
                    </td>
                    <td className="text-right py-3 px-4 text-purple-600">
                      {month.commission.toLocaleString()} DT
                    </td>
                    <td className="text-right py-3 px-4 text-green-600 font-semibold">
                      {month.profit.toLocaleString()} DT
                    </td>
                    <td className="text-right py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          month.revenue > 0 &&
                          (month.profit / month.revenue) * 100 > 5
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {month.revenue > 0
                          ? ((month.profit / month.revenue) * 100).toFixed(1)
                          : 0}
                        %
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateY(20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out;
          }
          
          .animate-slideUp {
            animation: slideUp 0.6s ease-out both;
          }
        `}</style>
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
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsModal, setDetailsModal] = useState({
    isOpen: false,
    reservation: null,
  });
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [agencyFinancialStats, setAgencyFinancialStats] = useState({
    monthly: [],
    vehiclePerformance: [],
    paymentStatus: [
      { name: "Payé", value: 0, color: "#10B981" },
      { name: "En attente", value: 0, color: "#F59E0B" },
      { name: "Retard", value: 0, color: "#EF4444" },
    ],
    totals: { revenue: 0, commission: 0, payout: 0, netIncome: 0 },
  });
  const [loadingFinancial, setLoadingFinancial] = useState(false);

  // Fetch reservations on mount
  useEffect(() => {
    fetchReservations();
  }, []);

  // Fetch financial stats when financial tab opens
  useEffect(() => {
    if (activeTab === "financial") {
      fetchFinancialStats();
    }
  }, [activeTab]);

  const fetchFinancialStats = async () => {
    setLoadingFinancial(true);
    try {
      const response = await agencyService.getFinancialStats();
      setAgencyFinancialStats(response.data.data);
    } catch (error) {
      setToast({
        show: true,
        message: "Erreur lors du chargement des données financières",
        type: "error",
      });
    } finally {
      setLoadingFinancial(false);
    }
  };

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await reservationService.getAgency();
      setReservations(response.data.data);
    } catch (error) {
      setToast({
        show: true,
        message: "Erreur lors du chargement des réservations",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await reservationService.updateStatus(id, newStatus);
      setToast({
        show: true,
        message: "Statut mis à jour avec succès",
        type: "success",
      });
      fetchReservations();
      setDetailsModal({ isOpen: false, reservation: null });
    } catch (error) {
      setToast({
        show: true,
        message:
          error.response?.data?.message || "Erreur lors de la mise à jour",
        type: "error",
      });
    }
  };

  const handlePickup = async (id, notes) => {
    try {
      await reservationService.pickup(id, notes);
      setToast({
        show: true,
        message: "Véhicule retiré avec succès",
        type: "success",
      });
      fetchReservations();
      setDetailsModal({ isOpen: false, reservation: null });
    } catch (error) {
      setToast({
        show: true,
        message: error.response?.data?.message || "Erreur lors du retrait",
        type: "error",
      });
    }
  };

  const handleReturn = async (id, returnData) => {
    try {
      await reservationService.return(id, returnData);
      setToast({
        show: true,
        message: "Véhicule retourné avec succès",
        type: "success",
      });
      fetchReservations();
      setDetailsModal({ isOpen: false, reservation: null });
    } catch (error) {
      setToast({
        show: true,
        message: error.response?.data?.message || "Erreur lors du retour",
        type: "error",
      });
    }
  };

  const handleCancelReservation = async (id, reason) => {
    try {
      await reservationService.cancel(id, reason);
      setToast({
        show: true,
        message: "Réservation annulée avec succès",
        type: "success",
      });
      fetchReservations();
      setDetailsModal({ isOpen: false, reservation: null });
    } catch (error) {
      setToast({
        show: true,
        message: error.response?.data?.message || "Erreur lors de l'annulation",
        type: "error",
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: "En attente", class: "bg-yellow-100 text-yellow-700" },
      confirmed: { label: "Confirmée", class: "bg-blue-100 text-blue-700" },
      ongoing: { label: "En cours", class: "bg-purple-100 text-purple-700" },
      completed: { label: "Terminée", class: "bg-green-100 text-green-700" },
      cancelled: { label: "Annulée", class: "bg-red-100 text-red-700" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}
      >
        {config.label}
      </span>
    );
  };

  if (activeTab === "overview") {
    const activeReservations = reservations.filter((r) =>
      ["pending", "confirmed", "ongoing"].includes(r.status),
    );

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">
          Réservations Actives
        </h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : activeReservations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucune réservation active pour le moment
          </div>
        ) : (
          <div className="space-y-4">
            {activeReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setDetailsModal({ isOpen: true, reservation })}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {reservation.vehicle?.name || "Véhicule"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Client: {reservation.user?.name || "N/A"}
                    </p>
                  </div>
                  {getStatusBadge(reservation.status)}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Du:</span>{" "}
                    {new Date(reservation.start_date).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="text-gray-600">Au:</span>{" "}
                    {new Date(reservation.end_date).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="text-gray-600">Montant:</span>{" "}
                    <span className="font-semibold text-primary-600">
                      {reservation.total_price} DT
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Paiement:</span>{" "}
                    {reservation.payment_status === "paid"
                      ? "Payé"
                      : "En attente"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reservation Details Modal */}
        {detailsModal.isOpen && detailsModal.reservation && (
          <ReservationDetailsModal
            reservation={detailsModal.reservation}
            onClose={() =>
              setDetailsModal({ isOpen: false, reservation: null })
            }
            userRole="agency_admin"
            onStatusUpdate={handleStatusUpdate}
            onPickup={handlePickup}
            onReturn={handleReturn}
            onCancel={handleCancelReservation}
          />
        )}

        {/* Toast Notification */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ show: false, message: "", type: "" })}
          />
        )}
      </div>
    );
  }

  if (activeTab === "reservations") {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">
          Toutes les Réservations
        </h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucune réservation pour le moment
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setDetailsModal({ isOpen: true, reservation })}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {reservation.vehicle?.name || "Véhicule"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Client: {reservation.user?.name || "N/A"}
                    </p>
                  </div>
                  {getStatusBadge(reservation.status)}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Du:</span>{" "}
                    {new Date(reservation.start_date).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="text-gray-600">Au:</span>{" "}
                    {new Date(reservation.end_date).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="text-gray-600">Montant:</span>{" "}
                    <span className="font-semibold text-primary-600">
                      {reservation.total_price} DT
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Paiement:</span>{" "}
                    {reservation.payment_status === "paid"
                      ? "Payé"
                      : "En attente"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reservation Details Modal */}
        {detailsModal.isOpen && detailsModal.reservation && (
          <ReservationDetailsModal
            reservation={detailsModal.reservation}
            onClose={() =>
              setDetailsModal({ isOpen: false, reservation: null })
            }
            userRole="agency_admin"
            onStatusUpdate={handleStatusUpdate}
            onPickup={handlePickup}
            onReturn={handleReturn}
            onCancel={handleCancelReservation}
          />
        )}

        {/* Toast Notification */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ show: false, message: "", type: "" })}
          />
        )}
      </div>
    );
  }

  if (activeTab === "vehicles") {
    return (
      <div className="space-y-5">
        <h2 className="text-xl font-bold text-gray-900">
          Gestion des Véhicules
        </h2>
        <div className="text-center py-8 text-gray-500">
          Fonctionnalité en développement
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

  if (activeTab === "financial") {
    const monthlyRevenue = agencyFinancialStats.monthly;
    const vehiclePerformance = agencyFinancialStats.vehiclePerformance;
    const paymentStatus = agencyFinancialStats.paymentStatus;
    const totalRevenue = agencyFinancialStats.totals.revenue;
    const totalCommission = agencyFinancialStats.totals.commission;
    const totalProfit = agencyFinancialStats.totals.payout;
    const netIncome = agencyFinancialStats.totals.netIncome;

    if (loadingFinancial) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="text-gray-500">Chargement des données financières...</p>
        </div>
      );
    }

    if (monthlyRevenue.length === 0) {
      return (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg font-medium">
            Aucune donnée financière disponible.
          </p>
          <p className="text-sm mt-2">
            Les données apparaîtront dès que des réservations seront confirmées.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            💰 Finances de l'Agence
          </h2>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Période
            </button>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2">
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Exporter
            </button>
          </div>
        </div>

        {/* Key Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-slideUp"
            style={{ animationDelay: "0ms" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <svg
                  className="w-8 h-8"
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
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                +14.2%
              </span>
            </div>
            <p className="text-blue-100 text-sm font-medium mb-1">
              Revenu Total
            </p>
            <p className="text-3xl font-bold">
              {totalRevenue.toLocaleString()} DT
            </p>
            <p className="text-blue-100 text-xs mt-2">6 derniers mois</p>
          </div>

          <div
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-slideUp"
            style={{ animationDelay: "100ms" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                Après frais
              </span>
            </div>
            <p className="text-green-100 text-sm font-medium mb-1">
              Revenu Net
            </p>
            <p className="text-3xl font-bold">
              {netIncome.toLocaleString()} DT
            </p>
            <p className="text-green-100 text-xs mt-2">Après commission 15%</p>
          </div>

          <div
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-slideUp"
            style={{ animationDelay: "200ms" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <svg
                  className="w-8 h-8"
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
              </div>
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                -15%
              </span>
            </div>
            <p className="text-purple-100 text-sm font-medium mb-1">
              Commission Payée
            </p>
            <p className="text-3xl font-bold">
              {totalCommission.toLocaleString()} DT
            </p>
            <p className="text-purple-100 text-xs mt-2">À la plateforme</p>
          </div>

          <div
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-slideUp"
            style={{ animationDelay: "300ms" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <svg
                  className="w-8 h-8"
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
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                Marge
              </span>
            </div>
            <p className="text-orange-100 text-sm font-medium mb-1">
              Profit Brut
            </p>
            <p className="text-3xl font-bold">
              {totalProfit.toLocaleString()} DT
            </p>
            <p className="text-orange-100 text-xs mt-2">
              {((totalProfit / totalRevenue) * 100).toFixed(1)}% du revenu
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue & Profit Trend */}
          <div
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-slideUp"
            style={{ animationDelay: "400ms" }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Performance Financière
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  name="Revenu"
                  dot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#10B981"
                  strokeWidth={3}
                  name="Profit"
                  dot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="commission"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Commission"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Status */}
          <div
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-slideUp"
            style={{ animationDelay: "500ms" }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Statut des Paiements
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {paymentStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Performance */}
        <div
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-slideUp"
          style={{ animationDelay: "600ms" }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
            Performance par Véhicule
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vehiclePerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" />
              <YAxis
                dataKey="vehicle"
                type="category"
                stroke="#6B7280"
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
              <Bar
                dataKey="revenue"
                fill="#3B82F6"
                name="Revenu (DT)"
                radius={[0, 8, 8, 0]}
              />
              <Bar
                dataKey="bookings"
                fill="#10B981"
                name="Réservations"
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Financial Details Table */}
        <div
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-slideUp"
          style={{ animationDelay: "700ms" }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Détails Mensuels
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    Mois
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">
                    Revenu Total
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">
                    Commission (8%)
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">
                    Revenu Net
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthlyRevenue.map((month) => (
                  <tr
                    key={month.month}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {month.month}
                    </td>
                    <td className="text-right py-3 px-4 text-blue-600 font-semibold">
                      {month.revenue.toLocaleString()} DT
                    </td>
                    <td className="text-right py-3 px-4 text-purple-600">
                      {month.commission.toLocaleString()} DT
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">
                        {month.profit.toLocaleString()} DT
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateY(20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out;
          }
          
          .animate-slideUp {
            animation: slideUp 0.6s ease-out both;
          }
        `}</style>
      </div>
    );
  }

  if (activeTab === "statistics") {
    // Calculate statistics from reservations
    const completedReservations = reservations.filter(
      (r) => r.status === "completed",
    );
    const totalRevenue = completedReservations.reduce(
      (sum, r) => sum + parseFloat(r.agency_payout || 0),
      0,
    );
    const avgReservationValue =
      completedReservations.length > 0
        ? totalRevenue / completedReservations.length
        : 0;

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">
          Statistiques de l'Agence
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Réservations Totales</p>
            <p className="text-3xl font-bold text-primary-600">
              {reservations.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Réservations Terminées</p>
            <p className="text-3xl font-bold text-green-600">
              {completedReservations.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Revenu Total</p>
            <p className="text-3xl font-bold text-primary-600">
              {totalRevenue.toFixed(2)} DT
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Client Content Component
const ClientContent = ({ activeTab, navigate }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    reservationId: null,
  });
  const [detailsModal, setDetailsModal] = useState({
    isOpen: false,
    reservation: null,
  });
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

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await reservationService.getMy();
      setReservations(response.data.data || []);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      showToast("Erreur lors du chargement des réservations", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (id) => {
    try {
      const response = await reservationService.cancel(id);
      if (response.data.success) {
        showToast(response.data.message, "success");
        fetchReservations(); // Refresh list
        setCancelModal({ isOpen: false, reservationId: null });
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Erreur lors de l'annulation",
        "error",
      );
    }
  };

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

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <p className="text-gray-500">Aucune réservation pour le moment</p>
            <button
              onClick={() => navigate("/vehicles")}
              className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Parcourir les véhicules
            </button>
          </div>
        ) : (
          <div className="grid gap-5">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {reservation.vehicle?.name || "Véhicule"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {reservation.vehicle?.agency?.name || "Agence"}
                    </p>
                    <div className="flex gap-4 mt-3 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Début:</span>{" "}
                        {new Date(reservation.start_date).toLocaleDateString(
                          "fr-FR",
                        )}
                      </div>
                      <div>
                        <span className="font-medium">Fin:</span>{" "}
                        {new Date(reservation.end_date).toLocaleDateString(
                          "fr-FR",
                        )}
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
                      {reservation.total_price} DT
                    </p>
                    <div className="flex flex-col gap-2 mt-3">
                      <button
                        onClick={() =>
                          setDetailsModal({
                            isOpen: true,
                            reservation: reservation,
                          })
                        }
                        className="px-4 py-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors text-sm font-medium"
                      >
                        Voir détails
                      </button>
                      {reservation.status === "pending" && (
                        <button
                          onClick={() =>
                            setCancelModal({
                              isOpen: true,
                              reservationId: reservation.id,
                            })
                          }
                          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm"
                        >
                          Annuler
                        </button>
                      )}
                      {reservation.status === "confirmed" && (
                        <p className="text-xs text-gray-500">
                          Contactez l'agence pour annuler
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reservation Details Modal */}
        {detailsModal.isOpen && detailsModal.reservation && (
          <ReservationDetailsModal
            reservation={detailsModal.reservation}
            onClose={() =>
              setDetailsModal({ isOpen: false, reservation: null })
            }
            userRole="client"
            onCancel={handleCancelReservation}
          />
        )}

        {/* Cancel Confirmation Modal */}
        <ConfirmationModal
          isOpen={cancelModal.isOpen}
          onClose={() => setCancelModal({ isOpen: false, reservationId: null })}
          onConfirm={() => handleCancelReservation(cancelModal.reservationId)}
          title="Annuler la réservation"
          message="Êtes-vous sûr de vouloir annuler cette réservation ?"
          confirmText="Annuler la réservation"
          cancelText="Retour"
          danger={true}
        />

        {/* Toast Notification */}
        <Toast
          isVisible={toast.isVisible}
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      </div>
    );
  }

  if (activeTab === "saved") {
    const [savedVehicles, setSavedVehicles] = useState([]);
    const [refreshSaved, setRefreshSaved] = useState(0);

    useEffect(() => {
      if (user) {
        const saved = JSON.parse(
          localStorage.getItem(`savedVehicles_${user.id}`) || "[]",
        );
        setSavedVehicles(saved);
      }
    }, [user, refreshSaved]);

    const handleRemoveSaved = (vehicleId) => {
      const saved = JSON.parse(
        localStorage.getItem(`savedVehicles_${user.id}`) || "[]",
      );
      const updated = saved.filter((v) => v.id !== vehicleId);
      localStorage.setItem(`savedVehicles_${user.id}`, JSON.stringify(updated));
      setRefreshSaved((prev) => prev + 1);
    };

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Véhicules Sauvegardés
          </h2>
          <span className="text-sm text-gray-500">
            {savedVehicles.length} véhicule{savedVehicles.length > 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : savedVehicles.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            <p className="text-gray-500 mb-2">Aucun véhicule sauvegardé</p>
            <p className="text-sm text-gray-400 mb-6">
              Parcourez nos véhicules et cliquez sur l'icône de sauvegarde pour
              les retrouver ici
            </p>
            <button
              onClick={() => (window.location.href = "/vehicles")}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              Découvrir les véhicules
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedVehicles.map((vehicle, index) => (
              <div key={vehicle.id} className="relative">
                <VehicleCard
                  vehicle={vehicle}
                  index={index}
                  isVisible={true}
                  onSaveToggle={() => handleRemoveSaved(vehicle.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (activeTab === "history") {
    return (
      <div className="space-y-5">
        <h2 className="text-xl font-bold text-gray-900">
          Historique des Réservations
        </h2>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <p className="text-gray-500">Aucune réservation</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white rounded-xl p-6 border border-gray-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {reservation.vehicle?.name || "Véhicule"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {reservation.vehicle?.agency?.name || "Agence"}
                    </p>
                    <div className="flex gap-4 mt-3 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Début:</span>{" "}
                        {new Date(reservation.start_date).toLocaleDateString(
                          "fr-FR",
                        )}
                      </div>
                      <div>
                        <span className="font-medium">Fin:</span>{" "}
                        {new Date(reservation.end_date).toLocaleDateString(
                          "fr-FR",
                        )}
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
                      {reservation.total_price} DT
                    </p>
                    <button
                      onClick={() =>
                        setDetailsModal({
                          isOpen: true,
                          reservation: reservation,
                        })
                      }
                      className="mt-3 px-4 py-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors text-sm font-medium"
                    >
                      Voir détails
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reservation Details Modal */}
        {detailsModal.isOpen && detailsModal.reservation && (
          <ReservationDetailsModal
            reservation={detailsModal.reservation}
            onClose={() =>
              setDetailsModal({ isOpen: false, reservation: null })
            }
            userRole="client"
            onCancel={handleCancelReservation}
          />
        )}
      </div>
    );
  }

  return null;
};

export default Dashboard;
