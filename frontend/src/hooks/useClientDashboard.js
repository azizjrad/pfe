import { useEffect, useState } from "react";
import { clientService } from "../services/clientService";

const DEFAULT_CLIENT_STATS = {
  activeReservations: 0,
  completedReservations: 0,
  totalSpend: 0,
  reliabilityScore: 100,
  riskLabel: "Excellent",
};

export default function useClientDashboard({ user, showToast }) {
  const [clientStats, setClientStats] = useState(DEFAULT_CLIENT_STATS);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClientStats = async () => {
    try {
      const response = await clientService.getStats();
      setClientStats(response?.data?.data || DEFAULT_CLIENT_STATS);
    } catch (error) {
      console.error("Error fetching client stats:", error);
      showToast?.("Erreur lors du chargement des statistiques client", "error");
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
    if (user?.role !== "client") {
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
  };
}
