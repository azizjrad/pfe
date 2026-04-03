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
          ) : (
            <>
              {/* User Basic Info */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-gray-100/80">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary-500 rounded-full inline-block shrink-0"></span>
                    <div>
                      <h4 className="text-base font-bold text-gray-900">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-400">{item.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(item.role)}`}
                    >
                      {item.role === ROLES.CLIENT
                        ? getRoleLabel(ROLES.CLIENT)
                        : item.role === ROLES.AGENCY_ADMIN
                          ? getRoleLabel(ROLES.AGENCY_ADMIN)
                          : getRoleLabel(ROLES.SUPER_ADMIN)}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${item.is_suspended ? "bg-red-50 text-red-500 border-red-200" : "bg-green-50 text-green-600 border-green-200"}`}
                    >
                      {item.is_suspended
                        ? t("common.suspended")
                        : t("common.active")}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-0.5">
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                      {t("common.phone")}
                    </p>
                    {item.phone ? (
                      <a
                        href={`tel:${item.phone}`}
                        className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                      >
                        {item.phone}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-gray-800">
                        {t("common.notAvailable")}
                      </p>
                    )}
                  </div>
                  {item.agency && (
                    <div className="space-y-0.5">
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                        {t("reports.type.agency")}
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {item.agency}
                      </p>
                    </div>
                  )}
                  <div className="space-y-0.5">
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                      {t("common.registeredOn")}
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {item.registeredAt ||
                        (item.created_at
                          ? new Date(item.created_at).toLocaleDateString(
                              "fr-FR",
                            )
                          : t("common.notAvailable"))}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reliability Score */}
              {item.role === ROLES.CLIENT &&
                (() => {
                  const getScoreColor = (score) => {
                    if (!score && score !== 0)
                      return {
                        text: "text-gray-500",
                        border: "border-gray-200",
                        label: t("common.notAvailable"),
                        bg: "bg-gray-50",
                      };
                    if (score >= 80)
                      return {
                        text: "text-green-600",
                        border: "border-green-200",
                        label: t("client.score.excellent"),
                        bg: "bg-green-50",
                      };
                    if (score >= 50)
                      return {
                        text: "text-primary-600",
                        border: "border-primary-200",
                        label: t("client.score.good"),
                        bg: "bg-primary-50",
                      };
                    if (score >= 30)
                      return {
                        text: "text-yellow-600",
                        border: "border-yellow-200",
                        label: t("client.score.average"),
                        bg: "bg-yellow-50",
                      };
                    return {
                      text: "text-red-500",
                      border: "border-red-200",
                      label: t("client.score.poor"),
                      bg: "bg-red-50",
                    };
                  };
                  const sc = getScoreColor(item.reliability_score?.score);
                  return (
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-gray-100/80">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-1 h-4 bg-primary-500 rounded-full inline-block"></span>
                        <h4 className="text-sm font-bold text-gray-900">
                          {t("client.score.title")}
                        </h4>
                        <span
                          className={`ml-auto px-3 py-0.5 rounded-full text-xs font-semibold border ${sc.text} ${sc.border} ${sc.bg}`}
                        >
                          {sc.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-5">
                        <div
                          className={`w-20 h-20 rounded-full border-4 ${sc.border} bg-white/80 flex items-center justify-center shadow-sm shrink-0`}
                        >
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${sc.text}`}>
                              {item.reliability_score?.score ?? "—"}
                            </div>
                            {item.reliability_score?.score !== undefined && (
                              <div className="text-xs text-gray-400">/100</div>
                            )}
                          </div>
                        </div>
                        {item.reliability_score && (
                          <div className="grid grid-cols-3 gap-2 flex-1">
                            {[
                              {
                                label: t("dashboard.tabs.reservations"),
                                value:
                                  item.reliability_score.total_reservations ||
                                  0,
                                color: "text-gray-700",
                              },
                              {
                                label: t("reservations.status.completed"),
                                value:
                                  item.reliability_score
                                    .completed_reservations || 0,
                                color: "text-green-600",
                              },
                              {
                                label: t("reservations.status.cancelled"),
                                value:
                                  item.reliability_score
                                    .cancelled_reservations || 0,
                                color: "text-red-500",
                              },
                              {
                                label: "Retards",
                                value: item.reliability_score.late_returns || 0,
                                color: "text-orange-500",
                              },
                              {
                                label: "Pmt. retardés",
                                value:
                                  item.reliability_score.payment_delays || 0,
                                color: "text-yellow-600",
                              },
                              {
                                label: "Dommages",
                                value:
                                  item.reliability_score.damage_incidents || 0,
                                color: "text-red-600",
                              },
                            ].map(({ label, value, color }) => (
                              <div
                                key={label}
                                className="bg-white/70 rounded-lg p-2 text-center"
                              >
                                <div className={`text-base font-bold ${color}`}>
                                  {value}
                                </div>
                                <div className="text-xs text-gray-400 leading-tight">
                                  {label}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {item.reliability_score?.admin_notes && (
                        <div className="mt-3 p-3 bg-white/70 rounded-xl border border-gray-100">
                          <p className="text-xs text-gray-400 font-medium mb-1">
                            {t("reports.adminNotes")}
                          </p>
                          <p className="text-sm text-gray-700">
                            {item.reliability_score.admin_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}

              {/* Reports Against User */}
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
                              {report.reporter_name || t("reports.type.agency")}
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

              {/* Reports Submitted By User */}
              {userReportsSubmitted.length > 0 && (
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-gray-100/80">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-1 h-4 bg-gray-400 rounded-full inline-block"></span>
                    <h4 className="text-sm font-bold text-gray-900">
                      {t("admin.reports.title")}
                    </h4>
                    <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                      {userReportsSubmitted.length}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {(showAllUserReportsSubmitted
                      ? userReportsSubmitted
                      : userReportsSubmitted.slice(0, 3)
                    ).map((report) => (
                      <div
                        key={report.id}
                        className="p-3 bg-white/80 rounded-xl border border-gray-100 flex items-start justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {report.target_name || t("reports.targetLabel")}
                            </p>
                            <span className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-500 shrink-0">
                              {getReportTypeLabel(report.report_type)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">
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
                    ))}
                    {userReportsSubmitted.length > 3 && (
                      <button
                        onClick={() =>
                          setShowAllUserReportsSubmitted(
                            !showAllUserReportsSubmitted,
                          )
                        }
                        className="w-full text-xs text-primary-600 hover:text-primary-700 font-medium py-2 hover:bg-primary-50/60 rounded-lg transition-colors"
                      >
                        {showAllUserReportsSubmitted
                          ? t("common.viewLess")
                          : t("common.viewAllCount", {
                              count: userReportsSubmitted.length,
                            })}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* User Reservations */}
              {userReservations.length > 0 && (
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-gray-100/80">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-1 h-4 bg-primary-500 rounded-full inline-block"></span>
                    <h4 className="text-sm font-bold text-gray-900">
                      {t("client.reservations.title")}
                    </h4>
                    <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-600 border border-primary-100">
                      {userReservations.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {displayedReservations.map((reservation, index) => (
                      <div
                        key={reservation.id || index}
                        className="p-3 bg-white/80 rounded-xl border border-gray-100"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {reservation.vehicle?.name ||
                                reservation.vehicle_name ||
                                t("reports.type.vehicle")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {reservation.vehicle?.agency?.name ||
                                reservation.agency_name ||
                                t("reports.type.agency")}
                            </p>
                          </div>
                          {getStatusBadge(reservation.status)}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-1.5">
                          <span>
                            {new Date(
                              reservation.start_date,
                            ).toLocaleDateString("fr-FR")}{" "}
                            →{" "}
                            {new Date(reservation.end_date).toLocaleDateString(
                              "fr-FR",
                            )}
                          </span>
                          <span className="font-semibold text-primary-600">
                            {reservation.total_price || 0} DT
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {userReservations.length > 3 && (
                    <button
                      onClick={() =>
                        setShowAllReservations(!showAllReservations)
                      }
                      className="mt-3 w-full text-xs text-primary-600 hover:text-primary-700 font-medium py-2 hover:bg-primary-50/60 rounded-lg transition-colors"
                    >
                      {showAllReservations
                        ? t("common.viewLess")
                        : t("common.viewAllCount", {
                            count: userReservations.length,
                          })}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
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
            {type === "user" && onSuspend && (
              <button
                onClick={() => {
                  onClose();
                  onSuspend(item);
                }}
                className={`flex-1 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${item.is_suspended ? "text-white bg-green-600 hover:bg-green-700" : "text-white bg-orange-500 hover:bg-orange-600"}`}
              >
                {item.is_suspended
                  ? t("admin.users.unsuspend")
                  : t("admin.users.suspend")}
              </button>
            )}
            {type === "agency" && onDelete && (
              <button
                onClick={() => {
                  if (confirm(t("admin.agencies.deleteConfirm"))) {
                    onClose();
                    onDelete(item.id);
                  }
                }}
                className="flex-1 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                {t("common.delete")}
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
