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
import ReservationDetailsModal from "../components/ReservationDetailsModal";
import DetailsModal from "../components/DetailsModal";
import ReportDetailsModal from "../components/ReportDetailsModal";
import Pagination from "../components/Pagination";
import NotificationButton from "../components/NotificationButton";
import VehicleCard from "../components/VehicleCard";
import { adminService, reservationService } from "../services/api";

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
  const [editModal, setEditModal] = useState({
    isOpen: false,
    type: null,
    item: null,
  });
  const [detailsModal, setDetailsModal] = useState({
    isOpen: false,
    type: null, // 'agency' or 'user'
    item: null,
  });
  const [reportDetailsModal, setReportDetailsModal] = useState({
    isOpen: false,
    report: null,
  });
  const [reports, setReports] = useState([]);
  const [agencyReviews, setAgencyReviews] = useState([]);
  const [notifications, setNotifications] = useState([]);

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
      initializeMockReviews();
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

      // Initialize mock data (TODO: Replace with API calls)
      initializeMockReports();
      initializeMockReviews();
      initializeMockNotifications();
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

  // Initialize mock agency reviews (TODO: Replace with API call)
  const initializeMockReviews = () => {
    const mockReviews = [
      {
        id: 1,
        agency_id: 1,
        user_id: 5,
        user_name: "Sophie Martin",
        rating: 5,
        comment:
          "Excellent service ! Voiture impeccable et personnel très accueillant. Je recommande vivement cette agence.",
        created_at: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
      {
        id: 2,
        agency_id: 1,
        user_id: 6,
        user_name: "Thomas Dubois",
        rating: 4,
        comment:
          "Très bonne expérience. La voiture était propre et bien entretenue. Un petit délai à la prise en charge mais rien de grave.",
        created_at: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
      {
        id: 3,
        agency_id: 1,
        user_id: 7,
        user_name: "Marie Leclerc",
        rating: 5,
        comment:
          "Service irréprochable ! L'équipe est professionnelle et à l'écoute. Les prix sont compétitifs.",
        created_at: new Date(
          Date.now() - 15 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
      {
        id: 4,
        agency_id: 2,
        user_id: 8,
        user_name: "Pierre Bernard",
        rating: 3,
        comment:
          "Agence correcte mais j'ai trouvé la voiture avec quelques rayures non mentionnées. Le reste était bien.",
        created_at: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
      {
        id: 5,
        agency_id: 3,
        user_id: 9,
        user_name: "Julie Rousseau",
        rating: 5,
        comment:
          "Parfait ! Personnel sympathique, voiture neuve et propre. Je reviendrai sans hésiter.",
        created_at: new Date(
          Date.now() - 20 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
    ];
    setAgencyReviews(mockReviews);
  };

  // Initialize mock notifications (TODO: Replace with API call)
  const initializeMockNotifications = () => {
    const baseNotifications =
      user?.role === "agency_admin"
        ? [
            {
              id: 1,
              type: "reservation",
              title: "Nouvelle réservation",
              message:
                "Jean Dupont a réservé une Mercedes Classe E pour 3 jours",
              created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
              is_read: false,
            },
            {
              id: 2,
              type: "payment",
              title: "Paiement reçu",
              message: "Paiement de 450 DT reçu pour la réservation #1234",
              created_at: new Date(
                Date.now() - 2 * 60 * 60 * 1000,
              ).toISOString(),
              is_read: false,
            },
            {
              id: 3,
              type: "review",
              title: "Nouvel avis",
              message: "Sophie Martin a laissé un avis 5 étoiles",
              created_at: new Date(
                Date.now() - 5 * 60 * 60 * 1000,
              ).toISOString(),
              is_read: true,
            },
            {
              id: 4,
              type: "vehicle",
              title: "Retour de véhicule",
              message: "BMW X5 retourné avec succès",
              created_at: new Date(
                Date.now() - 1 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              is_read: true,
            },
          ]
        : user?.role === "client"
          ? [
              {
                id: 1,
                type: "reservation",
                title: "Réservation confirmée",
                message: "Votre réservation #1234 a été confirmée par l'agence",
                created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                is_read: false,
              },
              {
                id: 2,
                type: "vehicle",
                title: "Véhicule prêt",
                message: "Votre Mercedes Classe E est prête pour le retrait",
                created_at: new Date(
                  Date.now() - 3 * 60 * 60 * 1000,
                ).toISOString(),
                is_read: false,
              },
              {
                id: 3,
                type: "payment",
                title: "Paiement confirmé",
                message: "Votre paiement de 450 DT a été traité avec succès",
                created_at: new Date(
                  Date.now() - 6 * 60 * 60 * 1000,
                ).toISOString(),
                is_read: true,
              },
            ]
          : [];

    setNotifications(baseNotifications);
  };

  // Initialize mock reports (TODO: Replace with API call)
  const initializeMockReports = () => {
    const mockReports = [
      {
        id: 1,
        reportType: "vehicle",
        targetId: 1,
        targetName: "Mercedes-Benz Classe E",
        reason: "Informations incorrectes",
        description:
          "Le véhicule affiché a des spécifications qui ne correspondent pas à la réalité. Le kilométrage indiqué est faux.",
        reportedBy: "Jean Dupont",
        reportedAt: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: "pending",
        adminNotes: null,
      },
      {
        id: 2,
        reportType: "agency",
        targetId: 1,
        targetName: "Elite Drive Centre-Ville",
        reason: "Service client médiocre",
        description:
          "L'agence ne répond pas aux appels téléphoniques et ignore les emails. Service très décevant.",
        reportedBy: "Marie Martin",
        reportedAt: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: "pending",
        adminNotes: null,
      },
      {
        id: 3,
        reportType: "client",
        targetId: 5,
        targetName: "Pierre Dubois",
        reason: "Dommages au véhicule",
        description:
          "Le client a rendu le véhicule avec des rayures importantes sur la portière droite sans les signaler.",
        reportedBy: "Elite Drive La Marsa",
        reportedAt: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: "pending",
        adminNotes: null,
      },
      {
        id: 4,
        reportType: "vehicle",
        targetId: 4,
        targetName: "Range Rover Sport",
        reason: "État du véhicule non conforme",
        description:
          "Le véhicule était sale à l'intérieur et sentait la cigarette, malgré l'interdiction de fumer.",
        reportedBy: "Sophie Leroux",
        reportedAt: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: "resolved",
        adminNotes:
          "Véhicule nettoyé en profondeur. Client remboursé partiellement.",
      },
      {
        id: 5,
        reportType: "agency",
        targetId: 2,
        targetName: "Elite Drive La Marsa",
        reason: "Pratiques commerciales douteuses",
        description:
          "L'agence a facturé des frais supplémentaires non mentionnés lors de la réservation.",
        reportedBy: "Thomas Bernard",
        reportedAt: new Date(
          Date.now() - 15 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: "dismissed",
        adminNotes:
          "Après vérification, les frais étaient justifiés et mentionnés dans les conditions générales.",
      },
    ];
    setReports(mockReports);
  };

  // Report handlers
  const handleResolveReport = async (report) => {
    try {
      // TODO: Replace with API call
      setReports(
        reports.map((r) =>
          r.id === report.id
            ? { ...r, status: "resolved", resolvedAt: new Date().toISOString() }
            : r,
        ),
      );
      showToast("Signalement marqué comme résolu", "success");
    } catch (error) {
      showToast("Erreur lors de la résolution du signalement", "error");
    }
  };

  const handleDismissReport = async (report) => {
    try {
      // TODO: Replace with API call
      setReports(
        reports.map((r) =>
          r.id === report.id
            ? {
                ...r,
                status: "dismissed",
                dismissedAt: new Date().toISOString(),
              }
            : r,
        ),
      );
      showToast("Signalement rejeté", "success");
    } catch (error) {
      showToast("Erreur lors du rejet du signalement", "error");
    }
  };

  const handleDeleteReport = async (report) => {
    try {
      // TODO: Replace with API call
      setReports(reports.filter((r) => r.id !== report.id));
      showToast("Signalement supprimé", "success");
    } catch (error) {
      showToast("Erreur lors de la suppression du signalement", "error");
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
          { id: "agencies", label: "Gérer Agences", icon: "building" },
          { id: "users", label: "Gérer Utilisateurs", icon: "users" },
          { id: "financial", label: "Finances", icon: "credit-card" },
          { id: "reports", label: "Signalements", icon: "flag" },
          { id: "statistics", label: "Statistiques", icon: "chart" },
        ];
      case "agency_admin":
        return [
          { id: "overview", label: "Actives", icon: "clipboard" },
          { id: "reservations", label: "Toutes", icon: "list" },
          { id: "vehicles", label: "Véhicules", icon: "car" },
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
          platformStats={platformStats}
          agencies={agencies}
          users={users}
          reports={reports}
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
          onSuspendUser={async (user) => {
            try {
              await adminService.suspendUser(user.id, !user.is_suspended);
              showToast(
                user.is_suspended
                  ? "Utilisateur réactivé avec succès"
                  : "Utilisateur suspendu avec succès",
                "success",
              );
              fetchDashboardData();
            } catch (error) {
              console.error("Error suspending user:", error);
              showToast("Erreur lors de la modification du statut", "error");
            }
          }}
          onViewUserDetails={(user) => {
            setDetailsModal({ isOpen: true, type: "user", item: user });
          }}
          onResolveReport={handleResolveReport}
          onDismissReport={handleDismissReport}
          onDeleteReport={handleDeleteReport}
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
          setDetailsModal({ isOpen: false, type: null, item: null })
        }
        type={detailsModal.type}
        item={detailsModal.item}
        reviews={
          detailsModal.type === "agency" && detailsModal.item?.id
            ? agencyReviews.filter((r) => r.agency_id === detailsModal.item.id)
            : []
        }
        reservations={allReservations}
        onEdit={(item) => {
          setDetailsModal({ isOpen: false, type: null, item: null });
          setEditModal({ isOpen: true, type: detailsModal.type, item });
        }}
        onDelete={(itemId) => {
          const item =
            detailsModal.type === "agency"
              ? agencies.find((a) => a.id === itemId)
              : users.find((u) => u.id === itemId);
          setDetailsModal({ isOpen: false, type: null, item: null });
          setDeleteModal({
            isOpen: true,
            type: detailsModal.type,
            item,
          });
        }}
        onSuspend={async (user) => {
          try {
            await adminService.suspendUser(user.id, !user.is_suspended);
            showToast(
              user.is_suspended
                ? "Utilisateur réactivé avec succès"
                : "Utilisateur suspendu avec succès",
              "success",
            );
            fetchDashboardData();
            setDetailsModal({ isOpen: false, type: null, item: null });
          } catch (error) {
            console.error("Error suspending user:", error);
            showToast("Erreur lors de la modification du statut", "error");
          }
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
  reports,
  loading,
  onDeleteAgency,
  onEditAgency,
  onDeleteUser,
  onEditUser,
  onSuspendUser,
  onViewUserDetails,
  onResolveReport,
  onDismissReport,
  onDeleteReport,
  onViewReportDetails,
}) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
                  onClick={() =>
                    setDetailsModal({
                      isOpen: true,
                      type: "agency",
                      item: agency,
                    })
                  }
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
                      className={`mr-3 ${
                        user.is_suspended
                          ? "text-green-600 hover:text-green-900"
                          : "text-orange-600 hover:text-orange-900"
                      }`}
                    >
                      {user.is_suspended ? "Réactiver" : "Suspendre"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteUser(user.id);
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
            totalItems={(users || []).length}
          />
        )}
      </div>
    );
  }

  if (activeTab === "reports") {
    const totalPages = Math.ceil((reports || []).length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedReports = (reports || []).slice(startIndex, endIndex);

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Signalements</h2>
          <div className="flex gap-2 text-sm">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">
              {(reports || []).filter((r) => r.status === "pending").length} En
              attente
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">
              {(reports || []).filter((r) => r.status === "resolved").length}{" "}
              Résolus
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full font-medium">
              {(reports || []).filter((r) => r.status === "dismissed").length}{" "}
              Rejetés
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Statut
                </th>
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
                    onViewReportDetails && onViewReportDetails(report)
                  }
                  className={`cursor-pointer transition-colors ${
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {report.status === "pending" && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onResolveReport && onResolveReport(report);
                          }}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Résoudre
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDismissReport && onDismissReport(report);
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
                        if (
                          confirm(
                            "Êtes-vous sûr de vouloir supprimer ce signalement ?",
                          )
                        ) {
                          onDeleteReport && onDeleteReport(report);
                        }
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
            totalItems={(reports || []).length}
          />
        )}
      </div>
    );
  }

  if (activeTab === "financial") {
    // Mock financial data (TODO: Replace with API call)
    const monthlyRevenue = [
      {
        month: "Jan",
        revenue: 45000,
        expenses: 28000,
        profit: 17000,
        commission: 6750,
      },
      {
        month: "Fév",
        revenue: 52000,
        expenses: 31000,
        profit: 21000,
        commission: 7800,
      },
      {
        month: "Mar",
        revenue: 48000,
        expenses: 29000,
        profit: 19000,
        commission: 7200,
      },
      {
        month: "Avr",
        revenue: 61000,
        expenses: 35000,
        profit: 26000,
        commission: 9150,
      },
      {
        month: "Mai",
        revenue: 58000,
        expenses: 33000,
        profit: 25000,
        commission: 8700,
      },
      {
        month: "Juin",
        revenue: 67000,
        expenses: 38000,
        profit: 29000,
        commission: 10050,
      },
    ];

    const revenueByAgency = agencies.slice(0, 5).map((agency) => ({
      name:
        agency.name.length > 20
          ? agency.name.substring(0, 20) + "..."
          : agency.name,
      revenue: agency.revenue || 0,
      commission: (agency.revenue || 0) * 0.15,
    }));

    const paymentMethods = [
      { name: "Carte Bancaire", value: 65, color: "#3B82F6" },
      { name: "Espèces", value: 20, color: "#10B981" },
      { name: "Virement", value: 10, color: "#F59E0B" },
      { name: "Autre", value: 5, color: "#8B5CF6" },
    ];

    const totalRevenue = monthlyRevenue.reduce((acc, m) => acc + m.revenue, 0);
    const totalProfit = monthlyRevenue.reduce((acc, m) => acc + m.profit, 0);
    const totalCommission = monthlyRevenue.reduce(
      (acc, m) => acc + m.commission,
      0,
    );
    const avgMonthlyRevenue = totalRevenue / monthlyRevenue.length;

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
                    Revenu
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">
                    Dépenses
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">
                    Profit
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">
                    Commission
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
                    <td className="text-right py-3 px-4 text-red-600">
                      {month.expenses.toLocaleString()} DT
                    </td>
                    <td className="text-right py-3 px-4 text-green-600 font-semibold">
                      {month.profit.toLocaleString()} DT
                    </td>
                    <td className="text-right py-3 px-4 text-purple-600">
                      {month.commission.toLocaleString()} DT
                    </td>
                    <td className="text-right py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          (month.profit / month.revenue) * 100 > 35
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {((month.profit / month.revenue) * 100).toFixed(1)}%
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

  // Fetch reservations on mount
  useEffect(() => {
    fetchReservations();
  }, []);

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
    // Mock financial data for agency (TODO: Replace with API call)
    const monthlyRevenue = [
      {
        month: "Jan",
        revenue: 12000,
        expenses: 7500,
        profit: 4500,
        commission: 1800,
      },
      {
        month: "Fév",
        revenue: 14500,
        expenses: 8200,
        profit: 6300,
        commission: 2175,
      },
      {
        month: "Mar",
        revenue: 13200,
        expenses: 7800,
        profit: 5400,
        commission: 1980,
      },
      {
        month: "Avr",
        revenue: 16800,
        expenses: 9200,
        profit: 7600,
        commission: 2520,
      },
      {
        month: "Mai",
        revenue: 15600,
        expenses: 8800,
        profit: 6800,
        commission: 2340,
      },
      {
        month: "Juin",
        revenue: 18200,
        expenses: 9800,
        profit: 8400,
        commission: 2730,
      },
    ];

    const vehiclePerformance = [
      { vehicle: "Mercedes E-Class", revenue: 8500, bookings: 12 },
      { vehicle: "BMW Série 5", revenue: 7200, bookings: 10 },
      { vehicle: "Audi A6", revenue: 6800, bookings: 9 },
      { vehicle: "Range Rover", revenue: 9500, bookings: 8 },
      { vehicle: "Tesla Model 3", revenue: 5200, bookings: 15 },
    ];

    const paymentStatus = [
      { name: "Payé", value: 75, color: "#10B981" },
      { name: "En attente", value: 15, color: "#F59E0B" },
      { name: "Retard", value: 8, color: "#EF4444" },
      { name: "Autre", value: 2, color: "#6B7280" },
    ];

    const totalRevenue = monthlyRevenue.reduce((acc, m) => acc + m.revenue, 0);
    const totalProfit = monthlyRevenue.reduce((acc, m) => acc + m.profit, 0);
    const totalCommission = monthlyRevenue.reduce(
      (acc, m) => acc + m.commission,
      0,
    );
    const netIncome = totalProfit - totalCommission;

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
                    Revenu
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">
                    Dépenses
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">
                    Profit
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">
                    Commission
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">
                    Net
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
                    <td className="text-right py-3 px-4 text-red-600">
                      {month.expenses.toLocaleString()} DT
                    </td>
                    <td className="text-right py-3 px-4 text-orange-600 font-semibold">
                      {month.profit.toLocaleString()} DT
                    </td>
                    <td className="text-right py-3 px-4 text-purple-600">
                      {month.commission.toLocaleString()} DT
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">
                        {(month.profit - month.commission).toLocaleString()} DT
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
