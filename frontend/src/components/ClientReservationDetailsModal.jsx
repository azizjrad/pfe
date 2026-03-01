import React from "react";

export default function ClientReservationDetailsModal({
  reservation,
  onClose,
}) {
  if (!reservation) return null;

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
        className={`px-3 py-1 rounded-full text-sm font-medium ${config.class}`}
      >
        {config.label}
      </span>
    );
  };

  const pricingBreakdown = reservation.pricing_details || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">
                Détails de la Réservation
              </h3>
              <p className="text-primary-100 text-sm">ID: #{reservation.id}</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
            >
              <svg
                className="w-6 h-6 text-white"
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
          {/* Status Section */}
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900">
              Statut de la réservation
            </h4>
            {getStatusBadge(reservation.status)}
          </div>

          {/* Vehicle Info */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
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
                  d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                />
              </svg>
              Informations du Véhicule
            </h4>
            <div className="space-y-2">
              <p className="text-xl font-bold text-gray-900">
                {reservation.vehicle?.name || "N/A"}
              </p>
              <p className="text-sm text-gray-600">
                Catégorie: {reservation.vehicle?.category?.name || "N/A"}
              </p>
              <p className="text-sm text-gray-600">
                Plaque: {reservation.vehicle?.license_plate || "N/A"}
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/80">
              <p className="text-sm text-gray-600 mb-1">Date de début</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(reservation.start_date).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/80">
              <p className="text-sm text-gray-600 mb-1">Date de fin</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(reservation.end_date).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Location Info */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Lieux de Retrait et Retour
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Lieu de retrait</p>
                <p className="text-base font-medium text-gray-900">
                  {reservation.pickup_location || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Lieu de retour</p>
                <p className="text-base font-medium text-gray-900">
                  {reservation.dropoff_location ||
                    reservation.pickup_location ||
                    "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Agency Info */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              Informations de l'Agence
            </h4>
            <div className="space-y-2">
              <p className="text-lg font-bold text-gray-900">
                {reservation.vehicle?.agency?.name || "N/A"}
              </p>
              <p className="text-sm text-gray-600">
                Téléphone: {reservation.vehicle?.agency?.phone || "N/A"}
              </p>
              <p className="text-sm text-gray-600">
                Email: {reservation.vehicle?.agency?.email || "N/A"}
              </p>
              <p className="text-sm text-gray-600">
                Adresse: {reservation.vehicle?.agency?.address || "N/A"}
              </p>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6 border border-primary-200 shadow-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
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
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Détails de la Tarification
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Prix de base</span>
                <span className="font-semibold text-gray-900">
                  {reservation.base_price} DT
                </span>
              </div>
              {pricingBreakdown.appliedRules &&
                pricingBreakdown.appliedRules.length > 0 && (
                  <div className="border-t border-primary-200 pt-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Règles appliquées:
                    </p>
                    {pricingBreakdown.appliedRules.map((rule, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm mb-1"
                      >
                        <span className="text-gray-600">{rule.name}</span>
                        <span
                          className={`font-medium ${rule.impact > 0 ? "text-red-600" : "text-green-600"}`}
                        >
                          {rule.impact > 0 ? "+" : ""}
                          {rule.impact}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              {reservation.discount_amount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span>Réduction</span>
                  <span className="font-semibold">
                    -{reservation.discount_amount} DT
                  </span>
                </div>
              )}
              {reservation.additional_charges > 0 && (
                <div className="flex justify-between items-center text-red-600">
                  <span>Frais supplémentaires</span>
                  <span className="font-semibold">
                    +{reservation.additional_charges} DT
                  </span>
                </div>
              )}
              <div className="border-t-2 border-primary-300 pt-3 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">
                  Total à payer
                </span>
                <span className="text-2xl font-bold text-primary-600">
                  {reservation.total_price} DT
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Montant payé</span>
                <span className="font-semibold text-gray-900">
                  {reservation.paid_amount} DT
                </span>
              </div>
              {reservation.remaining_amount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Montant restant</span>
                  <span className="font-semibold text-red-600">
                    {reservation.remaining_amount} DT
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {reservation.notes && (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/80">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Notes
              </h4>
              <p className="text-gray-700">{reservation.notes}</p>
            </div>
          )}

          {/* Cancellation Reason */}
          {reservation.status === "cancelled" &&
            reservation.cancellation_reason && (
              <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                <h4 className="text-lg font-semibold text-red-900 mb-2">
                  Raison de l'annulation
                </h4>
                <p className="text-red-700">
                  {reservation.cancellation_reason}
                </p>
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm p-6 border-t border-white/60 rounded-b-3xl">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Fermer
          </button>
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
