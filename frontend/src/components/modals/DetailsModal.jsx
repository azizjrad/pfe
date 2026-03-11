import React, { useState } from "react";

export default function DetailsModal({
  isOpen,
  onClose,
  type, // 'agency' or 'user'
  item,
  reviews = [], // For agencies - reviews received by agency
  reservations = [], // For users
  userReviews = [], // For users - reviews written by user
  reports = [], // Reports against this agency/user
  userReportsSubmitted = [], // For users - reports submitted BY user
  vehicles = [], // For agencies - their car fleet (vitrine)
  onEdit,
  onDelete,
  onSuspend, // For users
}) {
  const [showAllReservations, setShowAllReservations] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showAllUserReviews, setShowAllUserReviews] = useState(false);
  const [showAllReports, setShowAllReports] = useState(false);
  const [showAllUserReportsSubmitted, setShowAllUserReportsSubmitted] =
    useState(false);
  const [showAllVehicles, setShowAllVehicles] = useState(false);

  if (!isOpen || !item) return null;

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: "En attente", class: "bg-yellow-100 text-yellow-700" },
      confirmed: { label: "Confirmée", class: "bg-blue-100 text-blue-700" },
      ongoing: { label: "En cours", class: "bg-purple-100 text-purple-700" },
      completed: { label: "Terminée", class: "bg-green-100 text-green-700" },
      cancelled: { label: "Annulée", class: "bg-red-100 text-red-700" },
    };
    const config = statusConfig[status] || statusConfig.pending;
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
      client: "bg-blue-100 text-blue-700",
      agency_admin: "bg-purple-100 text-purple-700",
      super_admin: "bg-red-100 text-red-700",
    };
    return roleConfig[role] || "bg-gray-100 text-gray-700";
  };

  const getStatusColor = (status) => {
    return status === "active"
      ? "bg-green-100 text-green-700"
      : "bg-gray-100 text-gray-700";
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

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 5);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

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
                    ? "Détails de l'Agence"
                    : "Détails de l'Utilisateur"}
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
                    { label: "Adresse", value: item.address || "N/A" },
                    { label: "Téléphone", value: item.phone || "N/A" },
                    { label: "Email", value: item.email || "N/A" },
                    { label: "Localisation", value: item.location || "N/A" },
                    { label: "Véhicules", value: item.vehicles || 0 },
                    {
                      label: "Revenu Total",
                      value: `${(item.revenue ?? 0).toLocaleString()} DT`,
                      accent: true,
                    },
                    {
                      label: "Créée le",
                      value: item.created_at
                        ? new Date(item.created_at).toLocaleDateString("fr-FR")
                        : "N/A",
                    },
                    {
                      label: "Signalements",
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
                      {item.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vehicles Vitrine */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-gray-100/80">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1 h-4 bg-primary-400 rounded-full inline-block"></span>
                  <h4 className="text-sm font-bold text-gray-900">
                    Vitrine des Véhicules
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
                    <p className="text-xs">Aucun véhicule enregistré</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {(showAllVehicles ? vehicles : vehicles.slice(0, 4)).map(
                      (vehicle) => {
                        const statusConfig = {
                          available: {
                            label: "Disponible",
                            cls: "bg-green-50 text-green-600 border-green-100",
                          },
                          rented: {
                            label: "Loué",
                            cls: "bg-blue-50 text-blue-600 border-blue-100",
                          },
                          maintenance: {
                            label: "Maintenance",
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
                          ? "Voir moins"
                          : `Voir tous (${vehicles.length})`}
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
                      Signalements contre l'agence
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
                              {report.reporter_name || "Utilisateur"}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              {report.reason ||
                                report.description ||
                                "Non spécifié"}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-xs text-gray-400">
                              {new Date(report.created_at).toLocaleDateString(
                                "fr-FR",
                              )}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${report.status === "pending" ? "bg-yellow-50 text-yellow-600" : report.status === "resolved" ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-500"}`}
                            >
                              {report.status === "pending"
                                ? "En attente"
                                : report.status === "resolved"
                                  ? "Résolu"
                                  : "Rejeté"}
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
                          ? "Voir moins"
                          : `Voir tous (${reports.length})`}
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
                      {item.role === "client"
                        ? "Client"
                        : item.role === "agency_admin"
                          ? "Admin Agence"
                          : "Super Admin"}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${item.is_suspended ? "bg-red-50 text-red-500 border-red-200" : "bg-green-50 text-green-600 border-green-200"}`}
                    >
                      {item.is_suspended ? "Suspendu" : "Actif"}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-0.5">
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                      Téléphone
                    </p>
                    {item.phone ? (
                      <a
                        href={`tel:${item.phone}`}
                        className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                      >
                        {item.phone}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-gray-800">N/A</p>
                    )}
                  </div>
                  {item.agency && (
                    <div className="space-y-0.5">
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                        Agence
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {item.agency}
                      </p>
                    </div>
                  )}
                  <div className="space-y-0.5">
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                      Inscrit le
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {item.registeredAt ||
                        (item.created_at
                          ? new Date(item.created_at).toLocaleDateString(
                              "fr-FR",
                            )
                          : "N/A")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reliability Score */}
              {item.role === "client" &&
                (() => {
                  const getScoreColor = (score) => {
                    if (!score && score !== 0)
                      return {
                        text: "text-gray-500",
                        border: "border-gray-200",
                        label: "Non évalué",
                        bg: "bg-gray-50",
                      };
                    if (score >= 80)
                      return {
                        text: "text-green-600",
                        border: "border-green-200",
                        label: "Excellent",
                        bg: "bg-green-50",
                      };
                    if (score >= 50)
                      return {
                        text: "text-primary-600",
                        border: "border-primary-200",
                        label: "Satisfaisant",
                        bg: "bg-primary-50",
                      };
                    if (score >= 30)
                      return {
                        text: "text-yellow-600",
                        border: "border-yellow-200",
                        label: "À surveiller",
                        bg: "bg-yellow-50",
                      };
                    return {
                      text: "text-red-500",
                      border: "border-red-200",
                      label: "Problématique",
                      bg: "bg-red-50",
                    };
                  };
                  const sc = getScoreColor(item.reliability_score?.score);
                  return (
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-gray-100/80">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-1 h-4 bg-primary-500 rounded-full inline-block"></span>
                        <h4 className="text-sm font-bold text-gray-900">
                          Score de Fiabilité
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
                                label: "Réserv.",
                                value:
                                  item.reliability_score.total_reservations ||
                                  0,
                                color: "text-gray-700",
                              },
                              {
                                label: "Terminées",
                                value:
                                  item.reliability_score
                                    .completed_reservations || 0,
                                color: "text-green-600",
                              },
                              {
                                label: "Annulées",
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
                            Notes administratives
                          </p>
                          <p className="text-sm text-gray-700">
                            {item.reliability_score.admin_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}

              {/* User Written Reviews */}
              {userReviews.length > 0 && (
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-gray-100/80">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-1 h-4 bg-primary-500 rounded-full inline-block"></span>
                    <h4 className="text-sm font-bold text-gray-900">
                      Avis rédigés
                    </h4>
                    <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-600 border border-primary-100">
                      {userReviews.length}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {(showAllUserReviews
                      ? userReviews
                      : userReviews.slice(0, 3)
                    ).map((review) => (
                      <div
                        key={review.id}
                        className="p-3 bg-white/80 rounded-xl border border-gray-100"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900">
                            {review.agency_name || "Agence"}
                          </p>
                          <span className="text-xs text-gray-400">
                            {new Date(review.created_at).toLocaleDateString(
                              "fr-FR",
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 mb-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-3 h-3 ${star <= review.rating ? "text-yellow-400" : "text-gray-200"}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-xs text-gray-600">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                    {userReviews.length > 3 && (
                      <button
                        onClick={() =>
                          setShowAllUserReviews(!showAllUserReviews)
                        }
                        className="w-full text-xs text-primary-600 hover:text-primary-700 font-medium py-2 hover:bg-primary-50/60 rounded-lg transition-colors"
                      >
                        {showAllUserReviews
                          ? "Voir moins"
                          : `Voir tous (${userReviews.length})`}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Reports Against User */}
              {reports.length > 0 && (
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-gray-100/80">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-1 h-4 bg-red-400 rounded-full inline-block"></span>
                    <h4 className="text-sm font-bold text-gray-900">
                      Signalements reçus
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
                              {report.reporter_name || "Agence"}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              {report.reason ||
                                report.description ||
                                "Non spécifié"}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-xs text-gray-400">
                              {new Date(report.created_at).toLocaleDateString(
                                "fr-FR",
                              )}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${report.status === "pending" ? "bg-yellow-50 text-yellow-600" : report.status === "resolved" ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-500"}`}
                            >
                              {report.status === "pending"
                                ? "En attente"
                                : report.status === "resolved"
                                  ? "Résolu"
                                  : "Rejeté"}
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
                          ? "Voir moins"
                          : `Voir tous (${reports.length})`}
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
                      Signalements soumis
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
                              {report.target_name || "Cible"}
                            </p>
                            <span className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-500 shrink-0">
                              {report.report_type === "vehicle"
                                ? "Véhicule"
                                : report.report_type === "agency"
                                  ? "Agence"
                                  : "Utilisateur"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {report.reason ||
                              report.description ||
                              "Non spécifié"}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-xs text-gray-400">
                            {new Date(report.created_at).toLocaleDateString(
                              "fr-FR",
                            )}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${report.status === "pending" ? "bg-yellow-50 text-yellow-600" : report.status === "resolved" ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-500"}`}
                          >
                            {report.status === "pending"
                              ? "En attente"
                              : report.status === "resolved"
                                ? "Résolu"
                                : "Rejeté"}
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
                          ? "Voir moins"
                          : `Voir tous (${userReportsSubmitted.length})`}
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
                      Historique des Réservations
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
                                "Véhicule"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {reservation.vehicle?.agency?.name ||
                                reservation.agency_name ||
                                "Agence"}
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
                        ? "Voir moins"
                        : `Voir toutes (${userReservations.length} réservations)`}
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
                Modifier
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
                {item.is_suspended ? "Réactiver" : "Suspendre"}
              </button>
            )}
            {type === "agency" && onDelete && (
              <button
                onClick={() => {
                  if (
                    confirm("Êtes-vous sûr de vouloir supprimer cette agence ?")
                  ) {
                    onClose();
                    onDelete(item.id);
                  }
                }}
                className="flex-1 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Supprimer
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100/80 hover:bg-gray-200/80 transition-colors"
            >
              Fermer
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
