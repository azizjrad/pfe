import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { reservationService } from "../../services/reservationService";
import ReservationDetailsModal from "../modals/ReservationDetailsModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import Toast from "../common/Toast";
import VehicleCard from "../cards/VehicleCard";

// Client Content Component
const ClientContent = ({
  activeTab,
  navigate,
  notifications = [],
  onChangeTab,
  onMarkAllNotificationsRead,
}) => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [savedVehicles, setSavedVehicles] = useState([]);
  const [refreshSaved, setRefreshSaved] = useState(0);
  const [historySearch, setHistorySearch] = useState("");
  const [historyStatus, setHistoryStatus] = useState("all");
  const [historyPage, setHistoryPage] = useState(1);
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

  const HISTORY_ITEMS_PER_PAGE = 5;

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    if (!user || activeTab !== "saved") return;

    const saved = JSON.parse(
      localStorage.getItem(`savedVehicles_${user.id}`) || "[]",
    );
    setSavedVehicles(saved);
  }, [user, refreshSaved, activeTab]);

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

  const handleRemoveSaved = (vehicleId) => {
    if (!user) return;

    const saved = JSON.parse(
      localStorage.getItem(`savedVehicles_${user.id}`) || "[]",
    );
    const updated = saved.filter((v) => v.id !== vehicleId);
    localStorage.setItem(`savedVehicles_${user.id}`, JSON.stringify(updated));
    setRefreshSaved((prev) => prev + 1);
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

  const getTimeAgo = (date) => {
    if (!date) return "";

    const now = new Date();
    const notifDate = new Date(date);
    const diffInMinutes = Math.floor((now - notifDate) / (1000 * 60));

    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440)
      return `Il y a ${Math.floor(diffInMinutes / 60)} h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)} j`;
  };

  const filteredHistory = reservations.filter((reservation) => {
    const matchesStatus =
      historyStatus === "all" || reservation.status === historyStatus;
    const vehicleName = reservation.vehicle?.name || "";
    const agencyName = reservation.vehicle?.agency?.name || "";
    const query = historySearch.trim().toLowerCase();
    const matchesSearch =
      query.length === 0 ||
      vehicleName.toLowerCase().includes(query) ||
      agencyName.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  const totalHistoryPages = Math.max(
    1,
    Math.ceil(filteredHistory.length / HISTORY_ITEMS_PER_PAGE),
  );

  const paginatedHistory = filteredHistory.slice(
    (historyPage - 1) * HISTORY_ITEMS_PER_PAGE,
    historyPage * HISTORY_ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setHistoryPage(1);
  }, [historySearch, historyStatus]);

  if (activeTab === "overview") {
    const recentNotifications = notifications.slice(0, 3);

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

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Dernières Notifications
            </h3>
            <button
              onClick={() => onChangeTab?.("notifications")}
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Voir tout
            </button>
          </div>

          {recentNotifications.length === 0 ? (
            <p className="text-sm text-gray-500">
              Aucune notification récente.
            </p>
          ) : (
            <div className="space-y-3">
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-3 rounded-lg border border-gray-100 bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {notification.message}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {getTimeAgo(notification.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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

  if (activeTab === "notifications") {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {notifications.filter((n) => !n.is_read).length} non lue
              {notifications.filter((n) => !n.is_read).length > 1 ? "s" : ""}
            </span>
            <button
              onClick={() => onMarkAllNotificationsRead?.()}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-primary-200 text-primary-700 hover:bg-primary-50"
            >
              Tout marquer lu
            </button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <p className="text-gray-500">Aucune notification pour le moment</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-gray-100 last:border-b-0 ${
                  notification.is_read ? "bg-white" : "bg-blue-50/40"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      {getTimeAgo(notification.created_at)}
                    </p>
                    {!notification.is_read && (
                      <span className="inline-block mt-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (activeTab === "saved") {
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

        {savedVehicles.length === 0 ? (
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
              onClick={() => navigate("/vehicles")}
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-xl font-bold text-gray-900">
            Historique des Réservations
          </h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Rechercher véhicule ou agence"
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            />

            <select
              value={historyStatus}
              onChange={(e) => setHistoryStatus(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmée</option>
              <option value="completed">Terminée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <p className="text-gray-500">
              Aucune réservation ne correspond à votre recherche
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-5">
              {paginatedHistory.map((reservation) => (
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

            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-gray-500">
                Page {historyPage} / {totalHistoryPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setHistoryPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={historyPage === 1}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Précédent
                </button>
                <button
                  onClick={() =>
                    setHistoryPage((prev) =>
                      Math.min(totalHistoryPages, prev + 1),
                    )
                  }
                  disabled={historyPage === totalHistoryPages}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          </>
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
