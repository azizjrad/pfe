import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { agencyService } from "../../services/agencyService";
import { vehicleService } from "../../services/vehicleService";
import { reservationService } from "../../services/reservationService";
import ReservationDetailsModal from "../modals/ReservationDetailsModal";
import Toast from "../common/Toast";
import { ROLES } from "../../constants/roles";
import { REPORT_STATUS, RESERVATION_STATUS } from "../../constants/statuses";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
const AgencyContent = ({ activeTab, reports = [] }) => {
  const { t } = useTranslation();
  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"];
  const [reservations, setReservations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [agencyFinancialStats, setAgencyFinancialStats] = useState({
    monthly: [],
    vehiclePerformance: [],
    paymentStatus: [
      { name: "Pay├®", value: 0, color: "#10B981" },
      { name: "En attente", value: 0, color: "#F59E0B" },
      { name: "Retard", value: 0, color: "#EF4444" },
    ],
    totals: { revenue: 0, commission: 0, payout: 0, netIncome: 0 },
  });
  const [loadingFinancial, setLoadingFinancial] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    mileage: 0,
    daily_price: "",
    license_plate: "",
    color: "",
    seats: 5,
    transmission: "automatic",
    fuel_type: "petrol",
    status: "available",
    image: "",
  });

  // Fetch reservations on mount
  useEffect(() => {
    fetchReservations();
  }, []);

  // Fetch financial stats when financial tab opens
  useEffect(() => {
    if (activeTab === "financial") {
      fetchFinancialStats();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "vehicles") {
      fetchVehicles();
    }
  }, [activeTab]);

  const fetchFinancialStats = async () => {
    setLoadingFinancial(true);
    try {
      const response = await agencyService.getFinancialStats();
      setAgencyFinancialStats(response.data.data);
    } catch (error) {
      setToast({
        show: true,
        message: t("agencyContent.errorLoadingFinancial"),
        type: "error",
      });
    } finally {
      setLoadingFinancial(false);
    }
  };

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await reservationService.getAgency();
      setReservations(response.data.data);
    } catch (error) {
      setToast({
        show: true,
        message: t("agencyContent.errorLoadingReservations"),
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    setLoadingVehicles(true);
    try {
      const response = await vehicleService.getAll();
      setVehicles(response?.data?.data || []);
    } catch (error) {
      setToast({
        show: true,
        message:
          error.response?.data?.message || "Erreur chargement v├®hicules",
        type: "error",
      });
    } finally {
      setLoadingVehicles(false);
    }
  };

  const resetVehicleForm = () => {
    setVehicleForm({
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      mileage: 0,
      daily_price: "",
      license_plate: "",
      color: "",
      seats: 5,
      transmission: "automatic",
      fuel_type: "petrol",
      status: "available",
      image: "",
    });
    setEditingVehicleId(null);
  };

  const handleCreateVehicle = async (event) => {
    event.preventDefault();

    setCreatingVehicle(true);
    try {
      const payload = {
        ...vehicleForm,
        daily_price: Number(vehicleForm.daily_price),
        mileage: Number(vehicleForm.mileage),
        seats: Number(vehicleForm.seats),
        year: Number(vehicleForm.year),
      };

      const response = await vehicleService.create(payload);
      const createdVehicle = response?.data?.data;

      if (createdVehicle) {
        setVehicles((prev) => [createdVehicle, ...prev]);
      } else {
        await fetchVehicles();
      }

      setToast({
        show: true,
        message: "V├®hicule ajout├® avec succ├¿s",
        type: "success",
      });
      setIsVehicleModalOpen(false);
      resetVehicleForm();
    } catch (error) {
      setToast({
        show: true,
        message: error.response?.data?.message || "Erreur ajout v├®hicule",
        type: "error",
      });
    } finally {
      setCreatingVehicle(false);
    }
  };

  const handleOpenEditVehicle = (vehicle) => {
    setEditingVehicleId(vehicle.id);
    setVehicleForm({
      brand: vehicle.brand || "",
      model: vehicle.model || "",
      year: vehicle.year || new Date().getFullYear(),
      mileage: vehicle.mileage || 0,
      daily_price: vehicle.daily_price ?? vehicle.daily_rate ?? "",
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

  const handleDeleteVehicle = async (vehicle) => {
    const confirmed = window.confirm(
      `Supprimer ${vehicle.brand || ""} ${vehicle.model || ""} ?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingVehicleId(vehicle.id);
    try {
      await vehicleService.delete(vehicle.id);
      setVehicles((prev) => prev.filter((item) => item.id !== vehicle.id));
      setToast({
        show: true,
        message: "V├®hicule supprim├® avec succ├¿s",
        type: "success",
      });
    } catch (error) {
      setToast({
        show: true,
        message:
          error.response?.data?.message || "Erreur suppression v├®hicule",
        type: "error",
      });
    } finally {
      setDeletingVehicleId(null);
    }
  };

  const handleSubmitVehicle = async (event) => {
    if (editingVehicleId) {
      event.preventDefault();
      setCreatingVehicle(true);

      try {
        const payload = {
          ...vehicleForm,
          daily_price: Number(vehicleForm.daily_price),
          mileage: Number(vehicleForm.mileage),
          seats: Number(vehicleForm.seats),
          year: Number(vehicleForm.year),
        };

        const response = await vehicleService.update(editingVehicleId, payload);
        const updatedVehicle = response?.data?.data;

        if (updatedVehicle) {
          setVehicles((prev) =>
            prev.map((item) =>
              item.id === editingVehicleId
                ? { ...item, ...updatedVehicle }
                : item,
            ),
          );
        } else {
          await fetchVehicles();
        }

        setToast({
          show: true,
          message: "V├®hicule modifi├® avec succ├¿s",
          type: "success",
        });
        setIsVehicleModalOpen(false);
        resetVehicleForm();
      } catch (error) {
        setToast({
          show: true,
          message:
            error.response?.data?.message || "Erreur modification v├®hicule",
          type: "error",
        });
      } finally {
        setCreatingVehicle(false);
      }

      return;
    }

    await handleCreateVehicle(event);
  };

  const handleVehicleFormChange = (event) => {
    const { name, value } = event.target;
    setVehicleForm((prev) => ({ ...prev, [name]: value }));
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
        label: "R├®serv├®",
        className: "bg-amber-100 text-amber-700",
      },
      in_use: {
        label: "En cours d'utilisation",
        className: "bg-blue-100 text-blue-700",
      },
      returned: {
        label: "Retourn├®",
        className: "bg-emerald-100 text-emerald-700",
      },
      maintenance: {
        label: "En maintenance",
        className: "bg-orange-100 text-orange-700",
      },
      rented: {
        label: "Lou├®",
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
        {detailsModal.isOpen && detailsModal.reservation && (
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
          />
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
        {detailsModal.isOpen && detailsModal.reservation && (
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
          />
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
              Gestion des V├®hicules
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              G├®rez votre flotte de v├®hicules disponibles
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
            Ajouter V├®hicule
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Mod├¿le
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
                    R├®servations
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
                      Chargement des v├®hicules...
                    </td>
                  </tr>
                ) : vehicles.length === 0 ? (
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Aucun v├®hicule pour le moment
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

        {isVehicleModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingVehicleId
                    ? "Modifier le v├®hicule"
                    : "Ajouter un v├®hicule"}
                </h3>
                <button
                  onClick={() => {
                    setIsVehicleModalOpen(false);
                    resetVehicleForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Ô£ò
                </button>
              </div>

              <form
                onSubmit={handleSubmitVehicle}
                className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <input
                  name="brand"
                  value={vehicleForm.brand}
                  onChange={handleVehicleFormChange}
                  placeholder="Marque"
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
                <input
                  name="model"
                  value={vehicleForm.model}
                  onChange={handleVehicleFormChange}
                  placeholder="Mod├¿le"
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
                <input
                  name="year"
                  type="number"
                  value={vehicleForm.year}
                  onChange={handleVehicleFormChange}
                  placeholder="Ann├®e"
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
                <input
                  name="mileage"
                  type="number"
                  value={vehicleForm.mileage}
                  onChange={handleVehicleFormChange}
                  placeholder="Kilom├®trage"
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
                <input
                  name="daily_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={vehicleForm.daily_price}
                  onChange={handleVehicleFormChange}
                  placeholder="Prix / jour"
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
                <input
                  name="license_plate"
                  value={vehicleForm.license_plate}
                  onChange={handleVehicleFormChange}
                  placeholder="Immatriculation"
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
                <input
                  name="color"
                  value={vehicleForm.color}
                  onChange={handleVehicleFormChange}
                  placeholder="Couleur"
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
                <input
                  name="seats"
                  type="number"
                  min="2"
                  max="9"
                  value={vehicleForm.seats}
                  onChange={handleVehicleFormChange}
                  placeholder="Nombre de places"
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  required
                />

                <select
                  name="transmission"
                  value={vehicleForm.transmission}
                  onChange={handleVehicleFormChange}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="automatic">Automatique</option>
                  <option value="manual">Manuelle</option>
                </select>

                <select
                  name="fuel_type"
                  value={vehicleForm.fuel_type}
                  onChange={handleVehicleFormChange}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="petrol">Essence</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">├ëlectrique</option>
                  <option value="hybrid">Hybride</option>
                </select>

                <select
                  name="status"
                  value={vehicleForm.status}
                  onChange={handleVehicleFormChange}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="available">Disponible</option>
                  <option value="reserved">R├®serv├®</option>
                  <option value="in_use">En cours d'utilisation</option>
                  <option value="returned">Retourn├®</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="rented">Lou├®</option>
                  <option value="unavailable">Indisponible</option>
                </select>

                <input
                  name="image"
                  value={vehicleForm.image}
                  onChange={handleVehicleFormChange}
                  placeholder="URL image (optionnel)"
                  className="border border-gray-300 rounded-lg px-3 py-2 md:col-span-2"
                />

                <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsVehicleModalOpen(false);
                      resetVehicleForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={creatingVehicle}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    {creatingVehicle
                      ? editingVehicleId
                        ? "Enregistrement..."
                        : "Ajout..."
                      : editingVehicleId
                        ? "Enregistrer"
                        : "Ajouter"}
                  </button>
                </div>
              </form>
            </div>
          </div>
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
        return { label: "R├®solu", color: "bg-green-100 text-green-700" };
      if (status === REPORT_STATUS.DISMISSED)
        return { label: "Rejet├®", color: "bg-gray-100 text-gray-700" };
      return { label: status, color: "bg-gray-100 text-gray-700" };
    };

    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Signalements de mes v├®hicules
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Signalements soumis par des clients concernant vos v├®hicules
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
                    V├®hicule
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Raison
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Signal├® par
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
                        {report.targetName || "ÔÇö"}
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
                        {report.adminNotes || "ÔÇö"}
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
        title: "R├®servation en attente",
        description: `${r.user?.name || "Client"} a r├®serv├® ${r.vehicle?.name || "un v├®hicule"} du ${new Date(r.start_date).toLocaleDateString()} au ${new Date(r.end_date).toLocaleDateString()}`,
        icon: "clock",
        color: "yellow",
        severity: "high",
        timestamp: r.created_at,
      })),
      ...ongoingReservations.map((r) => ({
        id: `${RESERVATION_STATUS.ONGOING}-${r.id}`,
        type: RESERVATION_STATUS.ONGOING,
        title: "R├®servation en cours",
        description: `${r.vehicle?.name || "Un v├®hicule"} est actuellement r├®serv├® jusqu'au ${new Date(r.end_date).toLocaleDateString()}`,
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
            Suivez les actions requises et les mises ├á jour importantes
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
              Tout est en ordre, continuez vos op├®rations!
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

  if (activeTab === "financial") {
    const monthlyRevenue = agencyFinancialStats.monthly;
    const vehiclePerformance = agencyFinancialStats.vehiclePerformance;
    const paymentStatus = agencyFinancialStats.paymentStatus;
    const totalRevenue = agencyFinancialStats.totals.revenue;
    const totalCommission = agencyFinancialStats.totals.commission;
    const totalProfit = agencyFinancialStats.totals.payout;
    const netIncome = agencyFinancialStats.totals.netIncome;

    if (loadingFinancial) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="text-gray-500">
            Chargement des donn├®es financi├¿res...
          </p>
        </div>
      );
    }

    if (monthlyRevenue.length === 0) {
      return (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg font-medium">
            Aucune donn├®e financi├¿re disponible.
          </p>
          <p className="text-sm mt-2">
            Les donn├®es appara├«tront d├¿s que des r├®servations seront
            confirm├®es.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Finances de l'Agence
          </h2>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              P├®riode
            </button>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2">
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Exporter
            </button>
          </div>
        </div>

        {/* Key Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-slideUp"
            style={{ animationDelay: "0ms" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <svg
                  className="w-8 h-8"
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
              </div>
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                +14.2%
              </span>
            </div>
            <p className="text-blue-100 text-sm font-medium mb-1">
              Revenu Total
            </p>
            <p className="text-3xl font-bold">
              {totalRevenue.toLocaleString()} DT
            </p>
            <p className="text-blue-100 text-xs mt-2">6 derniers mois</p>
          </div>

          <div
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-slideUp"
            style={{ animationDelay: "100ms" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                Apr├¿s frais
              </span>
            </div>
            <p className="text-green-100 text-sm font-medium mb-1">
              Revenu Net
            </p>
            <p className="text-3xl font-bold">
              {netIncome.toLocaleString()} DT
            </p>
            <p className="text-green-100 text-xs mt-2">Apr├¿s commission 15%</p>
          </div>

          <div
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-slideUp"
            style={{ animationDelay: "200ms" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <svg
                  className="w-8 h-8"
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
              </div>
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                -15%
              </span>
            </div>
            <p className="text-purple-100 text-sm font-medium mb-1">
              Commission Pay├®e
            </p>
            <p className="text-3xl font-bold">
              {totalCommission.toLocaleString()} DT
            </p>
            <p className="text-purple-100 text-xs mt-2">├Ç la plateforme</p>
          </div>

          <div
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-slideUp"
            style={{ animationDelay: "300ms" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                Marge
              </span>
            </div>
            <p className="text-orange-100 text-sm font-medium mb-1">
              Profit Brut
            </p>
            <p className="text-3xl font-bold">
              {totalProfit.toLocaleString()} DT
            </p>
            <p className="text-orange-100 text-xs mt-2">
              {((totalProfit / totalRevenue) * 100).toFixed(1)}% du revenu
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue & Profit Trend */}
          <div
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-slideUp"
            style={{ animationDelay: "400ms" }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Performance Financi├¿re
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  name="Revenu"
                  dot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#10B981"
                  strokeWidth={3}
                  name="Profit"
                  dot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="commission"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Commission"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Status */}
          <div
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-slideUp"
            style={{ animationDelay: "500ms" }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Statut des Paiements
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {paymentStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Performance */}
        <div
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-slideUp"
          style={{ animationDelay: "600ms" }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
            Performance par V├®hicule
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vehiclePerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" />
              <YAxis
                dataKey="vehicle"
                type="category"
                stroke="#6B7280"
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
              <Bar
                dataKey="revenue"
                fill="#3B82F6"
                name="Revenu (DT)"
                radius={[0, 8, 8, 0]}
              />
              <Bar
                dataKey="bookings"
                fill="#10B981"
                name="R├®servations"
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Financial Details Table */}
        <div
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-slideUp"
          style={{ animationDelay: "700ms" }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            D├®tails Mensuels
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    Mois
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">
                    Revenu Total
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">
                    Commission (8%)
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">
                    Revenu Net
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthlyRevenue.map((month) => (
                  <tr
                    key={month.month}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {month.month}
                    </td>
                    <td className="text-right py-3 px-4 text-blue-600 font-semibold">
                      {month.revenue.toLocaleString()} DT
                    </td>
                    <td className="text-right py-3 px-4 text-purple-600">
                      {month.commission.toLocaleString()} DT
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">
                        {month.profit.toLocaleString()} DT
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

  if (activeTab === "statistics") {
    // Calculate statistics from reservations
    const completedReservations = reservations.filter(
      (r) => r.status === "completed",
    );
    const totalRevenue = completedReservations.reduce(
      (sum, r) => sum + parseFloat(r.agency_payout || 0),
      0,
    );
    const avgReservationValue =
      completedReservations.length > 0
        ? totalRevenue / completedReservations.length
        : 0;

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">
          Statistiques de l'Agence
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">R├®servations Totales</p>
            <p className="text-3xl font-bold text-primary-600">
              {reservations.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              R├®servations Termin├®es
            </p>
            <p className="text-3xl font-bold text-green-600">
              {completedReservations.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Revenu Total</p>
            <p className="text-3xl font-bold text-primary-600">
              {totalRevenue.toFixed(2)} DT
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Client Content Component

export default AgencyContent;
