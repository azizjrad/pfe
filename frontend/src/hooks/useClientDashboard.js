import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { clientService } from "../services/clientService";
import { ROLES } from "../constants/roles";
import { getUserFacingErrorMessage } from "../utils/errorMessages";

const DEFAULT_CLIENT_STATS = {
  activeReservations: 0,
  completedReservations: 0,
  totalSpend: 0,
  reliabilityScore: 100,
  riskLabel: "Excellent",
};

const mapClientStats = (payload) => {
  const data = payload || {};

  return {
    activeReservations: Number(
      data.activeReservations ?? data.active_reservations ?? 0,
    ),
    completedReservations: Number(
      data.completedReservations ?? data.completed_reservations ?? 0,
    ),
    totalSpend: Number(data.totalSpend ?? data.total_spent ?? 0),
    reliabilityScore: Number(
      data.reliabilityScore ?? data.reliability_score ?? 100,
    ),
    riskLabel: data.riskLabel ?? data.risk_level ?? "Excellent",
  };
};

export default function useClientDashboard({ user, showToast }) {
  const { t } = useTranslation();
  const [clientStats, setClientStats] = useState(DEFAULT_CLIENT_STATS);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const markAllNotificationsAsRead = async () => {
    try {
      await clientService.markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, is_read: true })),
      );
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      showToast?.(t("errors.loadData"), "error");
      throw error;
    }
  };

  const fetchClientStats = async () => {
    try {
      const response = await clientService.getStats();
      setClientStats(mapClientStats(response?.data?.data));
    } catch (error) {
      console.error("Error fetching client stats:", error);
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

  const refreshData = async () => {
    await Promise.all([fetchClientStats(), fetchNotifications()]);
  };

  useEffect(() => {
    if (user?.role !== ROLES.CLIENT) {
      setLoading(false);
      return;
    }

    setLoading(true);
    refreshData().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  return {
    clientStats,
    notifications,
    loading,
    refreshData,
    markAllNotificationsAsRead,
  };
}
