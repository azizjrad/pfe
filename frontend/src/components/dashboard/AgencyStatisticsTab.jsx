import React, { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { RESERVATION_STATUS } from "../../constants/statuses";

const periodMonthsMap = {
  all: null,
  "3m": 3,
  "6m": 6,
  "12m": 12,
};

const AgencyStatisticsTab = ({
  reservations = [],
  vehicles = [],
  loading = false,
}) => {
  const [statisticsPeriod, setStatisticsPeriod] = useState("6m");

  const completedReservations = reservations.filter(
    (reservation) => reservation.status === RESERVATION_STATUS.COMPLETED,
  );
  const activeReservations = reservations.filter((reservation) =>
    [
      RESERVATION_STATUS.PENDING,
      RESERVATION_STATUS.CONFIRMED,
      RESERVATION_STATUS.ONGOING,
    ].includes(reservation.status),
  );
  const availableVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "available",
  );
  const maintenanceVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "maintenance",
  );

  const selectedPeriodMonths = periodMonthsMap[statisticsPeriod] ?? 6;
  const periodStart = selectedPeriodMonths
    ? (() => {
        const date = new Date();
        date.setMonth(date.getMonth() - selectedPeriodMonths);
        return date;
      })()
    : null;

  const isReservationInPeriod = (reservation) => {
    if (!periodStart) return true;

    const referenceDate = new Date(
      reservation.end_date || reservation.created_at || reservation.start_date,
    );

    return (
      !Number.isNaN(referenceDate.getTime()) && referenceDate >= periodStart
    );
  };

  const filteredReservations = reservations.filter(isReservationInPeriod);
  const filteredCompletedReservations = completedReservations.filter(
    isReservationInPeriod,
  );
  const filteredActiveReservations = filteredReservations.filter(
    (reservation) =>
      [
        RESERVATION_STATUS.PENDING,
        RESERVATION_STATUS.CONFIRMED,
        RESERVATION_STATUS.ONGOING,
      ].includes(reservation.status),
  );

  const deriveMonthlyRevenue = () => {
    const revenueByMonth = new Map();

    filteredCompletedReservations.forEach((reservation) => {
      const date = new Date(reservation.end_date || reservation.created_at);
      const monthLabel = Number.isNaN(date.getTime())
        ? "Inconnu"
        : date.toLocaleDateString("fr-FR", {
            month: "short",
            year: "numeric",
          });
      const agencyRevenue = Number(reservation.agency_payout || 0);
      const platformCommission = Number(reservation.platform_commission || 0);

      revenueByMonth.set(monthLabel, {
        month: monthLabel,
        revenue: (revenueByMonth.get(monthLabel)?.revenue || 0) + agencyRevenue,
        commission:
          (revenueByMonth.get(monthLabel)?.commission || 0) +
          platformCommission,
      });
    });

    return Array.from(revenueByMonth.values()).slice(-6);
  };

  const deriveVehiclePerformance = () => {
    const performanceMap = new Map();

    filteredCompletedReservations.forEach((reservation) => {
      const vehicleId = reservation.vehicle_id || reservation.vehicle?.id;
      if (!vehicleId) return;

      const vehicleName =
        reservation.vehicle?.name ||
        `${reservation.vehicle?.brand || "Véhicule"} ${reservation.vehicle?.model || vehicleId}`.trim();
      const agencyRevenue = Number(reservation.agency_payout || 0);

      performanceMap.set(vehicleId, {
        vehicle: vehicleName,
        revenue: (performanceMap.get(vehicleId)?.revenue || 0) + agencyRevenue,
        bookings: (performanceMap.get(vehicleId)?.bookings || 0) + 1,
      });
    });

    return Array.from(performanceMap.values())
      .sort((left, right) => right.revenue - left.revenue)
      .slice(0, 6);
  };

  const monthlyRevenue = deriveMonthlyRevenue();
  const vehiclePerformance = deriveVehiclePerformance();
  const paymentStatus = [
    {
      name: "En attente",
      value: filteredReservations.filter(
        (reservation) => reservation.status === RESERVATION_STATUS.PENDING,
      ).length,
      color: "#F59E0B",
    },
    {
      name: "Confirmée",
      value: filteredReservations.filter(
        (reservation) => reservation.status === RESERVATION_STATUS.CONFIRMED,
      ).length,
      color: "#3B82F6",
    },
    {
      name: "Terminée",
      value: filteredCompletedReservations.length,
      color: "#10B981",
    },
  ];
  const totalCommission = filteredCompletedReservations.reduce(
    (sum, reservation) => sum + Number(reservation.platform_commission || 0),
    0,
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600"></div>
        <p className="text-gray-500">Chargement des statistiques...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Statistiques de l'Agence
        </h2>
        <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
          <span className="text-sm font-medium text-gray-600">Période</span>
          <select
            value={statisticsPeriod}
            onChange={(event) => setStatisticsPeriod(event.target.value)}
            className="bg-transparent text-sm font-semibold text-gray-900 outline-none"
          >
            <option value="3m">3 mois</option>
            <option value="6m">6 mois</option>
            <option value="12m">12 mois</option>
            <option value="all">Tout</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg lg:col-span-2 animate-slideUp">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Revenus mensuels nets
              </h3>
              <p className="text-sm text-gray-500">
                Revenus agence après commission plateforme de 5%.
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {statisticsPeriod === "all"
                ? "Toutes les périodes"
                : `${statisticsPeriod === "3m" ? 3 : statisticsPeriod === "6m" ? 6 : 12} derniers mois`}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.97)",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.08)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2563EB"
                strokeWidth={3}
                name="Revenu net agence"
                dot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="commission"
                stroke="#8B5CF6"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Commission plateforme"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg animate-slideUp"
          style={{ animationDelay: "150ms" }}
        >
          <h3 className="mb-2 text-lg font-bold text-gray-900">
            Répartition des réservations
          </h3>
          <p className="mb-4 text-sm text-gray-500">
            Dossiers actifs, terminés et en attente.
          </p>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={102}
                  dataKey="value"
                >
                  {paymentStatus.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg animate-slideUp"
          style={{ animationDelay: "250ms" }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              Top véhicules par revenu
            </h3>
            <span className="text-sm text-gray-500">
              Réservations terminées
            </span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={vehiclePerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" />
              <YAxis
                dataKey="vehicle"
                type="category"
                stroke="#6B7280"
                width={140}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.97)",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.08)",
                }}
              />
              <Legend />
              <Bar
                dataKey="revenue"
                fill="#3B82F6"
                name="Revenu net"
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

        <div
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg animate-slideUp"
          style={{ animationDelay: "350ms" }}
        >
          <h3 className="mb-4 text-lg font-bold text-gray-900">
            Indicateurs utiles
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-gray-500">Flotte totale</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {vehicles.length}
              </p>
            </div>
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-sm text-blue-700">Véhicules disponibles</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {availableVehicles.length}
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-sm text-amber-700">En maintenance</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {maintenanceVehicles.length}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700">Taux de réalisation</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {filteredReservations.length > 0
                  ? `${Math.round((filteredCompletedReservations.length / filteredReservations.length) * 100)}%`
                  : "0%"}
              </p>
            </div>
          </div>
          <div className="mt-5 rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">Commission plateforme</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {totalCommission.toLocaleString()} DT
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Calculée à 5% sur les réservations de la période sélectionnée.
            </p>
          </div>
        </div>
      </div>

      <style>{`\n        @keyframes fadeIn {\n          from { opacity: 0; }\n          to { opacity: 1; }\n        }\n\n        @keyframes slideUp {\n          from {\n            opacity: 0;\n            transform: translateY(20px);\n          }\n          to {\n            opacity: 1;\n            transform: translateY(0);\n          }\n        }\n\n        .animate-fadeIn {\n          animation: fadeIn 0.5s ease-out;\n        }\n\n        .animate-slideUp {\n          animation: slideUp 0.6s ease-out both;\n        }\n      `}</style>
    </div>
  );
};

export default AgencyStatisticsTab;
