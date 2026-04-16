import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { agencyService } from "../../services/agencyService";
import { vehicleService } from "../../services/vehicleService";
import { reservationService } from "../../services/reservationService";
import ReservationDetailsModal from "../modals/ReservationDetailsModal";
import AgencyStatisticsTab from "./AgencyStatisticsTab";
import Toast from "../common/Toast";
import { ROLES } from "../../constants/roles";
import { REPORT_STATUS, RESERVATION_STATUS } from "../../constants/statuses";
const AgencyContent = ({
  activeTab,
  reports = [],
  reservations: propsReservations = [],
  vehicles: propsVehicles = [],
  loading: propsLoading = false,
}) => {
  const { t } = useTranslation();
  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"];
  const [reservations, setReservations] = useState(propsReservations);
  const [vehicles, setVehicles] = useState(propsVehicles);
  const [loading, setLoading] = useState(propsLoading);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [creatingVehicle, setCreatingVehicle] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [deletingVehicleId, setDeletingVehicleId] = useState(null);
  const [vehicleHistoryModal, setVehicleHistoryModal] = useState({
    isOpen: false,
    vehicle: null,
  });
  const [detailsModal, setDetailsModal] = useState({
    isOpen: false,
    reservation: null,
  });
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [imageDragActive, setImageDragActive] = useState(false);

  // Update internal state when props change
  useEffect(() => {
    setReservations(propsReservations);
    setVehicles(propsVehicles);
    setLoading(propsLoading);
  }, [propsReservations, propsVehicles, propsLoading]);

  const handleCreateVehicle = async (event) => {
    event.preventDefault();
    setCreatingVehicle(true);

    try {
      const payload = {
        ...vehicleForm,
        daily_price: Number(vehicleForm.daily_price),
        caution_amount:
          vehicleForm.caution_amount === "" ||
          vehicleForm.caution_amount === null ||
          vehicleForm.caution_amount === undefined
            ? null
            : Number(vehicleForm.caution_amount),
        mileage: Number(vehicleForm.mileage),
        seats: Number(vehicleForm.seats),
        year: Number(vehicleForm.year),
        status: vehicleForm.status || "available",
      };

      const response = await vehicleService.create(payload);
      const createdVehicle = response?.data;

      if (createdVehicle) {
        setVehicles((prev) => [createdVehicle, ...prev]);
      } else {
        await fetchVehicles();
      }

      setToast({
        show: true,
        message: "Véhicule ajouté avec succès",
        type: "success",
      });
      setIsVehicleModalOpen(false);
      resetVehicleForm();
    } catch (error) {
      setToast({
        show: true,
        message: error.response?.data?.message || "Erreur ajout véhicule",
        type: "error",
      });
    } finally {
      setCreatingVehicle(false);
    }
  };

  if (activeTab === "statistics") {
    return (
      <AgencyStatisticsTab
        reservations={reservations}
        vehicles={vehicles}
        loading={loading}
      />
    );
  }

  const handleOpenEditVehicle = (vehicle) => {
    setEditingVehicleId(vehicle.id);
    setVehicleForm({
      brand: vehicle.brand || "",
      model: vehicle.model || "",
      year: vehicle.year || new Date().getFullYear(),
      mileage: vehicle.mileage || 0,
      daily_price: vehicle.daily_price ?? vehicle.daily_rate ?? "",
      caution_amount: vehicle.caution_amount ?? "",
      license_plate: vehicle.license_plate || vehicle.registration_number || "",
      color: vehicle.color || "",
      seats: vehicle.seats ?? vehicle.seating_capacity ?? 5,
      transmission: vehicle.transmission || "automatic",
      fuel_type: vehicle.fuel_type || "petrol",
      status: vehicle.status || "available",
      image: vehicle.image || vehicle.image_url || "",
    });
    setIsVehicleModalOpen(true);
  };

  const handleVehicleFormChange = (event) => {
    const { name, value } = event.target;
    setVehicleForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVehicleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToast({
        show: true,
        message: "Veuillez sélectionner une image valide",
        type: "error",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      setVehicleForm((prev) => ({
        ...prev,
        image: readerEvent.target?.result || "",
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleVehicleImageDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setImageDragActive(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleVehicleImageUpload({ target: { files: [file] } });
    }
  };

  const handleVehicleImageDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.type === "dragenter" || event.type === "dragover") {
      setImageDragActive(true);
    } else if (event.type === "dragleave") {
      setImageDragActive(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await reservationService.updateStatus(id, newStatus);
      setToast({
        show: true,
        message: t("agencyContent.statusUpdated"),
        type: "success",
      });
      fetchReservations();
      setDetailsModal({ isOpen: false, reservation: null });
    } catch (error) {
      setToast({
        show: true,
        message:
          error.response?.data?.message ||
          t("agencyContent.errorUpdatingStatus"),
        type: "error",
      });
    }
  };

  const handlePickup = async (id, notes) => {
    try {
      await reservationService.pickup(id, notes);
      setToast({
        show: true,
        message: t("agencyContent.vehiclePickedUp"),
        type: "success",
      });
      fetchReservations();
      setDetailsModal({ isOpen: false, reservation: null });
    } catch (error) {
      setToast({
        show: true,
        message:
          error.response?.data?.message || t("agencyContent.errorPickup"),
        type: "error",
      });
    }
  };

  const handleReturn = async (id, returnData) => {
    try {
      await reservationService.return(id, returnData);
      setToast({
        show: true,
        message: t("agencyContent.vehicleReturned"),
        type: "success",
      });
      fetchReservations();
      setDetailsModal({ isOpen: false, reservation: null });
    } catch (error) {
      setToast({
        show: true,
        message:
          error.response?.data?.message || t("agencyContent.errorReturn"),
        type: "error",
      });
    }
  };

  const handleCancelReservation = async (id, reason) => {
    try {
      await reservationService.cancel(id, reason);
      setToast({
        show: true,
        message: t("agencyContent.reservationCancelled"),
        type: "success",
      });
      fetchReservations();
      setDetailsModal({ isOpen: false, reservation: null });
    } catch (error) {
      setToast({
        show: true,
        message:
          error.response?.data?.message || t("agencyContent.errorCancel"),
        type: "error",
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      [RESERVATION_STATUS.PENDING]: {
        label: t("agencyContent.status.pending"),
        class: "bg-yellow-100 text-yellow-700",
      },
      [RESERVATION_STATUS.CONFIRMED]: {
        label: t("agencyContent.status.confirmed"),
        class: "bg-blue-100 text-blue-700",
      },
      [RESERVATION_STATUS.ONGOING]: {
        label: t("agencyContent.status.ongoing"),
        class: "bg-yellow-100 text-yellow-700",
      },
      [RESERVATION_STATUS.COMPLETED]: {
        label: t("agencyContent.status.completed"),
        class: "bg-green-100 text-green-700",
      },
      [RESERVATION_STATUS.CANCELLED]: {
        label: t("agencyContent.status.cancelled"),
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

  const getVehicleStatusMeta = (status) => {
    const mapping = {
      available: {
        label: "Disponible",
        className: "bg-green-100 text-green-700",
      },
      reserved: {
        label: "Réservé",
        className: "bg-amber-100 text-amber-700",
      },
      in_use: {
        label: "En cours d'utilisation",
        className: "bg-blue-100 text-blue-700",
      },
      returned: {
        label: "Retourné",
        className: "bg-emerald-100 text-emerald-700",
      },
      maintenance: {
        label: "En maintenance",
        className: "bg-orange-100 text-orange-700",
      },
      rented: {
        label: "Loué",
        className: "bg-slate-100 text-slate-700",
      },
      unavailable: {
        label: "Indisponible",
        className: "bg-gray-100 text-gray-700",
      },
    };

    return (
      mapping[status] || {
        label: status || "-",
        className: "bg-gray-100 text-gray-700",
      }
    );
  };

  const getVehicleReservations = (vehicleId) =>
    reservations
      .filter((reservation) => reservation.vehicle_id === vehicleId)
      .sort(
        (left, right) =>
          new Date(right.created_at || right.start_date) -
          new Date(left.created_at || left.start_date),
      );

  if (activeTab === "overview") {
    const activeReservations = reservations.filter((r) =>
      [
        RESERVATION_STATUS.PENDING,
        RESERVATION_STATUS.CONFIRMED,
        RESERVATION_STATUS.ONGOING,
      ].includes(r.status),
    );

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">
          {t("agencyContent.activeReservations")}
        </h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : activeReservations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t("agencyContent.noActiveReservations")}
          </div>
        ) : (
          <div className="space-y-4">
            {activeReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setDetailsModal({ isOpen: true, reservation })}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {reservation.vehicle?.name || t("agencyContent.vehicle")}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("agencyContent.client")}:{" "}
                      {reservation.user?.name ||
                        t("agencyContent.notAvailable")}
                    </p>
                  </div>
                  {getStatusBadge(reservation.status)}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">
                      {t("agencyContent.from")}:
                    </span>{" "}
                    {new Date(reservation.start_date).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="text-gray-600">
                      {t("agencyContent.to")}:
                    </span>{" "}
                    {new Date(reservation.end_date).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="text-gray-600">
                      {t("agencyContent.amount")}:
                    </span>{" "}
                    <span className="font-semibold text-primary-600">
                      {reservation.total_price} DT
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">
                      {t("agencyContent.payment")}:
                    </span>{" "}
                    {reservation.payment_status === "paid"
                      ? t("agencyContent.paid")
                      : t("agencyContent.pending")}
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
              userRole={ROLES.AGENCY_ADMIN}
              onStatusUpdate={handleStatusUpdate}
              onPickup={handlePickup}
              onReturn={handleReturn}
              onCancel={handleCancelReservation}
            />,
            document.body,
          )}

        {/* Toast Notification */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ show: false, message: "", type: "" })}
          />
        )}
      </div>
    );
  }

  if (activeTab === "reservations") {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">
          {t("agencyContent.allReservations")}
        </h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t("agencyContent.noReservations")}
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setDetailsModal({ isOpen: true, reservation })}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {reservation.vehicle?.name || t("agencyContent.vehicle")}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("agencyContent.client")}:{" "}
                      {reservation.user?.name ||
                        t("agencyContent.notAvailable")}
                    </p>
                  </div>
                  {getStatusBadge(reservation.status)}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">
                      {t("agencyContent.from")}:
                    </span>{" "}
                    {new Date(reservation.start_date).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="text-gray-600">
                      {t("agencyContent.to")}:
                    </span>{" "}
                    {new Date(reservation.end_date).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="text-gray-600">
                      {t("agencyContent.amount")}:
                    </span>{" "}
                    <span className="font-semibold text-primary-600">
                      {reservation.total_price} DT
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">
                      {t("agencyContent.payment")}:
                    </span>{" "}
                    {reservation.payment_status === "paid"
                      ? t("agencyContent.paid")
                      : t("agencyContent.pending")}
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
              userRole={ROLES.AGENCY_ADMIN}
              onStatusUpdate={handleStatusUpdate}
              onPickup={handlePickup}
              onReturn={handleReturn}
              onCancel={handleCancelReservation}
            />,
            document.body,
          )}

        {/* Toast Notification */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ show: false, message: "", type: "" })}
          />
        )}
      </div>
    );
  }

  if (activeTab === "vehicles") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t("agencyContent.vitrineTitle")}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {t("agencyContent.vitrineSubtitle")}
            </p>
          </div>
          <button
            onClick={() => {
              resetVehicleForm();
              setIsVehicleModalOpen(true);
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t("agencyContent.addVehicle")}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Modèle
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Marque
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Immatriculation
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Réservations
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loadingVehicles ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      Chargement des véhicules...
                    </td>
                  </tr>
                ) : vehicles.length === 0 ? (
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Aucun véhicule pour le moment
                    </td>
                  </tr>
                ) : (
                  vehicles.map((vehicle) => (
                    <tr
                      key={vehicle.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {(() => {
                        const vehicleStatus = getVehicleStatusMeta(
                          vehicle.status,
                        );
                        return (
                          <>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              {vehicle.model || "-"}
                            </td>
                            <td className="px-6 py-4 text-gray-700">
                              {vehicle.brand || "-"}
                            </td>
                            <td className="px-6 py-4 text-gray-700">
                              {vehicle.license_plate ||
                                vehicle.registration_number ||
                                "-"}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${vehicleStatus.className}`}
                              >
                                {vehicleStatus.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-700">
                              {getVehicleReservations(vehicle.id).length}
                            </td>
                            <td className="px-6 py-4 text-right text-sm">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    setVehicleHistoryModal({
                                      isOpen: true,
                                      vehicle,
                                    })
                                  }
                                  className="px-2 py-1 rounded border border-gray-200 text-gray-700 hover:bg-gray-50"
                                >
                                  Historique
                                </button>
                                <button
                                  onClick={() => handleOpenEditVehicle(vehicle)}
                                  className="px-2 py-1 rounded border border-blue-200 text-blue-700 hover:bg-blue-50"
                                >
                                  Modifier
                                </button>
                                <button
                                  onClick={() => handleDeleteVehicle(vehicle)}
                                  disabled={deletingVehicleId === vehicle.id}
                                  className="px-2 py-1 rounded border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
                                >
                                  {deletingVehicleId === vehicle.id
                                    ? "Suppression..."
                                    : "Supprimer"}
                                </button>
                              </div>
                            </td>
                          </>
                        );
                      })()}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isVehicleModalOpen &&
          createPortal(
            <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
              <div className="w-full h-[100vh] sm:h-auto sm:max-h-[92vh] max-w-4xl overflow-hidden rounded-none sm:rounded-3xl bg-white shadow-2xl border border-white/70">
                <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-100 bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-5 text-white">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide uppercase text-white/90">
                      {editingVehicleId ? "Modifier" : "Ajouter"}
                    </div>
                    <h3 className="mt-3 text-2xl font-bold">
                      {editingVehicleId
                        ? "Modifier le véhicule"
                        : "Ajouter un véhicule"}
                    </h3>
                    <p className="mt-1 text-sm text-white/80">
                      Renseignez les informations du véhicule de façon claire et
                      rapide.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsVehicleModalOpen(false);
                      resetVehicleForm();
                    }}
                    className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
                    aria-label="Fermer"
                  >
                    ✕
                  </button>
                </div>

                <form
                  onSubmit={handleSubmitVehicle}
                  className="flex h-[calc(100vh-96px)] sm:h-auto sm:max-h-[calc(92vh-96px)] flex-col overflow-y-auto px-4 sm:px-6 py-5 sm:py-6"
                >
                  <div className="grid gap-5 sm:gap-6 pb-6">
                    <section className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50/80 to-white p-5">
                      <h4 className="mb-4 text-base font-semibold text-gray-900">
                        Informations principales
                      </h4>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Marque <span className="text-red-500">*</span>
                          </label>
                          <input
                            name="brand"
                            value={vehicleForm.brand}
                            onChange={handleVehicleFormChange}
                            placeholder="Ex: Toyota"
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                            required
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Modèle <span className="text-red-500">*</span>
                          </label>
                          <input
                            name="model"
                            value={vehicleForm.model}
                            onChange={handleVehicleFormChange}
                            placeholder="Ex: Corolla"
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                            required
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Année <span className="text-red-500">*</span>
                          </label>
                          <input
                            name="year"
                            type="number"
                            value={vehicleForm.year}
                            onChange={handleVehicleFormChange}
                            placeholder="2026"
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                            required
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Kilométrage <span className="text-red-500">*</span>
                          </label>
                          <input
                            name="mileage"
                            type="number"
                            value={vehicleForm.mileage}
                            onChange={handleVehicleFormChange}
                            placeholder="0"
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                            required
                          />
                        </div>
                      </div>
                    </section>

                    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                      <h4 className="mb-4 text-base font-semibold text-gray-900">
                        Caractéristiques et tarification
                      </h4>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Prix / jour (DT){" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            name="daily_price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={vehicleForm.daily_price}
                            onChange={handleVehicleFormChange}
                            placeholder="Ex: 120"
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                            required
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Montant de la caution (DT)
                          </label>
                          <input
                            name="caution_amount"
                            type="number"
                            min="0"
                            step="0.01"
                            value={vehicleForm.caution_amount ?? ""}
                            onChange={handleVehicleFormChange}
                            placeholder="Ex: 1000"
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Immatriculation{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            name="license_plate"
                            value={vehicleForm.license_plate}
                            onChange={handleVehicleFormChange}
                            placeholder="Ex: 123 TUN 456"
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                            required
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Couleur <span className="text-red-500">*</span>
                          </label>
                          <input
                            name="color"
                            value={vehicleForm.color}
                            onChange={handleVehicleFormChange}
                            placeholder="Ex: Noir"
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                            required
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Nombre de places{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            name="seats"
                            type="number"
                            min="2"
                            max="9"
                            value={vehicleForm.seats}
                            onChange={handleVehicleFormChange}
                            placeholder="5"
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                            required
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Transmission <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="transmission"
                            value={vehicleForm.transmission}
                            onChange={handleVehicleFormChange}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                            required
                          >
                            <option value="automatic">Automatique</option>
                            <option value="manual">Manuelle</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Carburant <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="fuel_type"
                            value={vehicleForm.fuel_type}
                            onChange={handleVehicleFormChange}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                            required
                          >
                            <option value="petrol">Essence</option>
                            <option value="diesel">Diesel</option>
                            <option value="electric">Électrique</option>
                            <option value="hybrid">Hybride</option>
                          </select>
                        </div>
                        {editingVehicleId && (
                          <div className="md:col-span-2">
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                              Statut de publication{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="status"
                              value={vehicleForm.status}
                              onChange={handleVehicleFormChange}
                              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                              required
                            >
                              <option value="available">Disponible</option>
                              <option value="reserved">Réservé</option>
                              <option value="in_use">
                                En cours d'utilisation
                              </option>
                              <option value="returned">Retourné</option>
                              <option value="maintenance">Maintenance</option>
                              <option value="rented">Loué</option>
                              <option value="unavailable">Indisponible</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </section>

                    <section className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/40 p-4 sm:p-5">
                      <h4 className="mb-4 text-base font-semibold text-gray-900">
                        Image du véhicule
                      </h4>
                      <div className="grid gap-4 lg:grid-cols-[1fr_220px] lg:items-start">
                        <div
                          onDragEnter={handleVehicleImageDrag}
                          onDragOver={handleVehicleImageDrag}
                          onDragLeave={handleVehicleImageDrag}
                          onDrop={handleVehicleImageDrop}
                          className={`rounded-2xl border-2 border-dashed p-4 sm:p-5 transition-all ${
                            imageDragActive
                              ? "border-primary-500 bg-primary-100/60"
                              : "border-primary-200 bg-white/80"
                          }`}
                        >
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Téléverser une image
                          </label>
                          <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-6 text-center transition hover:border-primary-300 hover:bg-primary-50">
                            <svg
                              className="mb-3 h-10 w-10 text-primary-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                            <span className="text-sm font-semibold text-gray-800">
                              Glissez-déposez une image ici ou cliquez pour
                              choisir
                            </span>
                            <span className="mt-1 text-xs text-gray-500">
                              PNG, JPG, JPEG, WebP ou GIF
                            </span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/gif"
                              onChange={handleVehicleImageUpload}
                              className="hidden"
                            />
                          </label>
                          <p className="mt-2 text-sm text-gray-500">
                            JPG, PNG ou WebP. L’image est stockée directement
                            dans le formulaire.
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/70 bg-white p-3 shadow-sm">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Aperçu
                            </span>
                            {vehicleForm.image && (
                              <button
                                type="button"
                                onClick={() =>
                                  setVehicleForm((prev) => ({
                                    ...prev,
                                    image: "",
                                  }))
                                }
                                className="text-xs font-medium text-red-600 hover:text-red-700"
                              >
                                Retirer
                              </button>
                            )}
                          </div>
                          <div className="flex h-40 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                            {vehicleForm.image ? (
                              <img
                                src={vehicleForm.image}
                                alt="Aperçu du véhicule"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="px-4 text-center text-sm text-gray-400">
                                Aucune image sélectionnée
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </section>

                    <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 pb-3 sm:flex-row sm:justify-end sm:pb-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsVehicleModalOpen(false);
                          resetVehicleForm();
                        }}
                        className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={creatingVehicle}
                        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-3 font-semibold text-white shadow-lg transition hover:from-primary-700 hover:to-primary-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {creatingVehicle
                          ? editingVehicleId
                            ? "Enregistrement..."
                            : "Ajout..."
                          : editingVehicleId
                            ? "Enregistrer"
                            : "Ajouter le véhicule"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>,
            document.body,
          )}

        {vehicleHistoryModal.isOpen && vehicleHistoryModal.vehicle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Historique des réservations
                  </h3>
                  <p className="text-sm text-gray-500">
                    {vehicleHistoryModal.vehicle.brand || ""}{" "}
                    {vehicleHistoryModal.vehicle.model || ""}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setVehicleHistoryModal({ isOpen: false, vehicle: null })
                  }
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-3">
                {getVehicleReservations(vehicleHistoryModal.vehicle.id)
                  .length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    Aucune réservation pour ce véhicule.
                  </div>
                ) : (
                  getVehicleReservations(vehicleHistoryModal.vehicle.id).map(
                    (reservation) => (
                      <div
                        key={reservation.id}
                        className="border border-gray-200 rounded-xl p-4 bg-gray-50/70"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {reservation.user?.name || "Client"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(
                                reservation.start_date,
                              ).toLocaleDateString("fr-FR")}{" "}
                              →{" "}
                              {new Date(
                                reservation.end_date,
                              ).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">
                              {reservation.total_price} DT
                            </div>
                            <div className="text-xs text-gray-400">
                              {reservation.payment_status === "paid"
                                ? "Payée"
                                : "En attente"}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            Statut:{" "}
                            <span className="font-medium text-gray-900">
                              {reservation.status}
                            </span>
                          </span>
                          <span className="text-gray-500">
                            Référence #{reservation.id}
                          </span>
                        </div>
                      </div>
                    ),
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ show: false, message: "", type: "" })}
          />
        )}
      </div>
    );
  }

  if (activeTab === "reports") {
    const statusLabel = (status) => {
      if (status === REPORT_STATUS.PENDING)
        return { label: "En attente", color: "bg-yellow-100 text-yellow-700" };
      if (status === REPORT_STATUS.RESOLVED)
        return { label: "Résolu", color: "bg-green-100 text-green-700" };
      if (status === REPORT_STATUS.DISMISSED)
        return { label: "Rejeté", color: "bg-gray-100 text-gray-700" };
      return { label: status, color: "bg-gray-100 text-gray-700" };
    };

    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Reclamations de mes véhicules
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Reclamations soumis par des clients concernant vos véhicules
          </p>
        </div>

        {reports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <svg
              className="w-12 h-12 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-500 font-medium">
              Aucun signalement pour le moment
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Véhicule
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Raison
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Signalé par
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Notes admin
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((report) => {
                  const { label, color } = statusLabel(report.status);
                  return (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {report.targetName || "—"}
                      </td>
                      <td
                        className="px-4 py-3 text-gray-700 max-w-xs truncate"
                        title={report.description}
                      >
                        {report.reason}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {report.reportedBy}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(report.reportedAt).toLocaleDateString(
                          "fr-FR",
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}
                        >
                          {label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">
                        {report.adminNotes || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === "alerts") {
    // Filter alerts based on reservation statuses
    const pendingReservations = reservations.filter(
      (r) => r.status === RESERVATION_STATUS.PENDING,
    );
    const ongoingReservations = reservations.filter(
      (r) => r.status === RESERVATION_STATUS.ONGOING,
    );

    const alerts = [
      ...pendingReservations.map((r) => ({
        id: `${RESERVATION_STATUS.PENDING}-${r.id}`,
        type: RESERVATION_STATUS.PENDING,
        title: "Réservation en attente",
        description: `${r.user?.name || "Client"} a réservé ${r.vehicle?.name || "un véhicule"} du ${new Date(r.start_date).toLocaleDateString()} au ${new Date(r.end_date).toLocaleDateString()}`,
        icon: "clock",
        color: "yellow",
        severity: "high",
        timestamp: r.created_at,
      })),
      ...ongoingReservations.map((r) => ({
        id: `${RESERVATION_STATUS.ONGOING}-${r.id}`,
        type: RESERVATION_STATUS.ONGOING,
        title: "Réservation en cours",
        description: `${r.vehicle?.name || "Un véhicule"} est actuellement réservé jusqu'au ${new Date(r.end_date).toLocaleDateString()}`,
        icon: "play",
        color: "blue",
        severity: "medium",
        timestamp: r.created_at,
      })),
    ];

    const getAlertIcon = (type) => {
      switch (type) {
        case RESERVATION_STATUS.PENDING:
          return (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          );
        case RESERVATION_STATUS.ONGOING:
          return (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          );
        default:
          return (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          );
      }
    };

    const getAlertBgColor = (color) => {
      const colors = {
        yellow: "bg-yellow-50 border-yellow-200",
        blue: "bg-blue-50 border-blue-200",
        red: "bg-red-50 border-red-200",
      };
      return colors[color] || colors.blue;
    };

    const getAlertIconBgColor = (color) => {
      const colors = {
        yellow: "bg-yellow-100 text-yellow-600",
        blue: "bg-blue-100 text-blue-600",
        red: "bg-red-100 text-red-600",
      };
      return colors[color] || colors.blue;
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Alertes et Notifications
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Suivez les actions requises et les mises à jour importantes
          </p>
        </div>

        {alerts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <svg
              className="w-16 h-16 text-green-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-600 font-medium text-lg">
              Aucune alerte pour le moment
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Tout est en ordre, continuez vos opérations!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-2xl border p-5 flex items-start gap-4 hover:shadow-md transition-all ${getAlertBgColor(alert.color)}`}
              >
                <div
                  className={`rounded-lg p-3 flex-shrink-0 ${getAlertIconBgColor(alert.color)}`}
                >
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {alert.description}
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    {new Date(alert.timestamp).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0">
                  Voir
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (activeTab === "statistics") {
    const completedReservations = reservations.filter(
      (reservation) => reservation.status === RESERVATION_STATUS.COMPLETED,
    );
    const activeReservations = reservations.filter((reservation) =>
      [
        RESERVATION_STATUS.PENDING,
        RESERVATION_STATUS.CONFIRMED,
        RESERVATION_STATUS.ONGOING,
      ].includes(reservation.status),
    );
    const availableVehicles = vehicles.filter(
      (vehicle) => vehicle.status === "available",
    );
    const maintenanceVehicles = vehicles.filter(
      (vehicle) => vehicle.status === "maintenance",
    );

    const deriveMonthlyRevenue = () => {
      const revenueByMonth = new Map();

      filteredCompletedReservations.forEach((reservation) => {
        const date = new Date(reservation.end_date || reservation.created_at);
        const monthLabel = Number.isNaN(date.getTime())
          ? "Inconnu"
          : date.toLocaleDateString("fr-FR", {
              month: "short",
              year: "numeric",
            });
        const amount = Number(reservation.agency_payout || 0);

        revenueByMonth.set(monthLabel, {
          month: monthLabel,
          revenue: (revenueByMonth.get(monthLabel)?.revenue || 0) + amount,
          profit: (revenueByMonth.get(monthLabel)?.profit || 0) + amount,
          commission:
            (revenueByMonth.get(monthLabel)?.commission || 0) + amount * 0.05,
        });
      });

      return Array.from(revenueByMonth.values()).slice(-6);
    };

    const deriveVehiclePerformance = () => {
      const performanceMap = new Map();

      filteredCompletedReservations.forEach((reservation) => {
        const vehicleId = reservation.vehicle_id || reservation.vehicle?.id;
        if (!vehicleId) return;

        const vehicleName =
          reservation.vehicle?.name ||
          `${reservation.vehicle?.brand || "Véhicule"} ${reservation.vehicle?.model || vehicleId}`.trim();
        const amount = Number(reservation.agency_payout || 0);

        performanceMap.set(vehicleId, {
          vehicle: vehicleName,
          revenue: (performanceMap.get(vehicleId)?.revenue || 0) + amount,
          bookings: (performanceMap.get(vehicleId)?.bookings || 0) + 1,
        });
      });

      return Array.from(performanceMap.values())
        .sort((left, right) => right.revenue - left.revenue)
        .slice(0, 6);
    };

    const monthlyRevenue = deriveMonthlyRevenue();
    const vehiclePerformance = deriveVehiclePerformance();
    const paymentStatus = [
      {
        name: "En attente",
        value: filteredReservations.filter(
          (reservation) => reservation.status === RESERVATION_STATUS.PENDING,
        ).length,
        color: "#F59E0B",
      },
      {
        name: "Confirmée",
        value: filteredReservations.filter(
          (reservation) => reservation.status === RESERVATION_STATUS.CONFIRMED,
        ).length,
        color: "#3B82F6",
      },
      {
        name: "Terminée",
        value: filteredCompletedReservations.length,
        color: "#10B981",
      },
    ];
    const totalCommission = filteredCompletedReservations.reduce(
      (sum, reservation) => sum + Number(reservation.platform_commission || 0),
      0,
    );
    const operationalRevenue = filteredCompletedReservations.reduce(
      (sum, reservation) => sum + Number(reservation.agency_payout || 0),
      0,
    );

    if (loadingFinancial) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="text-gray-500">Chargement des statistiques...</p>
        </div>
      );
    }

    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Statistiques de l'Agence
          </h2>
          <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
            <span className="text-sm font-medium text-gray-600">Période</span>
            <select
              value={statisticsPeriod}
              onChange={(event) => setStatisticsPeriod(event.target.value)}
              className="bg-transparent text-sm font-semibold text-gray-900 outline-none"
            >
              <option value="3m">3 mois</option>
              <option value="6m">6 mois</option>
              <option value="12m">12 mois</option>
              <option value="all">Tout</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-200 lg:col-span-2 animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Revenus mensuels nets
                </h3>
                <p className="text-sm text-gray-500">
                  Revenus agence après commission plateforme de 5%.
                </p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {statisticsPeriod === "all"
                  ? "Toutes les périodes"
                  : `${statisticsPeriod === "3m" ? 3 : statisticsPeriod === "6m" ? 6 : 12} derniers mois`}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.97)",
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.08)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563EB"
                  strokeWidth={3}
                  name="Revenu net agence"
                  dot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="commission"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Commission plateforme"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div
            className="rounded-2xl bg-white p-6 shadow-lg border border-gray-200 animate-slideUp"
            style={{ animationDelay: "150ms" }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Répartition des réservations
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Dossiers actifs, terminés et en attente.
            </p>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Actives",
                        value: filteredActiveReservations.length,
                        color: "#3B82F6",
                      },
                      {
                        name: "Terminées",
                        value: filteredCompletedReservations.length,
                        color: "#10B981",
                      },
                      {
                        name: "En attente",
                        value: filteredReservations.filter(
                          (reservation) =>
                            reservation.status === RESERVATION_STATUS.PENDING,
                        ).length,
                        color: "#F59E0B",
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={102}
                    dataKey="value"
                  >
                    {[
                      { name: "Actives", color: "#3B82F6" },
                      { name: "Terminées", color: "#10B981" },
                      { name: "En attente", color: "#F59E0B" },
                    ].map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div
            className="rounded-2xl bg-white p-6 shadow-lg border border-gray-200 animate-slideUp"
            style={{ animationDelay: "250ms" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Top véhicules par revenu
              </h3>
              <span className="text-sm text-gray-500">
                Réservations terminées
              </span>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={vehiclePerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" stroke="#6B7280" />
                <YAxis
                  dataKey="vehicle"
                  type="category"
                  stroke="#6B7280"
                  width={140}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.97)",
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.08)",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="revenue"
                  fill="#3B82F6"
                  name="Revenu net"
                  radius={[0, 8, 8, 0]}
                />
                <Bar
                  dataKey="bookings"
                  fill="#10B981"
                  name="Réservations"
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div
            className="rounded-2xl bg-white p-6 shadow-lg border border-gray-200 animate-slideUp"
            style={{ animationDelay: "350ms" }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Indicateurs utiles
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-gray-500">Flotte totale</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {fleetVehicles}
                </p>
              </div>
              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-sm text-blue-700">Véhicules disponibles</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {availableVehicles}
                </p>
              </div>
              <div className="rounded-xl bg-amber-50 p-4">
                <p className="text-sm text-amber-700">En maintenance</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {maintenanceVehicles}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-sm text-emerald-700">Taux de réalisation</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {filteredReservations.length > 0
                    ? `${Math.round((filteredCompletedReservations.length / filteredReservations.length) * 100)}%`
                    : "0%"}
                </p>
              </div>
            </div>
            <div className="mt-5 rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-500">Commission plateforme</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {totalCommission.toLocaleString()} DT
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Calculée à 5% sur les réservations de la période sélectionnée.
              </p>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateY(20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out;
          }
          
          .animate-slideUp {
            animation: slideUp 0.6s ease-out both;
          }
        `}</style>
      </div>
    );
  }

  return null;
};

// Client Content Component

export default AgencyContent;
