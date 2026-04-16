import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { reservationService } from "../../services/reservationService";
import ReservationDetailsModal from "../modals/ReservationDetailsModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import Toast from "../common/Toast";
import { RESERVATION_STATUS } from "../../constants/statuses";

// Client Content Component
const ClientContent = ({
  activeTab,
  navigate,
  notifications = [],
  onChangeTab,
  onMarkAllNotificationsRead,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
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

  const fetchReservations = async () => {
    try {
      const response = await reservationService.getMy();
      setReservations(response.data || []);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      showToast(t("clientContent.errorLoadingReservations"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (id) => {
    try {
      const response = await reservationService.cancel(id);
      if (response.success) {
        showToast(response.message, "success");
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
      [RESERVATION_STATUS.CONFIRMED]: "bg-green-100 text-green-600",
      [RESERVATION_STATUS.PENDING]: "bg-yellow-100 text-yellow-600",
      [RESERVATION_STATUS.COMPLETED]: "bg-gray-100 text-gray-600",
      [RESERVATION_STATUS.CANCELLED]: "bg-red-100 text-red-600",
    };
    return colors[status] || "bg-gray-100 text-gray-600";
  };

  const getStatusText = (status) => {
    const texts = {
      [RESERVATION_STATUS.CONFIRMED]: "Confirmée",
      [RESERVATION_STATUS.PENDING]: "En attente",
      [RESERVATION_STATUS.COMPLETED]: "Terminée",
      [RESERVATION_STATUS.CANCELLED]: "Annulée",
    };
    return texts[status] || status;
  };

  const getTimeAgo = (date) => {
    if (!date) return "";

    const now = new Date();
    const notifDate = new Date(date);
    const diffInMinutes = Math.floor((now - notifDate) / (1000 * 60));

    if (diffInMinutes < 1) return t("clientContent.time.now");
    if (diffInMinutes < 60)
      return t("clientContent.time.min", { count: diffInMinutes });
    if (diffInMinutes < 1440)
      return t("clientContent.time.hour", {
        count: Math.floor(diffInMinutes / 60),
      });
    return t("clientContent.time.day", {
      count: Math.floor(diffInMinutes / 1440),
    });
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
                      {reservation.status === RESERVATION_STATUS.PENDING && (
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
                      {reservation.status === RESERVATION_STATUS.CONFIRMED && (
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
        {detailsModal.isOpen &&
          detailsModal.reservation &&
          createPortal(
            <ReservationDetailsModal
              reservation={detailsModal.reservation}
              onClose={() =>
                setDetailsModal({ isOpen: false, reservation: null })
              }
              userRole="client"
              onCancel={handleCancelReservation}
            />,
            document.body,
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

  if (activeTab === "history") {
    return (
      <div className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-xl font-bold text-gray-900">
            {t("clientContent.reservationHistory")}
          </h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder={t("clientContent.searchVehicleOrAgency")}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            />

            <select
              value={historyStatus}
              onChange={(e) => setHistoryStatus(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            >
              <option value="all">{t("clientContent.allStatuses")}</option>
              <option value={RESERVATION_STATUS.PENDING}>
                {t("clientContent.status.pending")}
              </option>
              <option value={RESERVATION_STATUS.CONFIRMED}>
                {t("clientContent.status.confirmed")}
              </option>
              <option value={RESERVATION_STATUS.COMPLETED}>
                {t("clientContent.status.completed")}
              </option>
              <option value={RESERVATION_STATUS.CANCELLED}>
                {t("clientContent.status.cancelled")}
              </option>
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
              {t("clientContent.noHistoryResults")}
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
                {t("clientContent.pageOf", {
                  page: historyPage,
                  total: totalHistoryPages,
                })}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setHistoryPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={historyPage === 1}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  {t("clientContent.previous")}
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
                  {t("clientContent.next")}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Reservation Details Modal */}
        {detailsModal.isOpen &&
          detailsModal.reservation &&
          createPortal(
            <ReservationDetailsModal
              reservation={detailsModal.reservation}
              onClose={() =>
                setDetailsModal({ isOpen: false, reservation: null })
              }
              userRole="client"
              onCancel={handleCancelReservation}
            />,
            document.body,
          )}
      </div>
    );
  }

  return null;
};

export default ClientContent;
