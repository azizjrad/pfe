import { useEffect, useState } from "react";
import { agencyService } from "../services/agencyService";
import { clientService } from "../services/clientService";
import { reportService } from "../services/reportService";

const DEFAULT_AGENCY_STATS = {
  totalVehicles: 0,
  availableVehicles: 0,
  maintenanceVehicles: 0,
  activeReservations: 0,
  monthlyRevenue: 0,
  alertsCount: 0,
};

const normalizeArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export default function useAgencyDashboard({ user, showToast }) {
  const [agencyStats, setAgencyStats] = useState(DEFAULT_AGENCY_STATS);
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAgencyStats = async () => {
    try {
      const response = await agencyService.getStats();
      setAgencyStats(response?.data?.data || DEFAULT_AGENCY_STATS);
    } catch (error) {
      console.error("Error fetching agency stats:", error);
      showToast?.("Erreur lors du chargement des statistiques agence", "error");
    }
  };

  const fetchReports = async () => {
    try {
      const response = await reportService.getAgencyReports();
      const source = normalizeArray(response);
      const mappedReports = source.map((report) => ({
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
      showToast?.(
        error.response?.data?.message ||
          "Erreur lors du chargement des signalements",
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

  const refreshData = async () => {
    await Promise.all([
      fetchAgencyStats(),
      fetchReports(),
      fetchNotifications(),
    ]);
  };

  useEffect(() => {
    if (user?.role !== "agency_admin") {
      setLoading(false);
      return;
    }

    setLoading(true);
    refreshData().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  return {
    agencyStats,
    reports,
    notifications,
    loading,
    refreshData,
  };
}
