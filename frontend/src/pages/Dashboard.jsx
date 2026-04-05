import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import Footer from "../components/common/Footer";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import ConfirmationModal from "../components/modals/ConfirmationModal";
import EditModal from "../components/modals/EditModal";
import Toast from "../components/common/Toast";
import DetailsModal from "../components/modals/DetailsModal";
import NotificationButton from "../components/dashboard/NotificationButton";
import AdminContent from "../components/dashboard/AdminContent";
import AgencyContent from "../components/dashboard/AgencyContent";
import ClientContent from "../components/dashboard/ClientContent";
import useAdminDashboard from "../hooks/useAdminDashboard";
import useAgencyDashboard from "../hooks/useAgencyDashboard";
import useClientDashboard from "../hooks/useClientDashboard";
import ErrorBoundary from "../components/common/ErrorBoundary";
import { ROLES } from "../constants/roles";

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // State for statistics sub-tabs
  const [statisticsSubTab, setStatisticsSubTab] = useState("finance");

  // Modal states (admin flows)
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: null,
    item: null,
  });
  const [suspendModal, setSuspendModal] = useState({
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
    type: null,
    item: null,
    reports: [],
    userReportsSubmitted: [],
    vehicles: [],
  });
  const [, setReportDetailsModal] = useState({
    isOpen: false,
    report: null,
  });
  const [, setHistoryModal] = useState({
    isOpen: false,
    mode: "clean-trash",
    count: 0,
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

  const adminDashboard = useAdminDashboard({
    user,
    activeTab,
    statisticsSubTab,
    showToast,
  });

  const agencyDashboard = useAgencyDashboard({ user, showToast });
  const clientDashboard = useClientDashboard({ user, showToast });

  const notifications =
    user?.role === ROLES.SUPER_ADMIN
      ? adminDashboard.notifications
      : user?.role === ROLES.AGENCY_ADMIN
        ? agencyDashboard.notifications
        : clientDashboard.notifications;

  const handleMarkAllNotificationsRead = async () => {
    if (user?.role === ROLES.CLIENT) {
      try {
        await clientDashboard.markAllNotificationsAsRead();
        showToast(t("dashboard.messages.notificationsMarkedRead"), "success");
      } catch (error) {
        showToast(t("dashboard.messages.notificationsMarkReadError"), "error");
      }
    }
  };

  const platformStats = adminDashboard.platformStats;
  const agencies = adminDashboard.agencies;
  const users = adminDashboard.users;
  const allReservations = adminDashboard.allReservations;
  const contactMessages = adminDashboard.contactMessages;
  const financialStats = adminDashboard.financialStats;
  const agencyStats = agencyDashboard.agencyStats;
  const clientStats = clientDashboard.clientStats;

  const loading =
    user?.role === ROLES.SUPER_ADMIN
      ? adminDashboard.loading
      : user?.role === ROLES.AGENCY_ADMIN
        ? agencyDashboard.loading
        : clientDashboard.loading;

  // Handle refresh button click
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (user?.role === ROLES.SUPER_ADMIN) {
        await adminDashboard.refreshData();
      } else if (user?.role === ROLES.AGENCY_ADMIN) {
        await agencyDashboard.refreshData();
      } else if (user?.role === ROLES.CLIENT) {
        await clientDashboard.refreshData();
      }
      showToast(t("dashboard.messages.dataRefreshed"), "success");
    } catch (error) {
      console.error("Error refreshing data:", error);
      showToast(t("dashboard.messages.dataRefreshError"), "error");
    } finally {
      setRefreshing(false);
    }
  };

  const openUserDetailsModal = async (selectedUser) => {
    try {
      const details = await adminDashboard.fetchUserDetails(selectedUser.id);
      setDetailsModal({
        isOpen: true,
        type: "user",
        item: selectedUser,
        ...details,
      });
    } catch (error) {
      showToast(t("dashboard.messages.detailsOpenError"), "error");
    }
  };

  const openAgencyDetailsModal = async (agency) => {
    try {
      const details = await adminDashboard.fetchAgencyDetails(agency.id);
      setDetailsModal({
        isOpen: true,
        type: "agency",
        item: agency,
        reports: details.reports,
        vehicles: details.vehicles,
        userReportsSubmitted: [],
      });
    } catch (error) {
      showToast(t("dashboard.messages.detailsOpenError"), "error");
    }
  };

  // Role-based tab configuration
  const getTabsConfig = () => {
    switch (user?.role) {
      case ROLES.SUPER_ADMIN:
        return [
          { id: "overview", label: t("dashboard.tabs.overview"), icon: "home" },
          { id: "users", label: t("dashboard.tabs.users"), icon: "users" },
          {
            id: "agencies",
            label: t("dashboard.tabs.agencies"),
            icon: "building",
          },
          {
            id: "messages",
            label: t("dashboard.tabs.contactMessages"),
            icon: "mail",
          },
          {
            id: "statistics",
            label: t("dashboard.tabs.statisticsSuper"),
            icon: "chart",
          },
        ];
      case ROLES.AGENCY_ADMIN:
        return [
          {
            id: "overview",
            label: t("dashboard.tabs.active"),
            icon: "clipboard",
          },
          {
            id: "reservations",
            label: t("dashboard.tabs.reservations"),
            icon: "list",
          },
          { id: "vehicles", label: t("dashboard.tabs.vitrine"), icon: "car" },
          { id: "reports", label: t("dashboard.tabs.reports"), icon: "flag" },
          {
            id: "statistics",
            label: t("dashboard.tabs.statistics"),
            icon: "chart",
          },
        ];
      case ROLES.CLIENT:
        return [
          {
            id: "overview",
            label: t("dashboard.tabs.myReservations"),
            icon: "clipboard",
          },
          {
            id: "saved",
            label: t("dashboard.tabs.savedVehicles"),
            icon: "heart",
          },
          {
            id: "notifications",
            label: t("dashboard.tabs.notifications"),
            icon: "bell",
          },
          { id: "history", label: t("dashboard.tabs.history"), icon: "clock" },
        ];
      default:
        return [];
    }
  };

  const tabs = getTabsConfig();

  // Role-based title
  const getDashboardTitle = () => {
    switch (user?.role) {
      case ROLES.SUPER_ADMIN:
        return {
          title: t("dashboard.title.super_admin"),
          subtitle: t("dashboard.subtitle.super_admin"),
        };
      case ROLES.AGENCY_ADMIN:
        return {
          title: t("dashboard.title.agencyAdmin"),
          subtitle: t("dashboard.subtitle.agencyAdminSubtitle"),
        };
      case ROLES.CLIENT:
        return {
          title: t("dashboard.title.client"),
          subtitle: t("dashboard.subtitle.clientSubtitle"),
        };
      default:
        return { title: t("dashboard.title.default"), subtitle: "" };
    }
  };

  const { title, subtitle } = getDashboardTitle();

  // Get statistics cards based on role
  const getStatsCards = () => {
    switch (user?.role) {
      case ROLES.SUPER_ADMIN:
        return [
          {
            title: t("dashboard.stats.agencies.title"),
            value: String(platformStats?.totalAgencies ?? "0"),
            change: null,
            trend: "neutral",
            icon: "building",
            color: "blue",
          },
          {
            title: t("dashboard.stats.users.title"),
            value: String(platformStats?.totalUsers ?? "0"),
            change: null,
            trend: "up",
            icon: "users",
            color: "green",
          },
          {
            title: t("dashboard.stats.vehicles.title"),
            value: String(platformStats?.totalVehicles ?? "0"),
            change: null,
            trend: "neutral",
            icon: "car",
            color: "purple",
          },
          {
            title: t("dashboard.stats.monthlyRevenue.title"),
            value: platformStats?.monthlyRevenue
              ? `${platformStats.monthlyRevenue.toLocaleString()} DT`
              : "0 DT",
            change: null,
            trend: "up",
            icon: "money",
            color: "emerald",
          },
        ];
      case ROLES.AGENCY_ADMIN:
        return [
          {
            title: t("dashboard.stats.totalVehicles.title"),
            value: String(agencyStats?.totalVehicles ?? "0"),
            change: null,
            trend: "neutral",
            icon: "car",
            color: "blue",
          },
          {
            title: t("dashboard.stats.activeReservations.title"),
            value: String(agencyStats?.activeReservations ?? "0"),
            change: null,
            trend: "up",
            icon: "clipboard",
            color: "green",
          },
          {
            title: t("dashboard.stats.agencyRevenue.title"),
            value: agencyStats?.monthlyRevenue
              ? `${agencyStats.monthlyRevenue.toLocaleString()} DT`
              : "0 DT",
            change: null,
            trend: "up",
            icon: "money",
            color: "emerald",
          },
          {
            title: t("dashboard.stats.alerts.title"),
            value: String(agencyStats?.alertsCount ?? "0"),
            change: null,
            trend: agencyStats.alertsCount > 0 ? "warning" : "neutral",
            icon: "bell",
            color: "yellow",
          },
        ];
      case ROLES.CLIENT:
        return [
          {
            title: t("dashboard.stats.activeReservations.title"),
            value: String(clientStats?.activeReservations ?? "0"),
            change: null,
            trend: "neutral",
            icon: "clipboard",
            color: "blue",
          },
          {
            title: t("dashboard.stats.totalHistory.title"),
            value: String(clientStats?.completedReservations ?? "0"),
            change: null,
            trend: "neutral",
            icon: "clock",
            color: "green",
          },
          {
            title: t("dashboard.stats.totalSpend.title"),
            value: `${Number(clientStats?.totalSpend ?? 0).toLocaleString()} DT`,
            change: null,
            trend: "neutral",
            icon: "money",
            color: "purple",
          },
          {
            title: t("dashboard.stats.reliabilityScore.title"),
            value: `${clientStats?.reliabilityScore ?? 0}%`,
            change: null,
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

    if (role === ROLES.SUPER_ADMIN) {
      return (
        <ErrorBoundary minimal>
          <AdminContent
            activeTab={activeTab}
            statisticsSubTab={statisticsSubTab}
            setStatisticsSubTab={setStatisticsSubTab}
            platformStats={platformStats}
            agencies={agencies}
            users={users}
            allReservations={allReservations}
            reports={adminDashboard.reports}
            trashedReports={adminDashboard.trashedReports}
            reportsView={adminDashboard.reportsView}
            reportsFilter={adminDashboard.reportsFilter}
            setReportsView={adminDashboard.setReportsView}
            setReportsFilter={adminDashboard.setReportsFilter}
            loading={loading}
            contactMessages={contactMessages}
            setHistoryModal={setHistoryModal}
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
              try {
                await openUserDetailsModal(user);
              } catch (error) {
                console.error("Error viewing user details:", error);
                showToast(t("dashboard.messages.detailsOpenError"), "error");
              }
            }}
            onViewAgencyDetails={async (agency) => {
              try {
                await openAgencyDetailsModal(agency);
              } catch (error) {
                console.error("Error viewing agency details:", error);
                showToast(t("dashboard.messages.detailsOpenError"), "error");
              }
            }}
            onResolveReport={adminDashboard.handleResolveReport}
            onDismissReport={adminDashboard.handleDismissReport}
            onDeleteReport={adminDashboard.handleDeleteReport}
            onRestoreReport={adminDashboard.handleRestoreReport}
            onPermanentDeleteReport={adminDashboard.handlePermanentDeleteReport}
            onMarkMessageRead={adminDashboard.handleMarkMessageRead}
            onDeleteContactMessage={adminDashboard.handleDeleteContactMessage}
            onViewReportDetails={(report) => {
              setReportDetailsModal({ isOpen: true, report });
            }}
          />
        </ErrorBoundary>
      );
    } else if (role === ROLES.AGENCY_ADMIN) {
      return (
        <ErrorBoundary minimal>
          <AgencyContent
            activeTab={activeTab}
            reports={agencyDashboard.reports}
            reservations={agencyDashboard.reservations}
            vehicles={agencyDashboard.vehicles}
            loading={agencyDashboard.loading}
          />
        </ErrorBoundary>
      );
    } else if (role === ROLES.CLIENT) {
      return (
        <ErrorBoundary minimal>
          <ClientContent
            activeTab={activeTab}
            navigate={navigate}
            notifications={notifications}
            onChangeTab={setActiveTab}
            onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          />
        </ErrorBoundary>
      );
    }

    return (
      <div className="text-center py-12 text-gray-500">
        {t("dashboard.messages.roleUnrecognized")}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gray-50">
      <DashboardHeader title={title} subtitle={subtitle}>
        <NotificationButton
          userRole={user?.role}
          notifications={notifications}
          onMarkAllRead={handleMarkAllNotificationsRead}
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
              title={t("dashboard.actionLabels.refreshData")}
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
                      {card.change ? (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          {card.change}
                        </p>
                      ) : null}
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
                {tabs.find((t) => t.id === activeTab)?.label ||
                  t("dashboard.title.default")}
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
                      <h3 className="text-lg font-bold text-gray-900">
                        {t("dashboard.actionLabels.menu")}
                      </h3>
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
            adminDashboard.handleDeleteAgency(deleteModal.item.id);
          } else if (deleteModal.type === "user") {
            adminDashboard.handleDeleteUser(deleteModal.item.id);
          }
          setDeleteModal({ isOpen: false, type: null, item: null });
        }}
        title={
          deleteModal.type === "agency"
            ? t("dashboard.modals.deleteAgencyTitle")
            : t("dashboard.modals.deleteUserTitle")
        }
        message={
          deleteModal.type === "agency"
            ? t("dashboard.modals.deleteAgencyDesc", {
                name: deleteModal.item?.name,
              })
            : t("dashboard.modals.deleteUserDesc", {
                name: deleteModal.item?.name,
              })
        }
        confirmText={t("dashboard.actionLabels.delete")}
        cancelText={t("dashboard.actionLabels.cancel")}
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
              await adminDashboard.handleSuspendAgency(agency);
              showToast(
                agency.status === "inactive"
                  ? t("dashboard.messages.agencyUnblocked")
                  : t("dashboard.messages.agencyBlocked"),
                "success",
              );
            } else if (suspendModal.type === "user") {
              const selectedUser = suspendModal.item;
              await adminDashboard.handleSuspendUser(selectedUser);
              showToast(
                selectedUser.is_suspended
                  ? t("dashboard.messages.userUnblocked")
                  : t("dashboard.messages.userBlocked"),
                "success",
              );
            }
            await adminDashboard.refreshData();
          } catch (error) {
            console.error("Error suspending:", error);
            showToast(
              error?.response?.data?.message ||
                t("dashboard.messages.statusChangeError"),
              "error",
            );
          }
          setSuspendModal({ isOpen: false, type: null, item: null });
        }}
        title={
          suspendModal.type === "agency"
            ? suspendModal.item?.status === "inactive"
              ? t("dashboard.modals.unblockAgencyTitle")
              : t("dashboard.modals.blockAgencyTitle")
            : suspendModal.item?.is_suspended
              ? t("dashboard.modals.unblockUserTitle")
              : t("dashboard.modals.blockUserTitle")
        }
        message={
          suspendModal.type === "agency"
            ? suspendModal.item?.status === "inactive"
              ? t("dashboard.modals.unblockAgencyDesc", {
                  name: suspendModal.item?.name,
                })
              : t("dashboard.modals.blockAgencyDesc", {
                  name: suspendModal.item?.name,
                })
            : suspendModal.item?.is_suspended
              ? t("dashboard.modals.unblockUserDesc", {
                  name: suspendModal.item?.name,
                })
              : t("dashboard.modals.blockUserDesc", {
                  name: suspendModal.item?.name,
                })
        }
        confirmText={
          suspendModal.type === "agency"
            ? suspendModal.item?.status === "inactive"
              ? t("dashboard.actionLabels.unblock")
              : t("dashboard.actionLabels.block")
            : suspendModal.item?.is_suspended
              ? t("dashboard.actionLabels.unblock")
              : t("dashboard.actionLabels.block")
        }
        cancelText={t("dashboard.actionLabels.cancel")}
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
            await adminDashboard.handleEditAgency(updatedData);
          } else if (editModal.type === "user") {
            await adminDashboard.handleEditUser(updatedData);
          }
          setEditModal({ isOpen: false, type: null, item: null });
        }}
        type={editModal.type}
        item={editModal.item}
        agencies={agencies}
        userRole={user?.role}
        userId={user?.id}
        userReservations={allReservations.filter(
          (r) => r.user_id === user?.id || r.client_id === user?.id,
        )}
      />

      <DetailsModal
        isOpen={detailsModal.isOpen}
        onClose={() =>
          setDetailsModal({
            isOpen: false,
            type: null,
            item: null,
            reports: [],
            userReportsSubmitted: [],
            vehicles: [],
          })
        }
        type={detailsModal.type}
        item={detailsModal.item}
        reservations={allReservations}
        reports={detailsModal.reports || []}
        userReportsSubmitted={detailsModal.userReportsSubmitted || []}
        vehicles={detailsModal.vehicles || []}
        onEdit={(item) => {
          setDetailsModal({
            isOpen: false,
            type: null,
            item: null,
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

export default Dashboard;
