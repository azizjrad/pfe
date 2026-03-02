import React, { useState } from "react";

export default function DetailsModal({
  isOpen,
  onClose,
  type, // 'agency' or 'user'
  item,
  reviews = [], // For agencies
  reservations = [], // For users
  onEdit,
  onDelete,
  onSuspend, // For users
}) {
  const [showAllReservations, setShowAllReservations] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 p-6 rounded-t-3xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
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
                <h3 className="text-2xl font-bold text-white">
                  {type === "agency"
                    ? "Détails de l'Agence"
                    : "Détails de l'Utilisateur"}
                </h3>
                <p className="text-primary-100 text-sm">
                  {type === "agency" ? item.location : item.email}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
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
        <div className="p-6 space-y-6">
          {type === "agency" ? (
            <>
              {/* Agency Basic Info */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-lg">
                <h4 className="text-xl font-bold text-gray-900 mb-4">
                  {item.name}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Adresse</p>
                    <p className="font-semibold text-gray-900">
                      {item.address || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Téléphone</p>
                    <p className="font-semibold text-gray-900">
                      {item.phone || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">
                      {item.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Localisation</p>
                    <p className="font-semibold text-gray-900">
                      {item.location || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Véhicules</p>
                    <p className="font-semibold text-gray-900">
                      {item.vehicles || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Revenu Total</p>
                    <p className="font-semibold text-primary-600">
                      {item.revenue?.toLocaleString() || 0} DT
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Statut</p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                    >
                      {item.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">
                        Avis des clients
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        {reviews.length > 0 ? (
                          <>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= Math.round(averageRating)
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-sm font-semibold text-gray-700">
                              {averageRating.toFixed(1)}
                            </span>
                            <span className="text-sm text-gray-500">
                              ({reviews.length})
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">
                            Aucun avis
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {reviews.length > 0 ? (
                    <>
                      {displayedReviews.map((review) => (
                        <div
                          key={review.id}
                          className="p-4 bg-white rounded-lg border border-gray-200"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {review.user_name || "Client"}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= review.rating
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(review.created_at).toLocaleDateString(
                                "fr-FR",
                              )}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {review.comment}
                          </p>
                        </div>
                      ))}
                      {reviews.length > 5 && (
                        <button
                          onClick={() => setShowAllReviews(!showAllReviews)}
                          className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium py-2"
                        >
                          {showAllReviews
                            ? "Voir moins"
                            : `Voir tous les avis (${reviews.length})`}
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8">
                      Aucun avis pour le moment
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* User Basic Info */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">
                      {item.name}
                    </h4>
                    <p className="text-gray-600">{item.email}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadge(item.role)}`}
                  >
                    {item.role === "client"
                      ? "Client"
                      : item.role === "agency_admin"
                        ? "Admin Agence"
                        : "Super Admin"}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Téléphone</p>
                    {item.phone ? (
                      <a
                        href={`tel:${item.phone}`}
                        className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        {item.phone}
                      </a>
                    ) : (
                      <p className="font-semibold text-gray-900">N/A</p>
                    )}
                  </div>
                  {item.agency && (
                    <div>
                      <p className="text-sm text-gray-600">Agence</p>
                      <p className="font-semibold text-gray-900">
                        {item.agency}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Inscrit le</p>
                    <p className="font-semibold text-gray-900">
                      {item.registeredAt ||
                        (item.created_at
                          ? new Date(item.created_at).toLocaleDateString(
                              "fr-FR",
                            )
                          : "N/A")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Statut du compte</p>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        item.is_suspended
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {item.is_suspended ? "Suspendu" : "Actif"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reliability Score Section (Only for Clients) */}
              {item.role === "client" &&
                (() => {
                  const getScoreColor = (score) => {
                    if (!score && score !== 0)
                      return {
                        bg: "bg-gray-100",
                        text: "text-gray-700",
                        border: "border-gray-300",
                        label: "Non évalué",
                        ring: "ring-gray-200",
                      };

                    if (score >= 80) {
                      return {
                        bg: "bg-green-100",
                        text: "text-green-700",
                        border: "border-green-300",
                        label: "Excellent",
                        ring: "ring-green-200",
                      };
                    } else if (score >= 50) {
                      return {
                        bg: "bg-lime-100",
                        text: "text-lime-700",
                        border: "border-lime-300",
                        label: "Satisfaisant",
                        ring: "ring-lime-200",
                      };
                    } else if (score >= 30) {
                      return {
                        bg: "bg-yellow-100",
                        text: "text-yellow-700",
                        border: "border-yellow-300",
                        label: "À surveiller",
                        ring: "ring-yellow-200",
                      };
                    } else {
                      return {
                        bg: "bg-red-100",
                        text: "text-red-700",
                        border: "border-red-300",
                        label: "Problématique",
                        ring: "ring-red-200",
                      };
                    }
                  };

                  const scoreColors = getScoreColor(
                    item.reliability_score?.score,
                  );

                  return (
                    <div
                      className={`${scoreColors.bg} ${scoreColors.border} border-2 rounded-2xl p-6`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <svg
                            className="w-6 h-6 text-gray-700"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Score de Fiabilité
                        </h3>
                        <span
                          className={`px-4 py-2 ${scoreColors.bg} ${scoreColors.text} border-2 ${scoreColors.border} rounded-full text-sm font-bold`}
                        >
                          {scoreColors.label}
                        </span>
                      </div>

                      {/* Score Display */}
                      <div className="flex items-center justify-center mb-6">
                        <div
                          className={`relative w-32 h-32 rounded-full border-8 ${scoreColors.border} bg-white flex items-center justify-center shadow-lg`}
                        >
                          <div className="text-center">
                            <div
                              className={`text-4xl font-bold ${scoreColors.text}`}
                            >
                              {item.reliability_score?.score ?? "N/A"}
                            </div>
                            {item.reliability_score?.score !== undefined && (
                              <div className="text-sm text-gray-600">/100</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Score Details */}
                      {item.reliability_score && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="bg-white/70 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-gray-900">
                              {item.reliability_score.total_reservations || 0}
                            </div>
                            <div className="text-xs text-gray-600">
                              Réservations
                            </div>
                          </div>
                          <div className="bg-white/70 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {item.reliability_score.completed_reservations ||
                                0}
                            </div>
                            <div className="text-xs text-gray-600">
                              Complétées
                            </div>
                          </div>
                          <div className="bg-white/70 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-red-600">
                              {item.reliability_score.cancelled_reservations ||
                                0}
                            </div>
                            <div className="text-xs text-gray-600">
                              Annulées
                            </div>
                          </div>
                          <div className="bg-white/70 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {item.reliability_score.late_returns || 0}
                            </div>
                            <div className="text-xs text-gray-600">Retards</div>
                          </div>
                          <div className="bg-white/70 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-yellow-600">
                              {item.reliability_score.payment_delays || 0}
                            </div>
                            <div className="text-xs text-gray-600">
                              Paiements retardés
                            </div>
                          </div>
                          <div className="bg-white/70 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-red-700">
                              {item.reliability_score.damage_incidents || 0}
                            </div>
                            <div className="text-xs text-gray-600">
                              Dommages
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Admin Notes */}
                      {item.reliability_score?.admin_notes && (
                        <div className="mt-4 bg-white/70 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Notes administratives
                          </h4>
                          <p className="text-sm text-gray-600">
                            {item.reliability_score.admin_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}

              {/* User Reservations */}
              {userReservations.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <svg
                        className="w-6 h-6 text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      Historique des Réservations
                    </h3>
                    <span className="text-sm font-semibold text-gray-600">
                      {userReservations.length} réservation
                      {userReservations.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {displayedReservations.map((reservation, index) => (
                      <div
                        key={reservation.id || index}
                        className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {reservation.vehicle?.name ||
                                reservation.vehicle_name ||
                                "Véhicule"}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {reservation.vehicle?.agency?.name ||
                                reservation.agency_name ||
                                "Agence"}
                            </p>
                          </div>
                          {getStatusBadge(reservation.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
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
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span>
                              {new Date(
                                reservation.start_date,
                              ).toLocaleDateString("fr-FR")}{" "}
                              -{" "}
                              {new Date(
                                reservation.end_date,
                              ).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 font-semibold text-primary-600">
                            <span>{reservation.total_price || 0} DT</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {userReservations.length > 3 && (
                    <button
                      onClick={() =>
                        setShowAllReservations(!showAllReservations)
                      }
                      className="mt-4 w-full px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {showAllReservations ? (
                        <>
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
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                          Voir moins
                        </>
                      ) : (
                        <>
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
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                          Voir toutes ({userReservations.length} réservations)
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm p-6 border-t border-white/60 rounded-b-3xl">
          <div className="flex gap-3">
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(item);
                }}
                className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl"
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
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
                  item.is_suspended
                    ? "text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    : "text-white bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
                }`}
              >
                {item.is_suspended ? "Réactiver" : "Suspendre"}
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  if (
                    confirm(
                      `Êtes-vous sûr de vouloir supprimer ${type === "agency" ? "cette agence" : "cet utilisateur"} ?`,
                    )
                  ) {
                    onClose();
                    onDelete(item.id);
                  }
                }}
                className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Supprimer
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-semibold text-gray-700 bg-white/60 hover:bg-white/80 border border-gray-200 transition-all duration-200 shadow-sm hover:shadow"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
