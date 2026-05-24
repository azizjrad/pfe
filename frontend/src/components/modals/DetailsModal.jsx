import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ROLES } from "../../constants/roles";
import { REPORT_STATUS, RESERVATION_STATUS } from "../../constants/statuses";

export default function DetailsModal({
  isOpen,
  onClose,
  type, // 'agency' or 'user'
  item,
  reservations = [], // For users
  reports = [], // Reports against this agency/user
  userReportsSubmitted = [], // For users - reports submitted BY user
  vehicles = [], // For agencies - their car fleet (vitrine)
  agencyAdmin = null, // For agencies - the agency admin user details
  onEdit,
  onDelete,
  onSuspend, // For users
}) {
  const { t } = useTranslation();
  const [showAllReservations, setShowAllReservations] = useState(false);
  const [showAllReports, setShowAllReports] = useState(false);
  const [showAllUserReportsSubmitted, setShowAllUserReportsSubmitted] =
    useState(false);
  const [showAllVehicles, setShowAllVehicles] = useState(false);

  if (!isOpen || !item) return null;

  const getStatusBadge = (status) => {
    const statusConfig = {
      [RESERVATION_STATUS.PENDING]: {
        label: t("reservations.status.pending"),
        class: "bg-yellow-100 text-yellow-700",
      },
      [RESERVATION_STATUS.CONFIRMED]: {
        label: t("reservations.status.confirmed"),
        class: "bg-blue-100 text-blue-700",
      },
      [RESERVATION_STATUS.ONGOING]: {
        label: t("reservations.status.active"),
        class: "bg-purple-100 text-purple-700",
      },
      [RESERVATION_STATUS.COMPLETED]: {
        label: t("reservations.status.completed"),
        class: "bg-green-100 text-green-700",
      },
      [RESERVATION_STATUS.CANCELLED]: {
        label: t("reservations.status.cancelled"),
        class: "bg-red-100 text-red-700",
      },
    };
    const config =
      statusConfig[status] || statusConfig[RESERVATION_STATUS.PENDING];
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}
      >
        {config.label}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      [ROLES.CLIENT]: "bg-blue-100 text-blue-700",
      [ROLES.AGENCY_ADMIN]: "bg-purple-100 text-purple-700",
      [ROLES.SUPER_ADMIN]: "bg-red-100 text-red-700",
    };
    return roleConfig[role] || "bg-gray-100 text-gray-700";
  };

  const getStatusColor = (status) => {
    return status === "active"
      ? "bg-green-100 text-green-700"
      : "bg-gray-100 text-gray-700";
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case ROLES.CLIENT:
        return t("roles.client");
      case ROLES.AGENCY_ADMIN:
        return t("roles.agency_admin");
      case ROLES.SUPER_ADMIN:
        return t("roles.super_admin");
      default:
        return t("roles.user");
    }
  };

  const getReportTypeLabel = (reportType) => {
    if (reportType === "vehicle") return t("reports.type.vehicle");
    if (reportType === "agency") return t("reports.type.agency");
    return t("roles.user");
  };

  const getReportStatusLabel = (status) => {
    if (status === REPORT_STATUS.PENDING)
      return t("admin.reports.filter.pending");
    if (status === REPORT_STATUS.RESOLVED)
      return t("admin.reports.filter.resolved");
    return t("admin.reports.filter.dismissed");
  };

  // Filter user's reservations
  const userReservations =
    type === "user"
      ? reservations.filter(
          (r) => r.user_id === item.id || r.client_id === item.id,
        )
      : [];

  const displayedReservations = showAllReservations
    ? userReservations
    : userReservations.slice(0, 3);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/70 backdrop-blur-xl border-b border-gray-100/80 px-6 py-5 rounded-t-3xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-50 border border-primary-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {type === "agency" ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  )}
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {type === "agency"
                    ? t("modals.details.agencyDetails")
                    : t("modals.details.userDetails")}
                </h3>
                <p className="text-xs text-gray-400">
                  {type === "agency" ? item.location : item.email}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100/80 hover:bg-gray-200/80 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-4 h-4"
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
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {type === "agency" ? (
            <>
              {/* Agency Basic Info */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-gray-100/80">
                <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-primary-500 rounded-full inline-block"></span>
                  {item.name}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    {
                      label: t("common.address"),
                      value: item.address || t("common.notAvailable"),
                    },
                    {
                      label: t("common.phone"),
                      value: item.phone || t("common.notAvailable"),
                    },
                    {
                      label: t("common.email"),
                      value: item.email || t("common.notAvailable"),
                    },
                    {
                      label: t("common.location"),
                      value: item.location || t("common.notAvailable"),
                    },
                    {
                      label: t("dashboard.tabs.vehicles"),
                      value: item.vehicles || 0,
                    },
                    {
                      label: t("dashboard.stats.monthlyRevenue.title"),
                      value: `${(item.revenue ?? 0).toLocaleString()} DT`,
                      accent: true,
                    },
                    {
                      label: t("common.date"),
                      value: item.created_at
                        ? new Date(item.created_at).toLocaleDateString("fr-FR")
                        : t("common.notAvailable"),
                    },
                    {
                      label: t("dashboard.tabs.reports"),
                      value: reports.length || 0,
                      danger: reports.length > 0,
                    },
                  ].map(({ label, value, accent, danger }) => (
                    <div key={label} className="space-y-0.5">
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                        {label}
                      </p>
                      <p
                        className={`text-sm font-semibold ${accent ? "text-primary-600" : danger ? "text-red-500" : "text-gray-800"}`}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                  <div className="space-y-0.5">
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                      Statut
                    </p>
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${item.status === "active" ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}
                    >
                      {item.status === "active"
                        ? t("common.active")
                        : t("common.inactive")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Agency Admin Details */}
              {agencyAdmin && (
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-gray-100/80">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-1 h-4 bg-purple-400 rounded-full inline-block"></span>
                    <h4 className="text-sm font-bold text-gray-900">
                      {t("roles.agency_admin")} - Gestionnaire
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                    {[
                      {
                        label: t("common.name"),
                        value: agencyAdmin.name || t("common.notAvailable"),
                      },
                      {
                        label: t("common.email"),
                        value: agencyAdmin.email || t("common.notAvailable"),
                      },
                      {
                        label: t("common.phone"),
                        value: agencyAdmin.phone || t("common.notAvailable"),
                      },
                      {
                        label: t("common.status"),
                        value: agencyAdmin.is_suspended
                          ? t("common.inactive")
                          : t("common.active"),
                        accent: !agencyAdmin.is_suspended,
                        danger: agencyAdmin.is_suspended,
                      },
                    ].map(({ label, value, accent, danger }) => (
                      <div key={label} className="space-y-0.5">
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                          {label}
                        </p>
                        <p
                          className={`text-sm font-semibold ${accent ? "text-green-600" : danger ? "text-red-500" : "text-gray-800"}`}
                        >
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vehicles Vitrine */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-gray-100/80">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1 h-4 bg-primary-400 rounded-full inline-block"></span>
                  <h4 className="text-sm font-bold text-gray-900">
                    {t("modals.details.vehicleDetails")}
                  </h4>
                  <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-600 border border-primary-100">
                    {vehicles.length}
                  </span>
                </div>
                {vehicles.length === 0 ? (
                  <div className="text-center py-6 text-gray-400">
                    <svg
                      className="w-10 h-10 mx-auto mb-2 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                      />
                    </svg>
                    <p className="text-xs">{t("agency.vehicles.noVehicles")}</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {(showAllVehicles ? vehicles : vehicles.slice(0, 4)).map(
                      (vehicle) => {
                        const statusConfig = {
                          available: {
                            label: t("vehicles.filter.available"),
                            cls: "bg-green-50 text-green-600 border-green-100",
                          },
                          rented: {
                            label: t("reservations.status.active"),
                            cls: "bg-blue-50 text-blue-600 border-blue-100",
                          },
                          maintenance: {
                            label: t("vehicles.filter.unavailable"),
                            cls: "bg-orange-50 text-orange-600 border-orange-100",
                          },
                        };
                        const st = statusConfig[vehicle.status] || {
                          label: vehicle.status,
                          cls: "bg-gray-50 text-gray-500 border-gray-100",
                        };
                        return (
                          <div
                            key={vehicle.id}
                            className="p-3 bg-white/80 rounded-xl border border-gray-100 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                                <svg
                                  className="w-4 h-4 text-primary-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                                  />
                                </svg>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {vehicle.brand} {vehicle.model}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                  {vehicle.year}
                                  {vehicle.seats
                                    ? ` · ${vehicle.seats} places`
                                    : ""}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-sm font-bold text-primary-600">
                                {vehicle.daily_price} DT
                                <span className="text-xs font-normal text-gray-400">
                                  /j
                                </span>
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium border ${st.cls}`}
                              >
                                {st.label}
                              </span>
                            </div>
                            {Array.isArray(vehicle.price_history) &&
                              vehicle.price_history.length > 0 && (
                                <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50/80 p-3">
                                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Historique des prix
                                  </p>
                                  <div className="space-y-2">
                                    {vehicle.price_history.map((entry) => {
                                      const from = entry.effective_from
                                        ? new Date(
                                            entry.effective_from,
                                          ).toLocaleDateString("fr-FR")
                                        : "—";
                                      const to = entry.effective_to
                                        ? new Date(
                                            entry.effective_to,
                                          ).toLocaleDateString("fr-FR")
                                        : "Actuel";
                                      return (
                                        <div
                                          key={entry.id}
                                          className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-xs"
                                        >
                                          <div className="text-gray-500 text-xs">
                                            <div>
                                              Début:{" "}
                                              <span className="font-medium text-gray-700">
                                                {from}
                                              </span>
                                            </div>
                                            <div>
                                              Fin:{" "}
                                              <span className="font-medium text-gray-700">
                                                {to}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="font-semibold text-gray-900">
                                            {Number(entry.price || 0).toFixed(
                                              2,
                                            )}{" "}
                                            DT
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                          </div>
                        );
                      },
                    )}
                    {vehicles.length > 4 && (
                      <button
                        onClick={() => setShowAllVehicles(!showAllVehicles)}
                        className="w-full text-xs text-primary-600 hover:text-primary-700 font-medium py-2 hover:bg-primary-50/60 rounded-lg transition-colors"
                      >
                        {showAllVehicles
                          ? t("common.viewLess")
                          : t("common.viewAllCount", {
                              count: vehicles.length,
                            })}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Reports */}
              {reports.length > 0 && (
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-gray-100/80">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-1 h-4 bg-red-400 rounded-full inline-block"></span>
                    <h4 className="text-sm font-bold text-gray-900">
                      {t("dashboard.tabs.reports")}
                    </h4>
                    <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-500 border border-red-100">
                      {reports.length}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {(showAllReports ? reports : reports.slice(0, 3)).map(
                      (report) => (
                        <div
                          key={report.id}
                          className="p-3 bg-white/80 rounded-xl border border-gray-100 flex items-start justify-between gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {report.reporter_name || t("roles.user")}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              {report.reason ||
                                report.description ||
                                t("common.notSpecified")}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-xs text-gray-400">
                              {new Date(report.created_at).toLocaleDateString(
                                "fr-FR",
                              )}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${report.status === REPORT_STATUS.PENDING ? "bg-yellow-50 text-yellow-600" : report.status === REPORT_STATUS.RESOLVED ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-500"}`}
                            >
                              {getReportStatusLabel(report.status)}
                            </span>
                          </div>
                        </div>
                      ),
                    )}
                    {reports.length > 3 && (
                      <button
                        onClick={() => setShowAllReports(!showAllReports)}
                        className="w-full text-xs text-primary-600 hover:text-primary-700 font-medium py-2 hover:bg-primary-50/60 rounded-lg transition-colors"
                      >
                        {showAllReports
                          ? t("common.viewLess")
                          : t("common.viewAllCount", { count: reports.length })}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white/70 backdrop-blur-xl border-t border-gray-100/80 px-5 py-4 rounded-b-3xl">
          <div className="flex gap-2.5">
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(item);
                }}
                className="flex-1 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                {t("common.edit")}
              </button>
            )}
            {type === "agency" && onSuspend && (
              <button
                onClick={() => {
                  onClose();
                  onSuspend(item);
                }}
                className={`flex-1 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${item.status === "inactive" ? "text-white bg-green-600 hover:bg-green-700" : "text-white bg-orange-500 hover:bg-orange-600"}`}
              >
                {item.status === "inactive"
                  ? t("dashboard.unblock")
                  : t("dashboard.block")}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100/80 hover:bg-gray-200/80 transition-colors"
            >
              {t("common.close")}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.2s ease-out; }
      `}</style>
    </div>
  );
}
