import React, { useState, useEffect } from "react";

export default function EditModal({
  isOpen,
  onClose,
  onSave,
  item,
  type, // 'user' or 'agency'
  agencies = [], // For user role agency_admin
  reviews = [], // Agency reviews
  userRole = null, // Current user's role
  userId = null, // Current user's ID
  userReservations = [], // Current user's reservations
  onSubmitReview = null, // Callback for submitting a review
}) {
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [focusedFields, setFocusedFields] = useState({});

  const handleFocus = (fieldName) => {
    setFocusedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  const handleBlur = (fieldName) => {
    setFocusedFields((prev) => ({ ...prev, [fieldName]: false }));
  };

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
      setOriginalData({ ...item });
      setFocusedFields({}); // Reset focused fields when modal opens
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (type === "user") {
      if (!formData.name?.trim()) newErrors.name = "Le nom est requis";
      if (!formData.email?.trim()) newErrors.email = "L'email est requis";
      if (!formData.phone?.trim()) newErrors.phone = "Le téléphone est requis";
      if (!formData.role) newErrors.role = "Le rôle est requis";
      if (formData.role === "agency_admin" && !formData.agency_id) {
        newErrors.agency_id = "L'agence est requise pour un admin d'agence";
      }
    } else if (type === "agency") {
      if (!formData.name?.trim()) newErrors.name = "Le nom est requis";
      if (!formData.address?.trim())
        newErrors.address = "L'adresse est requise";
      if (!formData.phone?.trim()) newErrors.phone = "Le téléphone est requis";
      if (!formData.email?.trim()) newErrors.email = "L'email est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hasChanges = () => {
    // Compare relevant fields based on type
    const fieldsToCompare =
      type === "user"
        ? ["name", "email", "phone", "role", "agency_id"]
        : ["name", "address", "phone", "email"];

    return fieldsToCompare.some(
      (field) =>
        String(formData[field] || "").trim() !==
        String(originalData[field] || "").trim(),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    // Check if any changes were made
    if (!hasChanges()) {
      setErrors({
        submit: "Aucune modification détectée",
      });
      setTimeout(() => {
        onClose();
      }, 1500);
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving:", error);
      setErrors({
        submit: error.response?.data?.message || "Une erreur est survenue",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl p-6 border-b border-white/40 z-10 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Modifier {type === "user" ? "l'utilisateur" : "l'agence"}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.submit && (
            <div
              className={`${
                errors.submit === "Aucune modification détectée"
                  ? "bg-blue-50 border-l-4 border-blue-500"
                  : "bg-red-50 border-l-4 border-red-500"
              } p-4 rounded`}
            >
              <p
                className={`text-sm ${
                  errors.submit === "Aucune modification détectée"
                    ? "text-blue-700"
                    : "text-red-700"
                }`}
              >
                {errors.submit}
              </p>
            </div>
          )}

          {type === "user" ? (
            <>
              {/* User Fields */}
              <div className="relative">
                <input
                  id="user-name"
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  onFocus={() => handleFocus("name")}
                  onBlur={() => handleBlur("name")}
                  className={`w-full px-5 py-3 rounded-full bg-gray-50 border-2 ${
                    errors.name
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-primary-500"
                  } focus:outline-none focus:bg-white transition-all hover:border-primary-300`}
                  placeholder=" "
                />
                <label
                  htmlFor="user-name"
                  className={`absolute left-5 transition-all duration-300 pointer-events-none ${
                    focusedFields.name || formData.name
                      ? "text-xs -top-2 left-3 bg-white px-2"
                      : "text-sm top-3"
                  } ${
                    errors.name
                      ? "text-red-500"
                      : focusedFields.name
                        ? "text-primary-500"
                        : formData.name
                          ? "text-gray-700"
                          : "text-gray-500"
                  }`}
                >
                  Nom complet
                </label>
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 ml-5">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  id="user-email"
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  onFocus={() => handleFocus("email")}
                  onBlur={() => handleBlur("email")}
                  className={`w-full px-5 py-3 rounded-full bg-gray-50 border-2 ${
                    errors.email
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-primary-500"
                  } focus:outline-none focus:bg-white transition-all hover:border-primary-300`}
                  placeholder=" "
                />
                <label
                  htmlFor="user-email"
                  className={`absolute left-5 transition-all duration-300 pointer-events-none ${
                    focusedFields.email || formData.email
                      ? "text-xs -top-2 left-3 bg-white px-2"
                      : "text-sm top-3"
                  } ${
                    errors.email
                      ? "text-red-500"
                      : focusedFields.email
                        ? "text-primary-500"
                        : formData.email
                          ? "text-gray-700"
                          : "text-gray-500"
                  }`}
                >
                  Email
                </label>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 ml-5">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  id="user-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  onFocus={() => handleFocus("phone")}
                  onBlur={() => handleBlur("phone")}
                  className={`w-full px-5 py-3 rounded-full bg-gray-50 border-2 ${
                    errors.phone
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-primary-500"
                  } focus:outline-none focus:bg-white transition-all hover:border-primary-300`}
                  placeholder=" "
                />
                <label
                  htmlFor="user-phone"
                  className={`absolute left-5 transition-all duration-300 pointer-events-none ${
                    focusedFields.phone || formData.phone
                      ? "text-xs -top-2 left-3 bg-white px-2"
                      : "text-sm top-3"
                  } ${
                    errors.phone
                      ? "text-red-500"
                      : focusedFields.phone
                        ? "text-primary-500"
                        : formData.phone
                          ? "text-gray-700"
                          : "text-gray-500"
                  }`}
                >
                  Téléphone
                </label>
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1 ml-5">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className="relative">
                <select
                  id="user-role"
                  name="role"
                  value={formData.role || ""}
                  onChange={handleChange}
                  className={`w-full px-5 py-3 rounded-full bg-gray-50 border-2 ${
                    errors.role
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-primary-500"
                  } focus:outline-none focus:bg-white transition-all hover:border-primary-300 appearance-none cursor-pointer`}
                >
                  <option value="">Sélectionner un rôle</option>
                  <option value="client">Client</option>
                  <option value="agency_admin">Admin d'agence</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                <label
                  htmlFor="user-role"
                  className="absolute left-5 -top-2 text-xs bg-white px-2 text-gray-700 pointer-events-none"
                >
                  Rôle
                </label>
                <svg
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
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
                {errors.role && (
                  <p className="text-red-500 text-xs mt-1 ml-5">
                    {errors.role}
                  </p>
                )}
              </div>

              {formData.role === "agency_admin" && (
                <div className="relative">
                  <select
                    id="user-agency"
                    name="agency_id"
                    value={formData.agency_id || ""}
                    onChange={handleChange}
                    className={`w-full px-5 py-3 rounded-full bg-gray-50 border-2 ${
                      errors.agency_id
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 focus:border-primary-500"
                    } focus:outline-none focus:bg-white transition-all hover:border-primary-300 appearance-none cursor-pointer`}
                  >
                    <option value="">Sélectionner une agence</option>
                    {agencies.map((agency) => (
                      <option key={agency.id} value={agency.id}>
                        {agency.name}
                      </option>
                    ))}
                  </select>
                  <label
                    htmlFor="user-agency"
                    className="absolute left-5 -top-2 text-xs bg-white px-2 text-gray-700 pointer-events-none"
                  >
                    Agence
                  </label>
                  <svg
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
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
                  {errors.agency_id && (
                    <p className="text-red-500 text-xs mt-1 ml-5">
                      {errors.agency_id}
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Agency Fields */}
              <div className="relative">
                <input
                  id="agency-name"
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  onFocus={() => handleFocus("name")}
                  onBlur={() => handleBlur("name")}
                  className={`w-full px-5 py-3 rounded-full bg-gray-50 border-2 ${
                    errors.name
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-primary-500"
                  } focus:outline-none focus:bg-white transition-all hover:border-primary-300`}
                  placeholder=" "
                />
                <label
                  htmlFor="agency-name"
                  className={`absolute left-5 transition-all duration-300 pointer-events-none ${
                    focusedFields.name || formData.name
                      ? "text-xs -top-2 left-3 bg-white px-2"
                      : "text-sm top-3"
                  } ${
                    errors.name
                      ? "text-red-500"
                      : focusedFields.name
                        ? "text-primary-500"
                        : formData.name
                          ? "text-gray-700"
                          : "text-gray-500"
                  }`}
                >
                  Nom de l'agence
                </label>
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 ml-5">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  id="agency-address"
                  type="text"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleChange}
                  onFocus={() => handleFocus("address")}
                  onBlur={() => handleBlur("address")}
                  className={`w-full px-5 py-3 rounded-full bg-gray-50 border-2 ${
                    errors.address
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-primary-500"
                  } focus:outline-none focus:bg-white transition-all hover:border-primary-300`}
                  placeholder=" "
                />
                <label
                  htmlFor="agency-address"
                  className={`absolute left-5 transition-all duration-300 pointer-events-none ${
                    focusedFields.address || formData.address
                      ? "text-xs -top-2 left-3 bg-white px-2"
                      : "text-sm top-3"
                  } ${
                    errors.address
                      ? "text-red-500"
                      : focusedFields.address
                        ? "text-primary-500"
                        : formData.address
                          ? "text-gray-700"
                          : "text-gray-500"
                  }`}
                >
                  Adresse
                </label>
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1 ml-5">
                    {errors.address}
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  id="agency-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  onFocus={() => handleFocus("phone")}
                  onBlur={() => handleBlur("phone")}
                  className={`w-full px-5 py-3 rounded-full bg-gray-50 border-2 ${
                    errors.phone
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-primary-500"
                  } focus:outline-none focus:bg-white transition-all hover:border-primary-300`}
                  placeholder=" "
                />
                <label
                  htmlFor="agency-phone"
                  className={`absolute left-5 transition-all duration-300 pointer-events-none ${
                    focusedFields.phone || formData.phone
                      ? "text-xs -top-2 left-3 bg-white px-2"
                      : "text-sm top-3"
                  } ${
                    errors.phone
                      ? "text-red-500"
                      : focusedFields.phone
                        ? "text-primary-500"
                        : formData.phone
                          ? "text-gray-700"
                          : "text-gray-500"
                  }`}
                >
                  Téléphone
                </label>
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1 ml-5">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  id="agency-email"
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  onFocus={() => handleFocus("email")}
                  onBlur={() => handleBlur("email")}
                  className={`w-full px-5 py-3 rounded-full bg-gray-50 border-2 ${
                    errors.email
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-primary-500"
                  } focus:outline-none focus:bg-white transition-all hover:border-primary-300`}
                  placeholder=" "
                />
                <label
                  htmlFor="agency-email"
                  className={`absolute left-5 transition-all duration-300 pointer-events-none ${
                    focusedFields.email || formData.email
                      ? "text-xs -top-2 left-3 bg-white px-2"
                      : "text-sm top-3"
                  } ${
                    errors.email
                      ? "text-red-500"
                      : focusedFields.email
                        ? "text-primary-500"
                        : formData.email
                          ? "text-gray-700"
                          : "text-gray-500"
                  }`}
                >
                  Email
                </label>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 ml-5">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Reviews Section for Agency */}
              {formData.id && (
                <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
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
                                      star <=
                                      Math.round(
                                        reviews.reduce(
                                          (acc, r) => acc + r.rating,
                                          0,
                                        ) / reviews.length,
                                      )
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
                                {(
                                  reviews.reduce(
                                    (acc, r) => acc + r.rating,
                                    0,
                                  ) / reviews.length
                                ).toFixed(1)}
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
                    {userRole === "client" &&
                      userId &&
                      (() => {
                        // Check if user has completed reservations with this agency
                        const hasCompletedReservation = userReservations.some(
                          (res) =>
                            res.agency_id === formData.id &&
                            res.status === "completed",
                        );
                        // Check if user already reviewed this agency
                        const hasReviewed = reviews.some(
                          (rev) => rev.user_id === userId,
                        );

                        return (
                          hasCompletedReservation &&
                          !hasReviewed &&
                          !showReviewForm && (
                            <button
                              type="button"
                              onClick={() => setShowReviewForm(true)}
                              className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-md"
                            >
                              Laisser un avis
                            </button>
                          )
                        );
                      })()}
                  </div>

                  {/* Review Submission Form */}
                  {showReviewForm && userRole === "client" && (
                    <div className="mb-4 p-4 bg-white rounded-lg border border-blue-300">
                      <h5 className="font-semibold text-gray-900 mb-3">
                        Votre avis
                      </h5>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Note
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() =>
                                setReviewData({ ...reviewData, rating: star })
                              }
                              className="transition-transform hover:scale-110"
                            >
                              <svg
                                className={`w-8 h-8 ${
                                  star <= reviewData.rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Commentaire
                        </label>
                        <textarea
                          value={reviewData.comment}
                          onChange={(e) =>
                            setReviewData({
                              ...reviewData,
                              comment: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Partagez votre expérience..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            if (!reviewData.comment.trim()) {
                              alert("Veuillez ajouter un commentaire");
                              return;
                            }
                            setSubmittingReview(true);
                            try {
                              await onSubmitReview({
                                agency_id: formData.id,
                                rating: reviewData.rating,
                                comment: reviewData.comment,
                              });
                              setShowReviewForm(false);
                              setReviewData({ rating: 5, comment: "" });
                            } catch (error) {
                              console.error("Error submitting review:", error);
                            } finally {
                              setSubmittingReview(false);
                            }
                          }}
                          disabled={submittingReview}
                          className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                        >
                          {submittingReview ? "Envoi..." : "Soumettre"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowReviewForm(false);
                            setReviewData({ rating: 5, comment: "" });
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {reviews.length > 0 ? (
                      reviews.map((review) => (
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
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-8">
                        Aucun avis pour le moment
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-white/40">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl font-semibold text-gray-700 bg-white/60 hover:bg-white/80 border border-gray-200 transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
            >
              {loading && (
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              Enregistrer
            </button>
          </div>
        </form>
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
