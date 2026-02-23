import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/api";

const ProfileSettingsModal = ({ isOpen, onClose }) => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    driver_license: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation functions
  const validateEmail = (email) => {
    if (!email) return "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Format d'email invalide";
    }
    return "";
  };

  const validatePhone = (phone) => {
    if (!phone) return "";
    const phoneRegex = /^\d{8}$/;
    if (!phoneRegex.test(phone)) {
      return "Le numéro doit contenir exactement 8 chiffres";
    }
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "";
    const hasUppercase = /[A-Z]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < 8) {
      return "Le mot de passe doit contenir au moins 8 caractères";
    }
    if (!hasUppercase) {
      return "Le mot de passe doit contenir au moins une lettre majuscule";
    }
    if (!hasSymbol) {
      return "Le mot de passe doit contenir au moins un symbole (!@#$%^&*...)";
    }
    return "";
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });
    setErrors({ ...errors, email: validateEmail(value) });
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only digits
    if (value.length <= 8) {
      setFormData({ ...formData, phone: value });
      setErrors({ ...errors, phone: validatePhone(value) });
    }
  };

  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, newPassword: value });
    setErrors({ ...errors, newPassword: validatePassword(value) });
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, confirmPassword: value });
    if (formData.newPassword && value !== formData.newPassword) {
      setErrors({
        ...errors,
        confirmPassword: "Les mots de passe ne correspondent pas",
      });
    } else {
      setErrors({ ...errors, confirmPassword: "" });
    }
  };

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        driver_license: user.driver_license || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    // Validate email and phone
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);

    if (emailError || phoneError) {
      setErrors({
        ...errors,
        email: emailError,
        phone: phoneError,
      });
      setErrorMessage("Veuillez corriger les erreurs dans le formulaire");
      setLoading(false);
      return;
    }

    // Validate passwords if changing
    if (formData.newPassword) {
      const passwordError = validatePassword(formData.newPassword);

      if (passwordError) {
        setErrors({ ...errors, newPassword: passwordError });
        setErrorMessage(
          "Le nouveau mot de passe ne respecte pas les critères requis",
        );
        setLoading(false);
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setErrors({
          ...errors,
          confirmPassword: "Les nouveaux mots de passe ne correspondent pas",
        });
        setErrorMessage("Les nouveaux mots de passe ne correspondent pas");
        setLoading(false);
        return;
      }

      if (!formData.currentPassword) {
        setErrorMessage(
          "Veuillez entrer votre mot de passe actuel pour le changer",
        );
        setLoading(false);
        return;
      }
    }

    try {
      // Prepare data to send to API
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        driver_license: formData.driver_license,
      };

      // Only include password fields if changing password
      if (formData.newPassword) {
        updateData.current_password = formData.currentPassword;
        updateData.new_password = formData.newPassword;
      }

      // Call the API
      const response = await authService.updateProfile(updateData);

      setSuccessMessage(response.message || "Profil mis à jour avec succès !");
      await refreshUser();

      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      // Clear any errors
      setErrors({
        email: "",
        phone: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Erreur de mise à jour:", error);

      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        setErrors({
          email: backendErrors.email?.[0] || "",
          phone: backendErrors.phone?.[0] || "",
          newPassword: backendErrors.new_password?.[0] || "",
          confirmPassword: "",
        });
      }

      setErrorMessage(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour du profil",
      );
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = () => {
    const colors = {
      client: "bg-blue-100 text-blue-800",
      agency_admin: "bg-purple-100 text-purple-800",
      super_admin: "bg-red-100 text-red-800",
    };
    return colors[user?.role] || "bg-gray-100 text-gray-800";
  };

  const getRoleLabel = () => {
    const labels = {
      client: "Client",
      agency_admin: "Administrateur Agence",
      super_admin: "Super Administrateur",
    };
    return labels[user?.role] || "Utilisateur";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Paramètres du Profil
                </h2>
                <p className="text-primary-100 text-sm mt-1">
                  Modifiez vos informations personnelles
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
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

          {/* User Info Badge */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : "U"}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user?.name}</p>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor()}`}
                >
                  {getRoleLabel()}
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Success/Error Messages */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {errorMessage}
              </div>
            )}

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informations Personnelles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    required
                    className="w-full px-5 py-3 rounded-full bg-gray-50 border-2 border-gray-200 focus:border-primary-500 focus:outline-none focus:bg-white transition-all hover:border-primary-300 peer"
                    placeholder=" "
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                  <label
                    htmlFor="name"
                    className="absolute left-5 top-3 text-gray-500 text-sm transition-all duration-300 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-gray-700 pointer-events-none"
                  >
                    Nom complet
                  </label>
                </div>

                {/* Email */}
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    className={`w-full px-5 py-3 rounded-full bg-gray-50 border-2 ${
                      errors.email
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 focus:border-primary-500"
                    } focus:outline-none focus:bg-white transition-all hover:border-primary-300 peer`}
                    placeholder=" "
                    value={formData.email}
                    onChange={handleEmailChange}
                  />
                  <label
                    htmlFor="email"
                    className={`absolute left-5 top-3 text-sm transition-all duration-300 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 pointer-events-none ${
                      errors.email
                        ? "text-red-500 peer-focus:text-red-500 peer-[:not(:placeholder-shown)]:text-red-500"
                        : "text-gray-500 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-gray-700"
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

                {/* Phone */}
                <div className="relative">
                  <input
                    id="phone"
                    type="tel"
                    className={`w-full px-5 py-3 rounded-full bg-gray-50 border-2 ${
                      errors.phone
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 focus:border-primary-500"
                    } focus:outline-none focus:bg-white transition-all hover:border-primary-300 peer`}
                    placeholder=" "
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    maxLength={8}
                  />
                  <label
                    htmlFor="phone"
                    className={`absolute left-5 top-3 text-sm transition-all duration-300 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 pointer-events-none ${
                      errors.phone
                        ? "text-red-500 peer-focus:text-red-500 peer-[:not(:placeholder-shown)]:text-red-500"
                        : "text-gray-500 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-gray-700"
                    }`}
                  >
                    Téléphone (8 chiffres)
                  </label>
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1 ml-5">
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Driver License - Only for clients */}
                {user?.role === "client" && (
                  <div className="relative">
                    <input
                      id="driver_license"
                      type="text"
                      className="w-full px-5 py-3 rounded-full bg-gray-50 border-2 border-gray-200 focus:border-primary-500 focus:outline-none focus:bg-white transition-all hover:border-primary-300 peer"
                      placeholder=" "
                      value={formData.driver_license}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          driver_license: e.target.value,
                        })
                      }
                    />
                    <label
                      htmlFor="driver_license"
                      className="absolute left-5 top-3 text-gray-500 text-sm transition-all duration-300 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-gray-700 pointer-events-none"
                    >
                      Permis de conduire
                    </label>
                  </div>
                )}

                {/* Address */}
                <div
                  className={`relative ${user?.role === "client" ? "" : "md:col-span-2"}`}
                >
                  <textarea
                    id="address"
                    rows="2"
                    className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-2 border-gray-200 focus:border-primary-500 focus:outline-none focus:bg-white transition-all hover:border-primary-300 peer resize-none"
                    placeholder=" "
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                  <label
                    htmlFor="address"
                    className="absolute left-5 top-3 text-gray-500 text-sm transition-all duration-300 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-gray-700 pointer-events-none"
                  >
                    Adresse
                  </label>
                </div>
              </div>
            </div>

            {/* Password Change */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Changer le Mot de Passe
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Laissez vide si vous ne souhaitez pas changer votre mot de passe
              </p>
              <div className="space-y-4">
                {/* Current Password */}
                <div className="relative">
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    className="w-full px-5 py-3 pr-12 rounded-full bg-gray-50 border-2 border-gray-200 focus:border-primary-500 focus:outline-none focus:bg-white transition-all hover:border-primary-300 peer"
                    placeholder=" "
                    value={formData.currentPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentPassword: e.target.value,
                      })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-3 text-gray-500 hover:text-primary-600 transition-colors"
                  >
                    {showCurrentPassword ? (
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
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                  <label
                    htmlFor="currentPassword"
                    className="absolute left-5 top-3 text-gray-500 text-sm transition-all duration-300 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-gray-700 pointer-events-none"
                  >
                    Mot de passe actuel
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* New Password */}
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      className={`w-full px-5 py-3 pr-12 rounded-full bg-gray-50 border-2 ${
                        errors.newPassword
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-200 focus:border-primary-500"
                      } focus:outline-none focus:bg-white transition-all hover:border-primary-300 peer`}
                      placeholder=" "
                      value={formData.newPassword}
                      onChange={handleNewPasswordChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-3 text-gray-500 hover:text-primary-600 transition-colors"
                    >
                      {showNewPassword ? (
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
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                    <label
                      htmlFor="newPassword"
                      className={`absolute left-5 top-3 text-sm transition-all duration-300 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 pointer-events-none ${
                        errors.newPassword
                          ? "text-red-500 peer-focus:text-red-500 peer-[:not(:placeholder-shown)]:text-red-500"
                          : "text-gray-500 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-gray-700"
                      }`}
                    >
                      Nouveau mot de passe
                    </label>
                    {errors.newPassword && (
                      <p className="text-red-500 text-xs mt-1 ml-5">
                        {errors.newPassword}
                      </p>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      className={`w-full px-5 py-3 pr-12 rounded-full bg-gray-50 border-2 ${
                        errors.confirmPassword
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-200 focus:border-primary-500"
                      } focus:outline-none focus:bg-white transition-all hover:border-primary-300 peer`}
                      placeholder=" "
                      value={formData.confirmPassword}
                      onChange={handleConfirmPasswordChange}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-3 text-gray-500 hover:text-primary-600 transition-colors"
                    >
                      {showConfirmPassword ? (
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
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                    <label
                      htmlFor="confirmPassword"
                      className={`absolute left-5 top-3 text-sm transition-all duration-300 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 pointer-events-none ${
                        errors.confirmPassword
                          ? "text-red-500 peer-focus:text-red-500 peer-[:not(:placeholder-shown)]:text-red-500"
                          : "text-gray-500 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-gray-700"
                      }`}
                    >
                      Confirmer le nouveau mot de passe
                    </label>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1 ml-5">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
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
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProfileSettingsModal;
