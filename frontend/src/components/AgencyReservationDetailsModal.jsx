import React, { useState } from "react";

export default function AgencyReservationDetailsModal({
  reservation,
  onClose,
  onStatusUpdate,
  onPickup,
  onReturn,
  onCancel,
}) {
  const [activeAction, setActiveAction] = useState(null);
  const [returnData, setReturnData] = useState({
    actual_return_date: new Date().toISOString().split("T")[0],
    additional_charges: 0,
    notes: "",
  });
  const [pickupNotes, setPickupNotes] = useState("");
  const [cancelReason, setCancelReason] = useState("");

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

  const handleConfirmPickup = () => {
    onPickup(reservation.id, pickupNotes);
    setActiveAction(null);
  };

  const handleConfirmReturn = () => {
    onReturn(reservation.id, returnData);
    setActiveAction(null);
  };

  const handleConfirmCancel = () => {
    onCancel(reservation.id, cancelReason);
    setActiveAction(null);
  };

  const pricingBreakdown = reservation.pricing_details || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 p-6 rounded-t-3xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">
                Gestion de la Réservation
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
          {/* Status and Actions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">
                Statut et Actions
              </h4>
              {getStatusBadge(reservation.status)}
            </div>

            {/* Action Buttons */}
            {!["completed", "cancelled"].includes(reservation.status) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {reservation.status === "pending" && (
                  <button
                    onClick={() => onStatusUpdate(reservation.id, "confirmed")}
                    className="px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
                  >
                    Confirmer
                  </button>
                )}
                {reservation.status === "confirmed" && (
                  <button
                    onClick={() => setActiveAction("pickup")}
                    className="px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg"
                  >
                    Retrait
                  </button>
                )}
                {reservation.status === "ongoing" && (
                  <button
                    onClick={() => setActiveAction("return")}
                    className="px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg"
                  >
                    Retour
                  </button>
                )}
                <button
                  onClick={() => setActiveAction("cancel")}
                  className="px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg"
                >
                  Annuler
                </button>
              </div>
            )}

            {/* Pickup Form */}
            {activeAction === "pickup" && (
              <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                <h5 className="font-semibold text-gray-900 mb-3">
                  Confirmer le retrait du véhicule
                </h5>
                <textarea
                  value={pickupNotes}
                  onChange={(e) => setPickupNotes(e.target.value)}
                  placeholder="Notes (état du véhicule, kilométrage, etc.)"
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                  rows="3"
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleConfirmPickup}
                    className="px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transition-all"
                  >
                    Confirmer le retrait
                  </button>
                  <button
                    onClick={() => setActiveAction(null)}
                    className="px-4 py-2 rounded-xl font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 transition-all"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Return Form */}
            {activeAction === "return" && (
              <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                <h5 className="font-semibold text-gray-900 mb-3">
                  Confirmer le retour du véhicule
                </h5>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de retour réelle
                    </label>
                    <input
                      type="date"
                      value={returnData.actual_return_date}
                      onChange={(e) =>
                        setReturnData({
                          ...returnData,
                          actual_return_date: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frais supplémentaires (DT)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={returnData.additional_charges}
                      onChange={(e) =>
                        setReturnData({
                          ...returnData,
                          additional_charges: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0.00"
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (état du véhicule, dommages, etc.)
                    </label>
                    <textarea
                      value={returnData.notes}
                      onChange={(e) =>
                        setReturnData({ ...returnData, notes: e.target.value })
                      }
                      placeholder="Notes sur le retour du véhicule..."
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                      rows="3"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleConfirmReturn}
                    className="px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all"
                  >
                    Confirmer le retour
                  </button>
                  <button
                    onClick={() => setActiveAction(null)}
                    className="px-4 py-2 rounded-xl font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 transition-all"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Cancel Form */}
            {activeAction === "cancel" && (
              <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
                <h5 className="font-semibold text-gray-900 mb-3">
                  Annuler la réservation
                </h5>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Raison de l'annulation..."
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                  rows="3"
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleConfirmCancel}
                    className="px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all"
                  >
                    Confirmer l'annulation
                  </button>
                  <button
                    onClick={() => setActiveAction(null)}
                    className="px-4 py-2 rounded-xl font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 transition-all"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Client Info */}
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Informations du Client
            </h4>
            <div className="space-y-2">
              <p className="text-lg font-bold text-gray-900">
                {reservation.user?.name || "N/A"}
              </p>
              <p className="text-sm text-gray-600">
                Email: {reservation.user?.email || "N/A"}
              </p>
              <p className="text-sm text-gray-600">
                Téléphone: {reservation.user?.phone || "N/A"}
              </p>
              {reservation.user?.client_score && (
                <p className="text-sm text-gray-600">
                  Score de fiabilité:{" "}
                  <span className="font-semibold">
                    {reservation.user.client_score.total_score || 100}
                  </span>
                </p>
              )}
            </div>
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
              <p className="text-sm text-gray-600">
                Prix journalier: {reservation.vehicle?.daily_rate || "N/A"} DT
              </p>
            </div>
          </div>

          {/* Dates and Location */}
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
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/80">
              <p className="text-sm text-gray-600 mb-1">Lieu de retrait</p>
              <p className="text-base font-medium text-gray-900">
                {reservation.pickup_location || "N/A"}
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/80">
              <p className="text-sm text-gray-600 mb-1">Lieu de retour</p>
              <p className="text-base font-medium text-gray-900">
                {reservation.dropoff_location ||
                  reservation.pickup_location ||
                  "N/A"}
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
              Détails Financiers
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Prix de base</span>
                <span className="font-semibold text-gray-900">
                  {reservation.base_price} DT
                </span>
              </div>
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
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-primary-600">
                  {reservation.total_price} DT
                </span>
              </div>
              <div className="border-t border-primary-200 pt-3 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    Commission plateforme (
                    {(reservation.platform_commission_rate * 100).toFixed(1)}%)
                  </span>
                  <span className="font-semibold text-gray-900">
                    {reservation.platform_commission} DT
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">
                    Revenu de l'agence
                  </span>
                  <span className="text-xl font-bold text-green-600">
                    {reservation.agency_payout} DT
                  </span>
                </div>
              </div>
              <div className="border-t border-primary-200 pt-3 space-y-2">
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
          </div>

          {/* Return Information */}
          {reservation.status === "completed" &&
            reservation.actual_return_date && (
              <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                <h4 className="text-lg font-semibold text-green-900 mb-3">
                  Informations de retour
                </h4>
                <div className="space-y-2">
                  <p className="text-sm text-green-700">
                    Date de retour:{" "}
                    {new Date(
                      reservation.actual_return_date,
                    ).toLocaleDateString("fr-FR")}
                  </p>
                  {reservation.is_late_return && (
                    <p className="text-sm text-red-600 font-semibold">
                      ⚠️ Retour en retard
                    </p>
                  )}
                </div>
              </div>
            )}

          {/* Notes */}
          {reservation.notes && (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/80">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Notes
              </h4>
              <p className="text-gray-700 whitespace-pre-wrap">
                {reservation.notes}
              </p>
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
