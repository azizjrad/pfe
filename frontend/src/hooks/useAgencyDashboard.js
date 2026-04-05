import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { agencyService } from "../services/agencyService";
import { clientService } from "../services/clientService";
import { reportService } from "../services/reportService";
import { reservationService } from "../services/reservationService";
import { vehicleService } from "../services/vehicleService";
import { ROLES } from "../constants/roles";
import { normalizeArray, normalizeReport } from "../utils/normalizers";
import { getUserFacingErrorMessage } from "../utils/errorMessages";

const DEFAULT_AGENCY_STATS = {
  totalVehicles: 0,
  availableVehicles: 0,
  maintenanceVehicles: 0,
  activeReservations: 0,
  monthlyRevenue: 0,
  alertsCount: 0,
};

export default function useAgencyDashboard({ user, showToast }) {
  const { t } = useTranslation();
  const [agencyStats, setAgencyStats] = useState(DEFAULT_AGENCY_STATS);
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAgencyStats = async () => {
    try {
      const response = await agencyService.getStats();
      setAgencyStats(response?.data?.data || DEFAULT_AGENCY_STATS);
    } catch (error) {
      console.error("Error fetching agency stats:", error);
      showToast?.(
        getUserFacingErrorMessage(error, t("errors.loadData")),
        "error",
      );
    }
  };

  const fetchReports = async () => {
    try {
      const response = await reportService.getAgencyReports();
      const source = normalizeArray(response);
      const mappedReports = source.map((report) => {
        const normalized = normalizeReport(report);
        return {
          id: normalized.id,
          reportType: normalized.report_type,
          targetId: normalized.target_id,
          targetName: normalized.target_name,
          reason: normalized.reason,
          description: normalized.description,
          reportedBy: normalized.reported_by_name,
          reportedAt: normalized.created_at,
          status: normalized.status,
          adminNotes: normalized.admin_notes,
          resolvedAt: normalized.resolved_at,
        };
      });
      setReports(mappedReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      showToast?.(
        getUserFacingErrorMessage(error, t("errors.loadData")),
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

  const fetchReservations = async () => {
    try {
      const response = await reservationService.getAgency();
      setReservations(normalizeArray(response));
    } catch (error) {
      console.error("Error fetching reservations:", error);
      showToast?.(
        getUserFacingErrorMessage(error, t("errors.loadData")),
        "error",
      );
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await vehicleService.getAll();
      setVehicles(normalizeArray(response));
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      showToast?.(
        getUserFacingErrorMessage(error, t("errors.loadData")),
        "error",
      );
    }
  };

  const refreshData = async () => {
    await Promise.all([
      fetchAgencyStats(),
      fetchReports(),
      fetchNotifications(),
      fetchReservations(),
      fetchVehicles(),
    ]);
  };

  useEffect(() => {
    if (user?.role !== ROLES.AGENCY_ADMIN) {
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
    reservations,
    vehicles,
    loading,
    refreshData,
  };
}
