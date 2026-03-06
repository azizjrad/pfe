import React, { useState } from "react";

export default function ReservationDetailsModal({
  reservation,
  onClose,
  userRole, // "client" or "agency_admin"
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
    onPickup && onPickup(reservation.id, pickupNotes);
    setActiveAction(null);
  };

  const handleConfirmReturn = () => {
    onReturn && onReturn(reservation.id, returnData);
    setActiveAction(null);
  };

  const handleConfirmCancel = () => {
    onCancel && onCancel(reservation.id, cancelReason);
    setActiveAction(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 p-6 rounded-t-3xl z-10">
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
          {/* Status and Actions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">
                Statut et Actions
              </h4>
              {getStatusBadge(reservation.status)}
            </div>

            {/* Actions for Agency Admin */}
            {userRole === "agency_admin" && (
              <div className="space-y-3">
                {reservation.status === "pending" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        onStatusUpdate &&
                        onStatusUpdate(reservation.id, "confirmed")
                      }
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Confirmer
                    </button>
                    <button
                      onClick={() => setActiveAction("cancel")}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Annuler
                    </button>
                  </div>
                )}

                {reservation.status === "confirmed" && (
                  <button
                    onClick={() => setActiveAction("pickup")}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    Marquer comme récupéré
                  </button>
                )}

                {reservation.status === "ongoing" && (
                  <button
                    onClick={() => setActiveAction("return")}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Enregistrer le retour
                  </button>
                )}

                {/* Action Forms */}
                {activeAction === "pickup" && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h5 className="font-semibold text-purple-900 mb-3">
                      Confirmer la récupération
                    </h5>
                    <textarea
                      value={pickupNotes}
                      onChange={(e) => setPickupNotes(e.target.value)}
                      placeholder="Notes sur l'état du véhicule (optionnel)"
                      className="w-full px-3 py-2 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleConfirmPickup}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => setActiveAction(null)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}

                {activeAction === "return" && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h5 className="font-semibold text-blue-900 mb-3">
                      Enregistrer le retour
                    </h5>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-blue-900 mb-1">
                          Date de retour
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
                          className="w-full px-3 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-900 mb-1">
                          Frais supplémentaires (DT)
                        </label>
                        <input
                          type="number"
                          value={returnData.additional_charges}
                          onChange={(e) =>
                            setReturnData({
                              ...returnData,
                              additional_charges:
                                parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-900 mb-1">
                          Notes
                        </label>
                        <textarea
                          value={returnData.notes}
                          onChange={(e) =>
                            setReturnData({
                              ...returnData,
                              notes: e.target.value,
                            })
                          }
                          placeholder="Commentaires sur le retour"
                          className="w-full px-3 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={handleConfirmReturn}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => setActiveAction(null)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}

                {activeAction === "cancel" && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    <h5 className="font-semibold text-red-900 mb-3">
                      Annuler la réservation
                    </h5>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Raison de l'annulation"
                      className="w-full px-3 py-2 rounded-lg border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 mb-3"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleConfirmCancel}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => setActiveAction(null)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions for Client */}
            {userRole === "client" && reservation.status === "pending" && (
              <button
                onClick={() => setActiveAction("cancel")}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Annuler la réservation
              </button>
            )}

            {userRole === "client" && activeAction === "cancel" && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <h5 className="font-semibold text-red-900 mb-3">
                  Annuler la réservation
                </h5>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Raison de l'annulation (optionnel)"
                  className="w-full px-3 py-2 rounded-lg border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 mb-3"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleConfirmCancel}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Confirmer
                  </button>
                  <button
                    onClick={() => setActiveAction(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Vehicle Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary-600"
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
              Informations du Véhicule
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Marque et Modèle</p>
                <p className="font-semibold text-gray-900">
                  {reservation.vehicle_name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Catégorie</p>
                <p className="font-semibold text-gray-900">
                  {reservation.vehicle_category || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Immatriculation</p>
                <p className="font-semibold text-gray-900">
                  {reservation.vehicle_plate || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Client/Agency Information (depending on userRole) */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {userRole === "client" ? (
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
              {userRole === "client"
                ? "Informations de l'Agence"
                : "Informations du Client"}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userRole === "client" ? (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Nom de l'agence</p>
                    <p className="font-semibold text-gray-900">
                      {reservation.agency_name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Téléphone</p>
                    <p className="font-semibold text-gray-900">
                      {reservation.agency_phone || "N/A"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Adresse</p>
                    <p className="font-semibold text-gray-900">
                      {reservation.agency_address || "N/A"}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Nom du client</p>
                    <p className="font-semibold text-gray-900">
                      {reservation.client_name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">
                      {reservation.client_email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Téléphone</p>
                    <p className="font-semibold text-gray-900">
                      {reservation.client_phone || "N/A"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Reservation Details */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary-600"
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
              Détails de la Réservation
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Date de début</p>
                <p className="font-semibold text-gray-900">
                  {new Date(reservation.start_date).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date de fin</p>
                <p className="font-semibold text-gray-900">
                  {new Date(reservation.end_date).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Durée</p>
                <p className="font-semibold text-gray-900">
                  {Math.ceil(
                    (new Date(reservation.end_date) -
                      new Date(reservation.start_date)) /
                      (1000 * 60 * 60 * 24),
                  )}{" "}
                  jour(s)
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Réservé le</p>
                <p className="font-semibold text-gray-900">
                  {new Date(
                    reservation.created_at || reservation.booked_at,
                  ).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Details */}
          <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-6 border border-primary-200 shadow-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
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
            </div>
          </div>

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
