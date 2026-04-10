import React, { useState, useMemo, useEffect } from "react";
import { pricingConfigService } from "../../services/pricingConfigService";

/**
 * ReservationModal Component with Simple Pricing
 *
 * This component calculates prices based on daily rate × days + selected options.
 *
 * Pricing Calculation:
 * 1. Base price: vehicle daily rate × rental days
 * 2. Optional services (delivery, etc.)
 * 3. Total: base + options
 *
 * @param {boolean} isOpen - Modal visibility state
 * @param {function} onClose - Callback to close modal
 * @param {object} vehicle - Vehicle object with id, name, category, image, price, agency
 * @param {function} onSubmit - Callback with reservation data including final price
 * @param {object} currentUser - Authenticated user used for prefilled personal data
 */
const ReservationModal = ({
  isOpen,
  onClose,
  vehicle,
  onSubmit,
  currentUser,
}) => {
  // Pricing configuration fetched from backend
  const [pricingConfig, setPricingConfig] = useState(null);
  const [pricingConfigError, setPricingConfigError] = useState("");

  // Fetch pricing configuration on component mount
  useEffect(() => {
    const fetchPricingConfig = async () => {
      try {
        const config = await pricingConfigService.getPricingConfig();
        setPricingConfig(config);
        setPricingConfigError("");
      } catch (error) {
        console.error("Failed to load pricing configuration:", error);
        setPricingConfig(null);
        setPricingConfigError(
          "Impossible de charger la configuration tarifaire. Veuillez réessayer.",
        );
      }
    };

    if (isOpen) {
      fetchPricingConfig();
    }
  }, [isOpen]);

  const getPrefilledPersonalData = () => ({
    fullName: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
  });

  // Personal information state
  const [reservationData, setReservationData] = useState({
    startDate: "",
    endDate: "",
    ...getPrefilledPersonalData(),
    client_birth_date: "",
    driver_license_number: "",
    driver_license_date: "",
  });

  useEffect(() => {
    if (!isOpen) return;

    setReservationData((prev) => ({
      ...prev,
      ...getPrefilledPersonalData(),
    }));
  }, [isOpen, currentUser]);

  // Pricing options state
  const [options, setOptions] = useState({
    airport_delivery: false,
    home_delivery: false,
    after_hours_pickup: false,
  });

  const [touched, setTouched] = useState({});
  const [focused, setFocused] = useState({});
  const [errors, setErrors] = useState({});

  const requiredFields = [
    "startDate",
    "endDate",
    "fullName",
    "email",
    "phone",
    "client_birth_date",
    "driver_license_number",
    "driver_license_date",
  ];

  // Simple pricing calculation using config-driven values
  const pricing = useMemo(() => {
    if (
      !vehicle?.price ||
      !reservationData.startDate ||
      !reservationData.endDate
    ) {
      return null;
    }

    const start = new Date(reservationData.startDate);
    const end = new Date(reservationData.endDate);
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

    const basePrice = vehicle.price * days;

    const addOns = pricingConfig?.add_ons;
    if (!addOns) {
      return null;
    }

    // Calculate fixed add-ons
    const airportDelivery =
      options.airport_delivery && addOns.airport_delivery.type === "fixed"
        ? addOns.airport_delivery.value
        : 0;

    const homeDelivery =
      options.home_delivery && addOns.home_delivery.type === "fixed"
        ? addOns.home_delivery.value
        : 0;

    const afterHours =
      options.after_hours_pickup && addOns.after_hours_pickup.type === "fixed"
        ? addOns.after_hours_pickup.value
        : 0;

    const total = basePrice + airportDelivery + homeDelivery + afterHours;

    return {
      days,
      base_price: vehicle.price,
      base_total: basePrice,
      airport_delivery: airportDelivery,
      home_delivery: homeDelivery,
      after_hours: afterHours,
      total,
    };
  }, [
    vehicle?.price,
    reservationData.startDate,
    reservationData.endDate,
    options,
    pricingConfig,
  ]);

  const validateField = (fieldName, value, allData = reservationData) => {
    const trimmedValue = typeof value === "string" ? value.trim() : value;

    if (requiredFields.includes(fieldName) && !trimmedValue) {
      return "Ce champ est obligatoire.";
    }

    if (fieldName === "email" && trimmedValue) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedValue)) {
        return "Veuillez saisir une adresse email valide.";
      }
    }

    if (fieldName === "phone" && trimmedValue) {
      const phoneRegex = /^\d{8}$/;
      if (!phoneRegex.test(String(trimmedValue))) {
        return "Le téléphone doit contenir exactement 8 chiffres.";
      }
    }

    if (fieldName === "endDate" && trimmedValue && allData.startDate) {
      if (new Date(trimmedValue) <= new Date(allData.startDate)) {
        return "La date de fin doit être après la date de début.";
      }
    }

    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setReservationData((prev) => {
      const nextData = { ...prev, [name]: value };

      if (touched[name]) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: validateField(name, value, nextData),
        }));
      }

      // Keep endDate validation in sync when startDate changes.
      if (name === "startDate" && touched.endDate) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          endDate: validateField("endDate", nextData.endDate, nextData),
        }));
      }

      return nextData;
    });
  };

  // Handle option toggles (checkboxes and select)
  const handleOptionChange = (option, value) => {
    setOptions((prev) => ({ ...prev, [option]: value }));
  };

  const handleFocus = (fieldName) => {
    setFocused((prev) => ({ ...prev, [fieldName]: true }));
  };

  const handleBlur = (fieldName) => {
    setFocused((prev) => ({ ...prev, [fieldName]: false }));
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    setErrors((prev) => ({
      ...prev,
      [fieldName]: validateField(fieldName, reservationData[fieldName]),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const allTouched = requiredFields.reduce(
      (acc, field) => ({ ...acc, [field]: true }),
      {},
    );
    setTouched((prev) => ({ ...prev, ...allTouched }));

    const nextErrors = requiredFields.reduce((acc, field) => {
      acc[field] = validateField(field, reservationData[field]);
      return acc;
    }, {});
    setErrors((prev) => ({ ...prev, ...nextErrors }));

    const hasValidationErrors = Object.values(nextErrors).some(Boolean);
    if (hasValidationErrors) {
      return;
    }

    if (!pricingConfig?.add_ons) {
      return;
    }

    const addOnsConfig = pricingConfig.add_ons;

    // Include complete pricing details in submission
    const submissionData = {
      ...reservationData,
      options,
      pricing_breakdown: {
        base_total: pricing?.base_total || 0,
        total: pricing?.total || 0,
        days: pricing?.days || 1,
        options: pricing
          ? [
              ...(pricing.airport_delivery > 0
                ? [
                    {
                      name:
                        addOnsConfig.airport_delivery?.display_name ||
                        "airport_delivery",
                      amount: pricing.airport_delivery,
                    },
                  ]
                : []),
              ...(pricing.home_delivery > 0
                ? [
                    {
                      name:
                        addOnsConfig.home_delivery?.display_name ||
                        "home_delivery",
                      amount: pricing.home_delivery,
                    },
                  ]
                : []),
              ...(pricing.after_hours > 0
                ? [
                    {
                      name:
                        addOnsConfig.after_hours_pickup?.display_name ||
                        "after_hours_pickup",
                      amount: pricing.after_hours,
                    },
                  ]
                : []),
            ]
          : [],
      },
    };

    onSubmit(submissionData);

    // Reset form
    setReservationData({
      startDate: "",
      endDate: "",
      ...getPrefilledPersonalData(),
      client_birth_date: "",
      driver_license_number: "",
      driver_license_date: "",
    });
    setOptions({
      airport_delivery: false,
      home_delivery: false,
      after_hours_pickup: false,
    });
    setTouched({});
    setFocused({});
    setErrors({});
  };

  const handleClose = () => {
    setReservationData({
      startDate: "",
      endDate: "",
      ...getPrefilledPersonalData(),
      client_birth_date: "",
      driver_license_number: "",
      driver_license_date: "",
    });
    setOptions({
      airport_delivery: false,
      home_delivery: false,
      after_hours_pickup: false,
    });
    setTouched({});
    setFocused({});
    setErrors({});
    onClose();
  };

  // Calculate if form is valid for submission
  const hasErrors = Object.values(errors).some(Boolean);
  const isFormValid =
    reservationData.startDate &&
    reservationData.endDate &&
    reservationData.fullName.trim() &&
    reservationData.email.trim() &&
    reservationData.phone.trim() &&
    reservationData.client_birth_date &&
    reservationData.driver_license_number.trim() &&
    reservationData.driver_license_date &&
    !hasErrors &&
    pricing; // Must have pricing calculated

  if (!isOpen || !vehicle) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 pt-6 sm:pt-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[94vh] sm:max-h-[90vh] overflow-y-auto animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 sm:p-6 rounded-t-2xl sm:rounded-t-3xl flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg sm:text-2xl font-bold">
              Réserver votre véhicule
            </h3>
            <p className="text-sm sm:text-base text-primary-100 mt-1 break-words">
              {vehicle.name}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Vehicle Summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-primary-50 rounded-2xl">
            <img
              src={vehicle.image}
              alt={vehicle.name}
              className="w-full sm:w-24 h-40 sm:h-24 object-cover rounded-xl"
            />
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-base sm:text-lg">
                {vehicle.name}
              </h4>
              <p className="text-sm sm:text-base text-gray-600">
                {vehicle.category}
              </p>
              <p className="text-gray-600 text-xs sm:text-sm mt-1">
                Prix de base: {vehicle.price} DT/jour
              </p>
            </div>
          </div>

          {/* Reservation Form */}
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {pricingConfigError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {pricingConfigError}
              </div>
            )}

            {Object.values(errors).some(Boolean) && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-red-700 font-medium">
                    Veuillez corriger les champs obligatoires avant de confirmer
                    la réservation.
                  </p>
                </div>
              </div>
            )}

            {/* Dates Section */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
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
                Période de location*
              </h4>
              <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                <div className="relative">
                  <input
                    type="date"
                    name="startDate"
                    value={reservationData.startDate}
                    onChange={handleChange}
                    onFocus={() => handleFocus("startDate")}
                    onBlur={() => handleBlur("startDate")}
                    min={new Date().toISOString().split("T")[0]}
                    required
                    className={`w-full px-3.5 sm:px-4 py-3 border rounded-lg focus:border-primary-500 transition-all duration-300 bg-gray-50 focus:bg-white text-black focus:text-primary-500 peer focus:outline-none text-sm sm:text-base ${
                      errors.startDate ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder=" "
                  />
                  <label
                    className={`absolute text-xs -top-2 left-2 bg-white px-2 z-0 transition-colors duration-300 pointer-events-none ${
                      focused.startDate ? "text-primary-500" : "text-gray-600"
                    }`}
                  >
                    Date de début*
                  </label>
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.startDate}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="date"
                    name="endDate"
                    value={reservationData.endDate}
                    onChange={handleChange}
                    onFocus={() => handleFocus("endDate")}
                    onBlur={() => handleBlur("endDate")}
                    min={
                      reservationData.startDate
                        ? new Date(
                            new Date(reservationData.startDate).getTime() +
                              86400000,
                          )
                            .toISOString()
                            .split("T")[0]
                        : new Date(new Date().getTime() + 86400000)
                            .toISOString()
                            .split("T")[0]
                    }
                    required
                    className={`w-full px-3.5 sm:px-4 py-3 border rounded-lg focus:border-primary-500 transition-all duration-300 bg-gray-50 focus:bg-white text-black focus:text-primary-500 peer focus:outline-none text-sm sm:text-base ${
                      errors.endDate ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder=" "
                  />
                  <label
                    className={`absolute text-xs -top-2 left-2 bg-white px-2 z-0 transition-colors duration-300 pointer-events-none ${
                      focused.endDate ? "text-primary-500" : "text-gray-600"
                    }`}
                  >
                    Date de fin*
                  </label>
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Options Section - Only show if dates are selected */}
            {reservationData.startDate && reservationData.endDate && (
              <>
                {/* Services */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
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
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                    Services supplémentaires
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <label className="flex items-center gap-3 p-2.5 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={options.airport_delivery}
                        onChange={(e) =>
                          handleOptionChange(
                            "airport_delivery",
                            e.target.checked,
                          )
                        }
                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {pricingConfig?.add_ons?.airport_delivery
                            ?.display_name || "airport_delivery"}
                        </div>
                        <div className="text-sm text-gray-600">
                          {pricingConfig?.add_ons?.airport_delivery
                            ? `+${pricingConfig.add_ons.airport_delivery.value} DT (unique)`
                            : "Tarif indisponible"}
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-2.5 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={options.home_delivery}
                        onChange={(e) =>
                          handleOptionChange("home_delivery", e.target.checked)
                        }
                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {pricingConfig?.add_ons?.home_delivery
                            ?.display_name || "home_delivery"}
                        </div>
                        <div className="text-sm text-gray-600">
                          {pricingConfig?.add_ons?.home_delivery
                            ? `+${pricingConfig.add_ons.home_delivery.value} DT (unique)`
                            : "Tarif indisponible"}
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-2.5 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors md:col-span-2">
                      <input
                        type="checkbox"
                        checked={options.after_hours_pickup}
                        onChange={(e) =>
                          handleOptionChange(
                            "after_hours_pickup",
                            e.target.checked,
                          )
                        }
                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {pricingConfig?.add_ons?.after_hours_pickup
                            ?.display_name || "after_hours_pickup"}
                        </div>
                        <div className="text-sm text-gray-600">
                          {pricingConfig?.add_ons?.after_hours_pickup
                            ? `+${pricingConfig.add_ons.after_hours_pickup.value} DT (unique)`
                            : "Tarif indisponible"}
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Price Summary */}
                {pricing && (
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-2xl p-4 sm:p-6 space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
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
                          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      Détail du prix
                    </h4>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {vehicle?.price} DT/jour × {pricing.days} jour
                          {pricing.days > 1 ? "s" : ""}
                        </span>
                        <span className="font-medium text-gray-900">
                          {pricing.base_total.toFixed(2)} DT
                        </span>
                      </div>

                      {pricing.airport_delivery > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {pricingConfig?.add_ons?.airport_delivery
                              ?.display_name || "airport_delivery"}
                          </span>
                          <span className="font-medium text-gray-900">
                            +{pricing.airport_delivery} DT
                          </span>
                        </div>
                      )}

                      {pricing.home_delivery > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {pricingConfig?.add_ons?.home_delivery
                              ?.display_name || "home_delivery"}
                          </span>
                          <span className="font-medium text-gray-900">
                            +{pricing.home_delivery} DT
                          </span>
                        </div>
                      )}

                      {pricing.after_hours > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {pricingConfig?.add_ons?.after_hours_pickup
                              ?.display_name || "after_hours_pickup"}
                          </span>
                          <span className="font-medium text-gray-900">
                            +{pricing.after_hours} DT
                          </span>
                        </div>
                      )}

                      <div className="border-t border-primary-200 my-3 pt-3">
                        <div className="flex justify-between items-center gap-3">
                          <span className="text-lg font-bold text-gray-900">
                            Total
                          </span>
                          <span className="text-xl sm:text-2xl font-bold text-primary-600 text-right break-words">
                            {pricing.total.toFixed(2)} DT
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Personal Info */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Informations personnelles*
              </h4>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    name="fullName"
                    value={reservationData.fullName}
                    onChange={handleChange}
                    onBlur={() => handleBlur("fullName")}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:border-primary-500 transition-all duration-300 bg-gray-50 focus:bg-white text-black peer focus:outline-none text-sm sm:text-base ${
                      errors.fullName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder=" "
                  />
                  <label className="absolute left-4 top-3 text-black text-sm transition-all duration-300 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-2 peer-focus:bg-white peer-focus:px-2 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-black pointer-events-none">
                    Nom complet*
                  </label>
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={reservationData.email}
                      onChange={handleChange}
                      onBlur={() => handleBlur("email")}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:border-primary-500 transition-all duration-300 bg-gray-50 focus:bg-white text-black peer focus:outline-none text-sm sm:text-base ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder=" "
                    />
                    <label className="absolute left-4 top-3 text-black text-sm transition-all duration-300 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-2 peer-focus:bg-white peer-focus:px-2 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-black pointer-events-none">
                      Email*
                    </label>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={reservationData.phone}
                      onChange={handleChange}
                      onBlur={() => handleBlur("phone")}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:border-primary-500 transition-all duration-300 bg-gray-50 focus:bg-white text-black peer focus:outline-none text-sm sm:text-base ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder=" "
                    />
                    <label className="absolute left-4 top-3 text-black text-sm transition-all duration-300 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-2 peer-focus:bg-white peer-focus:px-2 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-black pointer-events-none">
                      Téléphone*
                    </label>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contract Information */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Informations du contrat
              </h4>
              <p className="mb-3 text-xs text-gray-500">
                Le conducteur est le locataire. Les informations conducteur
                seront reprises automatiquement depuis vos informations
                personnelles.
              </p>
              <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                <div className="relative">
                  <input
                    type="date"
                    name="client_birth_date"
                    value={reservationData.client_birth_date}
                    onChange={handleChange}
                    onBlur={() => handleBlur("client_birth_date")}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:border-primary-500 transition-all duration-300 bg-gray-50 focus:bg-white text-black peer focus:outline-none text-sm sm:text-base ${
                      errors.client_birth_date
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder=" "
                  />
                  <label className="absolute left-4 top-3 text-black text-sm transition-all duration-300 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-2 peer-focus:bg-white peer-focus:px-2 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-black pointer-events-none">
                    Date de naissance du client*
                  </label>
                  {errors.client_birth_date && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.client_birth_date}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <div className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-sm sm:text-base text-gray-900">
                    {Number(vehicle?.caution_amount || 0).toFixed(2)} DT
                  </div>
                  <label className="absolute left-4 -top-2 bg-white px-2 text-xs text-gray-600 pointer-events-none">
                    Montant de la caution (DT) défini par l'agence
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    name="driver_license_number"
                    value={reservationData.driver_license_number}
                    onChange={handleChange}
                    onBlur={() => handleBlur("driver_license_number")}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:border-primary-500 transition-all duration-300 bg-gray-50 focus:bg-white text-black peer focus:outline-none text-sm sm:text-base ${
                      errors.driver_license_number
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder=" "
                  />
                  <label className="absolute left-4 top-3 text-black text-sm transition-all duration-300 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-2 peer-focus:bg-white peer-focus:px-2 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-black pointer-events-none">
                    Numéro du permis du locataire*
                  </label>
                  {errors.driver_license_number && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.driver_license_number}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="date"
                    name="driver_license_date"
                    value={reservationData.driver_license_date}
                    onChange={handleChange}
                    onBlur={() => handleBlur("driver_license_date")}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:border-primary-500 transition-all duration-300 bg-gray-50 focus:bg-white text-black peer focus:outline-none text-sm sm:text-base ${
                      errors.driver_license_date
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder=" "
                  />
                  <label className="absolute left-4 top-3 text-black text-sm transition-all duration-300 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-2 peer-focus:bg-white peer-focus:px-2 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-black pointer-events-none">
                    Date d'obtention du permis du locataire*
                  </label>
                  {errors.driver_license_date && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.driver_license_date}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Agency Info */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Agence de retrait
              </p>
              <p className="text-gray-900 font-medium">{vehicle.agency.name}</p>
              <p className="text-gray-600 text-sm break-words">
                {vehicle.agency.address}
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold text-sm sm:text-base"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!isFormValid}
                className={`w-full sm:flex-1 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all text-sm sm:text-base ${
                  isFormValid
                    ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 hover:shadow-xl"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {pricing
                  ? `Réserver pour ${pricing.total.toFixed(2)} DT`
                  : "Confirmer la réservation"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;
