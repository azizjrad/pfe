import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { adminService } from "../services/adminService";
import { clientService } from "../services/clientService";
import { contactService } from "../services/contactService";
import { reportService } from "../services/reportService";
import { ROLES } from "../constants/roles";
import { normalizeArray, normalizeReport } from "../utils/normalizers";

const DEFAULT_PLATFORM_STATS = {
  totalAgencies: 0,
  totalUsers: 0,
  totalVehicles: 0,
  totalReservations: 0,
  monthlyRevenue: 0,
  activeReservations: 0,
};

const DEFAULT_FINANCIAL_STATS = {
  monthly: [],
  byAgency: [],
  paymentMethods: [],
  totals: { revenue: 0, commission: 0, profit: 0, avgMonthly: 0 },
};

export default function useAdminDashboard({
  user,
  activeTab,
  statisticsSubTab,
  showToast,
}) {
  const { t } = useTranslation();
  const [platformStats, setPlatformStats] = useState(DEFAULT_PLATFORM_STATS);
  const [agencies, setAgencies] = useState([]);
  const [users, setUsers] = useState([]);
  const [allReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [reports, setReports] = useState([]);
  const [trashedReports, setTrashedReports] = useState([]);
  const [reportsView, setReportsView] = useState("active");
  const [reportsFilter, setReportsFilter] = useState("all");

  const [contactMessages, setContactMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [financialStats, setFinancialStats] = useState(DEFAULT_FINANCIAL_STATS);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, agenciesRes, usersRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAgencies(),
        adminService.getUsers(),
      ]);

      setPlatformStats(statsRes?.data || DEFAULT_PLATFORM_STATS);
      setAgencies(normalizeArray(agenciesRes));
      setUsers(normalizeArray(usersRes));

      await fetchNotifications();
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showToast?.(
        error.response?.data?.message || t("errors.loadData"),
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await reportService.getAll();
      const list = normalizeArray(response).map(normalizeReport);
      setReports(list);
    } catch (error) {
      console.error("Error fetching reports:", error);
      showToast?.(
        error.response?.data?.message || t("errors.loadData"),
        "error",
      );
    }
  };

  const fetchTrashedReports = async () => {
    try {
      const response = await reportService.getTrashed();
      const list = normalizeArray(response).map(normalizeReport);
      setTrashedReports(list);
    } catch (error) {
      console.error("Error fetching trashed reports:", error);
      setTrashedReports([]);
    }
  };

  const fetchContactMessages = async () => {
    try {
      const response = await contactService.getAll();
      const messages = response?.data || [];
      setContactMessages(Array.isArray(messages) ? messages : []);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      showToast?.(
        error.response?.data?.message || t("errors.loadData"),
        "error",
      );
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await clientService.getNotifications();
      setNotifications(response?.data?.data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchFinancialStats = async () => {
    try {
      const response = await adminService.getFinancialStats();
      setFinancialStats(response?.data || DEFAULT_FINANCIAL_STATS);
    } catch (error) {
      console.error("Error fetching financial stats:", error);
      showToast?.(
        error.response?.data?.message || t("errors.loadData"),
        "error",
      );
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const [reportsAgainst, reportsSubmitted] = await Promise.all([
        reportService.getUserReportsAgainst(userId),
        reportService.getUserReportsSubmitted(userId),
      ]);

      return {
        reports: normalizeArray(reportsAgainst),
        userReportsSubmitted: normalizeArray(reportsSubmitted),
      };
    } catch (error) {
      console.error("Error fetching user details:", error);
      return { reports: [], userReportsSubmitted: [] };
    }
  };

  const fetchAgencyDetails = async (agencyId) => {
    try {
      const [reportsAgainst, vehiclesRes] = await Promise.all([
        reportService.getAgencyReportsAgainst(agencyId),
        adminService.getAgencyVehicles(agencyId),
      ]);

      return {
        reports: normalizeArray(reportsAgainst),
        vehicles: normalizeArray(vehiclesRes),
      };
    } catch (error) {
      console.error("Error fetching agency details:", error);
      return { reports: [], vehicles: [] };
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
      showToast?.(t("admin.contact.markReadSuccess"), "success");
    } catch (error) {
      showToast?.(
        error.response?.data?.message || t("errors.genericError"),
        "error",
      );
    }
  };

  const handleDeleteContactMessage = async (id) => {
    try {
      await contactService.delete(id);
      setContactMessages((prev) => prev.filter((message) => message.id !== id));
      showToast?.(t("admin.contact.deleteSuccess"), "success");
    } catch (error) {
      showToast?.(
        error.response?.data?.message || t("errors.genericError"),
        "error",
      );
    }
  };

  const handleDeleteAgency = async (id) => {
    await adminService.deleteAgency(id);
    setAgencies((prev) => prev.filter((a) => a.id !== id));
    setPlatformStats((prev) => ({
      ...prev,
      totalAgencies: Math.max(0, (prev.totalAgencies || 0) - 1),
    }));
    showToast?.(t("admin.agencies.deleteSuccess"), "success");
  };

  const handleDeleteUser = async (id) => {
    await adminService.deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setPlatformStats((prev) => ({
      ...prev,
      totalUsers: Math.max(0, (prev.totalUsers || 0) - 1),
    }));
    showToast?.(t("admin.users.deleteSuccess"), "success");
  };

  const handleEditAgency = async (updatedData) => {
    const response = await adminService.updateAgency(
      updatedData.id,
      updatedData,
    );
    setAgencies((prev) =>
      prev.map((a) =>
        a.id === updatedData.id ? { ...a, ...(response?.data || {}) } : a,
      ),
    );
    showToast?.(t("admin.agencies.editSuccess"), "success");
  };

  const handleEditUser = async (updatedData) => {
    const response = await adminService.updateUser(updatedData.id, updatedData);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === updatedData.id ? { ...u, ...(response?.data || {}) } : u,
      ),
    );
    showToast?.(t("admin.users.editSuccess"), "success");
  };

  const handleSuspendAgency = async (agency) => {
    const newStatus = agency.status === "active" ? "inactive" : "active";
    await adminService.suspendAgency(agency.id, newStatus);
    setAgencies((prev) =>
      prev.map((a) => (a.id === agency.id ? { ...a, status: newStatus } : a)),
    );
  };

  const handleSuspendUser = async (targetUser) => {
    await adminService.suspendUser(targetUser.id, !targetUser.is_suspended);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === targetUser.id
          ? { ...u, is_suspended: !targetUser.is_suspended }
          : u,
      ),
    );
  };

  const handleResolveReport = async (report, notes) => {
    await reportService.resolve(report.id, notes);
    await Promise.all([fetchReports(), fetchTrashedReports()]);
    showToast?.(t("admin.reports.resolveSuccess"), "success");
  };

  const handleDismissReport = async (report, notes) => {
    await reportService.dismiss(report.id, notes);
    await Promise.all([fetchReports(), fetchTrashedReports()]);
    showToast?.(t("admin.reports.dismissSuccess"), "success");
  };

  const handleDeleteReport = async (report) => {
    await reportService.moveToTrash(report.id);
    setReports((prev) => prev.filter((item) => item.id !== report.id));
    setTrashedReports((prev) => [report, ...prev]);
    showToast?.(t("admin.reports.deleteSuccess"), "success");
  };

  const handleRestoreReport = async (report) => {
    await reportService.restore(report.id);
    setTrashedReports((prev) => prev.filter((item) => item.id !== report.id));
    setReports((prev) => [report, ...prev]);
    showToast?.(t("admin.reports.restoreSuccess"), "success");
  };

  const handlePermanentDeleteReport = async (report) => {
    await reportService.forceDelete(report.id);
    setTrashedReports((prev) => prev.filter((item) => item.id !== report.id));
    showToast?.(t("admin.reports.forceDeleteSuccess"), "success");
  };

  const refreshData = async () => {
    await Promise.all([
      fetchDashboardData(),
      fetchContactMessages(),
      fetchReports(),
      fetchTrashedReports(),
    ]);

    if (activeTab === "statistics" && statisticsSubTab === "finance") {
      await fetchFinancialStats();
    }
  };

  useEffect(() => {
    if (user?.role !== ROLES.SUPER_ADMIN) {
      setLoading(false);
      return;
    }

    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  useEffect(() => {
    if (
      user?.role === ROLES.SUPER_ADMIN &&
      activeTab === "statistics" &&
      statisticsSubTab === "finance"
    ) {
      fetchFinancialStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role, activeTab, statisticsSubTab]);

  return {
    platformStats,
    agencies,
    users,
    allReservations,
    loading,
    reports,
    trashedReports,
    reportsView,
    setReportsView,
    reportsFilter,
    setReportsFilter,
    contactMessages,
    notifications,
    financialStats,
    refreshData,
    fetchUserDetails,
    fetchAgencyDetails,
    handleMarkMessageRead,
    handleDeleteContactMessage,
    handleDeleteAgency,
    handleDeleteUser,
    handleEditAgency,
    handleEditUser,
    handleSuspendAgency,
    handleSuspendUser,
    handleResolveReport,
    handleDismissReport,
    handleDeleteReport,
    handleRestoreReport,
    handlePermanentDeleteReport,
  };
}
