import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

/**
 * Custom hook for fetching dynamic pricing
 */
export const useDynamicPricing = (
  vehicleId,
  startDate,
  endDate,
  options = {},
) => {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch if we have all required parameters
    if (!vehicleId || !startDate || !endDate) {
      setPricing(null);
      return;
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      setError("Dates invalides");
      return;
    }

    const fetchPricing = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");

        const response = await axios.post(
          `${API_URL}/pricing/calculate`,
          {
            vehicle_id: vehicleId,
            start_date: startDate,
            end_date: endDate,
            options: options,
          },
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );

        if (response.data.success) {
          setPricing(response.data.data);
        } else {
          setError(response.data.message || "Erreur lors du calcul du prix");
        }
      } catch (err) {
        console.error("Pricing calculation error:", err);
        setError(
          err.response?.data?.message || "Impossible de calculer le prix",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, [vehicleId, startDate, endDate, JSON.stringify(options)]);

  return { pricing, loading, error };
};

/**
 * Custom hook for fetching vehicle base pricing (current season)
 */
export const useVehiclePricing = (vehicleId) => {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!vehicleId) {
      setPricing(null);
      setLoading(false);
      return;
    }

    const fetchVehiclePricing = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `${API_URL}/vehicles/${vehicleId}/pricing`,
        );

        if (response.data.success) {
          setPricing(response.data.data);
        } else {
          setError(
            response.data.message || "Erreur lors de la récupération du prix",
          );
        }
      } catch (err) {
        console.error("Vehicle pricing error:", err);
        setError(
          err.response?.data?.message || "Impossible de récupérer le prix",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVehiclePricing();
  }, [vehicleId]);

  return { pricing, loading, error };
};

/**
 * Custom hook for fetching pricing rules
 */
export const usePricingRules = () => {
  const [rules, setRules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRules = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${API_URL}/pricing/rules`);

        if (response.data.success) {
          setRules(response.data.data);
        } else {
          setError(
            response.data.message ||
              "Erreur lors de la récupération des règles",
          );
        }
      } catch (err) {
        console.error("Pricing rules error:", err);
        setError(
          err.response?.data?.message || "Impossible de récupérer les règles",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, []);

  return { rules, loading, error };
};

/**
 * Utility function to manually trigger price calculation
 */
export const calculatePrice = async (
  vehicleId,
  startDate,
  endDate,
  options = {},
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      `${API_URL}/pricing/calculate`,
      {
        vehicle_id: vehicleId,
        start_date: startDate,
        end_date: endDate,
        options: options,
      },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    );

    if (response.data.success) {
      return { success: true, data: response.data.data };
    } else {
      return { success: false, error: response.data.message };
    }
  } catch (err) {
    console.error("Price calculation error:", err);
    return {
      success: false,
      error: err.response?.data?.message || "Erreur lors du calcul du prix",
    };
  }
};

/**
 * Utility function to get seasonal indicator badge
 */
export const getSeasonalBadge = (seasonLabel) => {
  if (!seasonLabel) return null;

  const badgeConfig = {
    "Haute saison (+25%)": {
      bg: "bg-orange-100",
      text: "text-orange-800",
      icon: "🔥",
    },
    "Saison des fêtes (+20%)": {
      bg: "bg-red-100",
      text: "text-red-800",
      icon: "🎄",
    },
    "Basse saison (-15%)": {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: "💰",
    },
    "Saison régulière": {
      bg: "bg-blue-100",
      text: "text-blue-800",
      icon: "📅",
    },
  };

  return badgeConfig[seasonLabel] || badgeConfig["Saison régulière"];
};
