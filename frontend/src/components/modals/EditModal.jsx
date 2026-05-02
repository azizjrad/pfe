import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ROLES } from "../../constants/roles";

export default function EditModal({
  isOpen,
  onClose,
  onSave,
  item,
  type, // 'user' or 'agency'
  agencies = [], // For user role agency_admin
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [focusedFields, setFocusedFields] = useState({});

  const handleFocus = (fieldName) => {
    setFocusedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  const handleBlur = (fieldName) => {
    setFocusedFields((prev) => ({ ...prev, [fieldName]: false }));
  };

  useEffect(() => {
    if (item) {
      const nextFormData = { ...item };
      if (!nextFormData.id && nextFormData.role === ROLES.AGENCY_ADMIN) {
        nextFormData.agency_option = nextFormData.agency_option || "existing";
      }
      setFormData(nextFormData);
      setOriginalData({ ...item });
      setFocusedFields({}); // Reset focused fields when modal opens
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "role") {
        if (value === ROLES.AGENCY_ADMIN) {
          return {
            ...prev,
            role: value,
            agency_option: prev.agency_option || "existing",
          };
        }

        return {
          ...prev,
          role: value,
          agency_option: "existing",
          agency_id: "",
          agency_name: "",
          agency_address: "",
          agency_city: "",
          agency_phone: "",
          agency_email: "",
          agency_opening_time: "",
          agency_closing_time: "",
        };
      }

      if (name === "agency_option") {
        if (value === "new") {
          return {
            ...prev,
            agency_option: value,
            agency_id: "",
          };
        }

        return {
          ...prev,
          agency_option: value,
          agency_name: "",
          agency_address: "",
          agency_city: "",
          agency_phone: "",
          agency_email: "",
          agency_opening_time: "",
          agency_closing_time: "",
        };
      }

      return { ...prev, [name]: value };
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (type === "user") {
      if (!formData.name?.trim())
        newErrors.name = t("modals.edit.errors.nameRequired");
      if (!formData.email?.trim())
        newErrors.email = t("modals.edit.errors.emailRequired");
      if (!formData.phone?.trim())
        newErrors.phone = t("modals.edit.errors.phoneRequired");
      if (!formData.role) newErrors.role = t("modals.edit.errors.roleRequired");
      if (formData.role === ROLES.AGENCY_ADMIN) {
        const useNewAgency = !formData.id && formData.agency_option === "new";

        if (useNewAgency) {
          if (!formData.agency_name?.trim()) {
            newErrors.agency_name = "Le nom de l'agence est obligatoire";
          }
        } else if (!formData.agency_id) {
          newErrors.agency_id = t("modals.edit.errors.agencyRequired");
        }
      }
      if (!formData.id && formData.role === ROLES.CLIENT) {
        if (!formData.password?.trim()) {
          newErrors.password = t("modals.edit.errors.passwordRequired");
        } else if (String(formData.password).length < 6) {
          newErrors.password = t("modals.edit.errors.passwordMinLength");
        }
      }
    } else if (type === "agency") {
      if (!formData.name?.trim())
        newErrors.name = t("modals.edit.errors.nameRequired");
      if (!formData.address?.trim())
        newErrors.address = t("modals.edit.errors.addressRequired");
      if (!formData.phone?.trim())
        newErrors.phone = t("modals.edit.errors.phoneRequired");
      if (!formData.email?.trim())
        newErrors.email = t("modals.edit.errors.emailRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hasChanges = () => {
    // Compare relevant fields based on type
    const fieldsToCompare =
      type === "user"
        ? [
            "name",
            "email",
            "phone",
            "role",
            "agency_id",
            "agency_option",
            "agency_name",
            "agency_address",
            "agency_city",
            "agency_phone",
            "agency_email",
            "agency_opening_time",
            "agency_closing_time",
          ]
        : ["name", "address", "phone", "email"];

    return fieldsToCompare.some(
      (field) =>
        String(formData[field] || "").trim() !==
        String(originalData[field] || "").trim(),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const noChangesMessage = t("modals.edit.errors.noChanges");

    if (!validate()) return;

    // Check if any changes were made
    if (!hasChanges()) {
      setErrors({
        submit: noChangesMessage,
      });
      setTimeout(() => {
        onClose();
      }, 1500);
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData };

      if (
        type === "user" &&
        !payload.id &&
        payload.role === ROLES.AGENCY_ADMIN
      ) {
        payload.agency_option = payload.agency_option || "existing";

        if (payload.agency_option === "new") {
          payload.agency = {
            name: payload.agency_name,
            address: payload.agency_address,
            city: payload.agency_city,
            phone: payload.agency_phone,
            email: payload.agency_email,
            opening_time: payload.agency_opening_time || null,
            closing_time: payload.agency_closing_time || null,
          };
          payload.agency_id = null;
        }
      }

      await onSave(payload);
      onClose();
    } catch (error) {
      console.error("Error saving:", error);
      setErrors({
        submit: error.response?.data?.message || t("errors.genericError"),
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
                {type === "user"
                  ? t("modals.edit.titleUser")
                  : t("modals.edit.titleAgency")}
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
                errors.submit === t("modals.edit.errors.noChanges")
                  ? "bg-blue-50 border-l-4 border-blue-500"
                  : "bg-red-50 border-l-4 border-red-500"
              } p-4 rounded`}
            >
              <p
                className={`text-sm ${
                  errors.submit === t("modals.edit.errors.noChanges")
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
                  {t("common.name")}
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
                  {t("common.phone")}
                </label>
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1 ml-5">
                    {errors.phone}
                  </p>
                )}
              </div>

              {!formData.id && formData.role === ROLES.CLIENT && (
                <div className="relative">
                  <input
                    id="user-password"
                    type="password"
                    name="password"
                    value={formData.password || ""}
                    onChange={handleChange}
                    onFocus={() => handleFocus("password")}
                    onBlur={() => handleBlur("password")}
                    className={`w-full px-5 py-3 rounded-full bg-gray-50 border-2 ${
                      errors.password
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 focus:border-primary-500"
                    } focus:outline-none focus:bg-white transition-all hover:border-primary-300`}
                    placeholder=" "
                  />
                  <label
                    htmlFor="user-password"
                    className={`absolute left-5 transition-all duration-300 pointer-events-none ${
                      focusedFields.password || formData.password
                        ? "text-xs -top-2 left-3 bg-white px-2"
                        : "text-sm top-3"
                    } ${
                      errors.password
                        ? "text-red-500"
                        : focusedFields.password
                          ? "text-primary-500"
                          : formData.password
                            ? "text-gray-700"
                            : "text-gray-500"
                    }`}
                  >
                    {t("auth.register.passwordLabel")}
                  </label>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1 ml-5">
                      {errors.password}
                    </p>
                  )}
                </div>
              )}

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
                  <option value="">{t("modals.edit.selectRole")}</option>
                  <option value={ROLES.CLIENT}>{t("roles.client")}</option>
                  <option value={ROLES.AGENCY_ADMIN}>
                    {t("roles.agency_admin")}
                  </option>
                  <option value={ROLES.SUPER_ADMIN}>
                    {t("roles.super_admin")}
                  </option>
                </select>
                <label
                  htmlFor="user-role"
                  className="absolute left-5 -top-2 text-xs bg-white px-2 text-gray-700 pointer-events-none"
                >
                  {t("modals.edit.role")}
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

              {formData.role === ROLES.AGENCY_ADMIN && (
                <>
                  {!formData.id && (
                    <div className="relative">
                      <select
                        id="user-agency-option"
                        name="agency_option"
                        value={formData.agency_option || "existing"}
                        onChange={handleChange}
                        className="w-full px-5 py-3 rounded-full bg-gray-50 border-2 border-gray-200 focus:border-primary-500 focus:outline-none focus:bg-white transition-all hover:border-primary-300 appearance-none cursor-pointer"
                      >
                        <option value="existing">
                          Selectionner une agence existante
                        </option>
                        <option value="new">Creer une nouvelle agence</option>
                      </select>
                      <label
                        htmlFor="user-agency-option"
                        className="absolute left-5 -top-2 text-xs bg-white px-2 text-gray-700 pointer-events-none"
                      >
                        Mode agence
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
                    </div>
                  )}

                  {formData.id || formData.agency_option !== "new" ? (
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
                        <option value="">
                          {t("modals.edit.selectAgency")}
                        </option>
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
                        {t("reports.type.agency")}
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
                      {!formData.id && (
                        <p className="text-xs text-amber-700 mt-2 ml-5">
                          Si l'agence selectionnee a deja un admin agence, ce
                          compte sera supprime et remplace.
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <input
                          id="agency-name-new"
                          type="text"
                          name="agency_name"
                          value={formData.agency_name || ""}
                          onChange={handleChange}
                          className={`w-full px-5 py-3 rounded-full bg-gray-50 border-2 ${
                            errors.agency_name
                              ? "border-red-500 focus:border-red-500"
                              : "border-gray-200 focus:border-primary-500"
                          } focus:outline-none focus:bg-white transition-all hover:border-primary-300`}
                          placeholder="Nom de l'agence"
                        />
                        {errors.agency_name && (
                          <p className="text-red-500 text-xs mt-1 ml-5">
                            {errors.agency_name}
                          </p>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          name="agency_address"
                          value={formData.agency_address || ""}
                          onChange={handleChange}
                          className="w-full px-5 py-3 rounded-full bg-gray-50 border-2 border-gray-200 focus:border-primary-500 focus:outline-none focus:bg-white transition-all hover:border-primary-300"
                          placeholder="Adresse de l'agence"
                        />
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          name="agency_city"
                          value={formData.agency_city || ""}
                          onChange={handleChange}
                          className="w-full px-5 py-3 rounded-full bg-gray-50 border-2 border-gray-200 focus:border-primary-500 focus:outline-none focus:bg-white transition-all hover:border-primary-300"
                          placeholder="Ville"
                        />
                      </div>

                      <div className="relative">
                        <input
                          type="tel"
                          name="agency_phone"
                          value={formData.agency_phone || ""}
                          onChange={handleChange}
                          className="w-full px-5 py-3 rounded-full bg-gray-50 border-2 border-gray-200 focus:border-primary-500 focus:outline-none focus:bg-white transition-all hover:border-primary-300"
                          placeholder="Telephone de l'agence"
                        />
                      </div>

                      <div className="relative">
                        <input
                          type="email"
                          name="agency_email"
                          value={formData.agency_email || ""}
                          onChange={handleChange}
                          className="w-full px-5 py-3 rounded-full bg-gray-50 border-2 border-gray-200 focus:border-primary-500 focus:outline-none focus:bg-white transition-all hover:border-primary-300"
                          placeholder="Email de l'agence"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative">
                          <input
                            type="time"
                            name="agency_opening_time"
                            value={formData.agency_opening_time || ""}
                            onChange={handleChange}
                            className="w-full px-5 py-3 rounded-full bg-gray-50 border-2 border-gray-200 focus:border-primary-500 focus:outline-none focus:bg-white transition-all hover:border-primary-300"
                          />
                        </div>
                        <div className="relative">
                          <input
                            type="time"
                            name="agency_closing_time"
                            value={formData.agency_closing_time || ""}
                            onChange={handleChange}
                            className="w-full px-5 py-3 rounded-full bg-gray-50 border-2 border-gray-200 focus:border-primary-500 focus:outline-none focus:bg-white transition-all hover:border-primary-300"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </>
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
                  {t("modals.vehicleModal.name")}
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
                  {t("common.address")}
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
                  {t("common.phone")}
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
              {t("common.cancel")}
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
              {t("common.save")}
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
