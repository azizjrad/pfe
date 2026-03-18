import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { reservationService } from "../../services/reservationService";
import ReservationDetailsModal from "../modals/ReservationDetailsModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import Toast from "../common/Toast";
import VehicleCard from "../cards/VehicleCard";

// Client Content Component
const ClientContent = ({ activeTab, navigate }) => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    reservationId: null,
  });
  const [detailsModal, setDetailsModal] = useState({
    isOpen: false,
    reservation: null,
  });
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast({ isVisible: false, message: "", type: "success" });
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await reservationService.getMy();
      setReservations(response.data.data || []);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      showToast("Erreur lors du chargement des réservations", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (id) => {
    try {
      const response = await reservationService.cancel(id);
      if (response.data.success) {
        showToast(response.data.message, "success");
        fetchReservations(); // Refresh list
        setCancelModal({ isOpen: false, reservationId: null });
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Erreur lors de l'annulation",
        "error",
      );
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: "bg-green-100 text-green-600",
      pending: "bg-yellow-100 text-yellow-600",
      completed: "bg-gray-100 text-gray-600",
      cancelled: "bg-red-100 text-red-600",
    };
    return colors[status] || "bg-gray-100 text-gray-600";
  };

  const getStatusText = (status) => {
    const texts = {
      confirmed: "Confirmée",
      pending: "En attente",
      completed: "Terminée",
      cancelled: "Annulée",
    };
    return texts[status] || status;
  };

  if (activeTab === "overview") {
    return (
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Mes Réservations</h2>
          <button
            onClick={() => navigate("/vehicles")}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Nouvelle réservation
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <p className="text-gray-500">Aucune réservation pour le moment</p>
            <button
              onClick={() => navigate("/vehicles")}
              className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Parcourir les véhicules
            </button>
          </div>
        ) : (
          <div className="grid gap-5">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {reservation.vehicle?.name || "Véhicule"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {reservation.vehicle?.agency?.name || "Agence"}
                    </p>
                    <div className="flex gap-4 mt-3 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Début:</span>{" "}
                        {new Date(reservation.start_date).toLocaleDateString(
                          "fr-FR",
                        )}
                      </div>
                      <div>
                        <span className="font-medium">Fin:</span>{" "}
                        {new Date(reservation.end_date).toLocaleDateString(
                          "fr-FR",
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}
                    >
                      {getStatusText(reservation.status)}
                    </span>
                    <p className="text-lg font-bold text-primary-600 mt-3">
                      {reservation.total_price} DT
                    </p>
                    <div className="flex flex-col gap-2 mt-3">
                      <button
                        onClick={() =>
                          setDetailsModal({
                            isOpen: true,
                            reservation: reservation,
                          })
                        }
                        className="px-4 py-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors text-sm font-medium"
                      >
                        Voir détails
                      </button>
                      {reservation.status === "pending" && (
                        <button
                          onClick={() =>
                            setCancelModal({
                              isOpen: true,
                              reservationId: reservation.id,
                            })
                          }
                          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm"
                        >
                          Annuler
                        </button>
                      )}
                      {reservation.status === "confirmed" && (
                        <p className="text-xs text-gray-500">
                          Contactez l'agence pour annuler
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reservation Details Modal */}
        {detailsModal.isOpen && detailsModal.reservation && (
          <ReservationDetailsModal
            reservation={detailsModal.reservation}
            onClose={() =>
              setDetailsModal({ isOpen: false, reservation: null })
            }
            userRole="client"
            onCancel={handleCancelReservation}
          />
        )}

        {/* Cancel Confirmation Modal */}
        <ConfirmationModal
          isOpen={cancelModal.isOpen}
          onClose={() => setCancelModal({ isOpen: false, reservationId: null })}
          onConfirm={() => handleCancelReservation(cancelModal.reservationId)}
          title="Annuler la réservation"
          message="Êtes-vous sûr de vouloir annuler cette réservation ?"
          confirmText="Annuler la réservation"
          cancelText="Retour"
          danger={true}
        />

        {/* Toast Notification */}
        <Toast
          isVisible={toast.isVisible}
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      </div>
    );
  }

  if (activeTab === "saved") {
    const [savedVehicles, setSavedVehicles] = useState([]);
    const [refreshSaved, setRefreshSaved] = useState(0);

    useEffect(() => {
      if (user) {
        const saved = JSON.parse(
          localStorage.getItem(`savedVehicles_${user.id}`) || "[]",
        );
        setSavedVehicles(saved);
      }
    }, [user, refreshSaved]);

    const handleRemoveSaved = (vehicleId) => {
      const saved = JSON.parse(
        localStorage.getItem(`savedVehicles_${user.id}`) || "[]",
      );
      const updated = saved.filter((v) => v.id !== vehicleId);
      localStorage.setItem(`savedVehicles_${user.id}`, JSON.stringify(updated));
      setRefreshSaved((prev) => prev + 1);
    };

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Véhicules Sauvegardés
          </h2>
          <span className="text-sm text-gray-500">
            {savedVehicles.length} véhicule{savedVehicles.length > 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : savedVehicles.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            <p className="text-gray-500 mb-2">Aucun véhicule sauvegardé</p>
            <p className="text-sm text-gray-400 mb-6">
              Parcourez nos véhicules et cliquez sur l'icône de sauvegarde pour
              les retrouver ici
            </p>
            <button
              onClick={() => (window.location.href = "/vehicles")}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              Découvrir les véhicules
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedVehicles.map((vehicle, index) => (
              <div key={vehicle.id} className="relative">
                <VehicleCard
                  vehicle={vehicle}
                  index={index}
                  isVisible={true}
                  onSaveToggle={() => handleRemoveSaved(vehicle.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (activeTab === "history") {
    return (
      <div className="space-y-5">
        <h2 className="text-xl font-bold text-gray-900">
          Historique des Réservations
        </h2>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <p className="text-gray-500">Aucune réservation</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white rounded-xl p-6 border border-gray-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {reservation.vehicle?.name || "Véhicule"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {reservation.vehicle?.agency?.name || "Agence"}
                    </p>
                    <div className="flex gap-4 mt-3 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Début:</span>{" "}
                        {new Date(reservation.start_date).toLocaleDateString(
                          "fr-FR",
                        )}
                      </div>
                      <div>
                        <span className="font-medium">Fin:</span>{" "}
                        {new Date(reservation.end_date).toLocaleDateString(
                          "fr-FR",
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}
                    >
                      {getStatusText(reservation.status)}
                    </span>
                    <p className="text-lg font-bold text-primary-600 mt-3">
                      {reservation.total_price} DT
                    </p>
                    <button
                      onClick={() =>
                        setDetailsModal({
                          isOpen: true,
                          reservation: reservation,
                        })
                      }
                      className="mt-3 px-4 py-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors text-sm font-medium"
                    >
                      Voir détails
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reservation Details Modal */}
        {detailsModal.isOpen && detailsModal.reservation && (
          <ReservationDetailsModal
            reservation={detailsModal.reservation}
            onClose={() =>
              setDetailsModal({ isOpen: false, reservation: null })
            }
            userRole="client"
            onCancel={handleCancelReservation}
          />
        )}
      </div>
    );
  }

  return null;
};

export default ClientContent;
