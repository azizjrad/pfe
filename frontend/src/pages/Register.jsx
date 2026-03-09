import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Toast from "../components/Toast";
import useScrollAnimation from "../hooks/useScrollAnimation";

const Register = () => {
  const formAnim = useScrollAnimation({ threshold: 0.2 });
  const navigate = useNavigate();
  const {
    register: registerUser,
    error: authError,
    user,
    isAuthenticated,
  } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [user, isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "client",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    address: "",
    driverLicense: "",
    agencyName: "",
    agencyLocation: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const [showTooltip, setShowTooltip] = useState({
    password: false,
    phone: false,
    client: false,
    agency: false,
  });

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "";
    if (!emailRegex.test(email)) {
      return "Adresse e-mail invalide";
    }
    return "";
  };

  const validatePhone = (phone) => {
    if (!phone) return "";
    if (!/^\d+$/.test(phone)) {
      return "Le numéro doit contenir uniquement des chiffres";
    }
    if (phone.length !== 8) {
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
    const email = e.target.value;
    setFormData({ ...formData, email });
    setErrors({ ...errors, email: validateEmail(email) });
  };

  const handlePhoneChange = (e) => {
    const phone = e.target.value.replace(/\D/g, "").slice(0, 8);
    setFormData({ ...formData, phone });
    setErrors({ ...errors, phone: validatePhone(phone) });
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData({ ...formData, password });
    setErrors({ ...errors, password: validatePassword(password) });
  };

  const handleConfirmPasswordChange = (e) => {
    const confirmPassword = e.target.value;
    setFormData({ ...formData, confirmPassword });
    if (confirmPassword && confirmPassword !== formData.password) {
      setErrors({
        ...errors,
        confirmPassword: "Les mots de passe ne correspondent pas",
      });
    } else {
      setErrors({ ...errors, confirmPassword: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegisterError("");

    // Validate all fields
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError =
      formData.password !== formData.confirmPassword
        ? "Les mots de passe ne correspondent pas"
        : "";

    if (emailError || phoneError || passwordError || confirmPasswordError) {
      setErrors({
        email: emailError,
        phone: phoneError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
      });
      return;
    }

    if (!formData.agreeToTerms) {
      setRegisterError("Vous devez accepter les conditions d'utilisation");
      return;
    }

    setLoading(true);

    try {
      // Prepare data for API (transform form structure to match backend expectations)
      const registrationData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        role: formData.role,
        phone: formData.phone,
        address: formData.address,
        driver_license: formData.driverLicense,
      };

      // Add agency-specific fields if registering as agency admin
      if (formData.role === "agency_admin") {
        registrationData.agency_name = formData.agencyName;
        registrationData.agency_location = formData.agencyLocation;
      }

      const response = await registerUser(registrationData);

      // Show success toast
      showToast(
        "Compte créé avec succès! Bienvenue chez Elite Drive.",
        "success",
      );

      // Redirect to universal dashboard after brief delay for toast visibility
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage = err.response?.data?.message || "Registration failed";
      setRegisterError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Left Side - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-soft-light opacity-10 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-300 rounded-full mix-blend-soft-light opacity-10 translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 flex flex-col justify-between w-full text-white">
          <div>
            <Link to="/" className="inline-flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <img
                  src="/car-logo.svg"
                  alt="Elite Drive"
                  className="w-7 h-7"
                />
              </div>
              <span className="text-2xl font-bold">Elite Drive</span>
            </Link>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Rejoignez
                <br />
                Elite Drive
              </h1>
              <p className="text-xl text-primary-100 leading-relaxed">
                Créez votre compte et profitez d'une expérience de location
                exceptionnelle
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  icon: (
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                  text: "Réservation rapide en quelques clics",
                },
                {
                  icon: (
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
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                  text: "Meilleurs prix garantis",
                },
                {
                  icon: (
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
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  ),
                  text: "Paiement 100% sécurisé",
                },
                {
                  icon: (
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
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  ),
                  text: "Programme de fidélité exclusif",
                },
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                    {feature.icon}
                  </div>
                  <span className="text-primary-50">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm text-primary-200">
            © 2026 Elite Drive. Tous droits réservés.
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div
          ref={formAnim.ref}
          className={`w-full max-w-md space-y-8 transition-all duration-700 ${formAnim.isVisible ? "animate-fadeIn" : "opacity-0"}`}
        >
          <div className="text-center lg:text-left">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 lg:hidden mb-8"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <img
                  src="/car-logo.svg"
                  alt="Elite Drive"
                  className="w-7 h-7"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Elite Drive
              </span>
            </Link>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Créer un compte
            </h2>
            <p className="text-gray-600">
              Commencez votre voyage avec Elite Drive
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100">
            <form className="p-8 space-y-5" onSubmit={handleSubmit}>
              {/* Messages d'erreur */}
              {(registerError || authError) && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-red-500 mr-2"
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
                      {registerError || authError}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    id="firstName"
                    type="text"
                    required
                    className="w-full px-5 py-3 rounded-full bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-primary-500 focus:bg-white transition-all hover:border-primary-300 peer"
                    placeholder=" "
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                  />
                  <label
                    htmlFor="firstName"
                    className="absolute left-5 top-3 text-gray-500 text-sm transition-all duration-300 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-gray-700 pointer-events-none"
                  >
                    Prénom
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="lastName"
                    type="text"
                    required
                    className="w-full px-5 py-3 rounded-full bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-primary-500 focus:bg-white transition-all hover:border-primary-300 peer"
                    placeholder=" "
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                  />
                  <label
                    htmlFor="lastName"
                    className="absolute left-5 top-3 text-gray-500 text-sm transition-all duration-300 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-gray-700 pointer-events-none"
                  >
                    Nom
                  </label>
                </div>
              </div>

              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
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
                  Adresse e-mail
                </label>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 ml-5">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  id="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  className={`w-full px-5 py-3 rounded-full bg-gray-50 border-2 ${
                    errors.phone
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-primary-500"
                  } focus:outline-none focus:bg-white transition-all hover:border-primary-300 peer`}
                  placeholder=" "
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  onFocus={() =>
                    setShowTooltip({ ...showTooltip, phone: true })
                  }
                  onBlur={() =>
                    setShowTooltip({ ...showTooltip, phone: false })
                  }
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
                  Numéro de téléphone
                </label>
                {showTooltip.phone && !errors.phone && (
                  <div className="absolute left-0 -bottom-7 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg z-10">
                    Format: 8 chiffres (ex: 20123456)
                  </div>
                )}
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1 ml-5">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Type de compte
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, role: "client" })
                      }
                      onMouseEnter={() =>
                        setShowTooltip({ ...showTooltip, client: true })
                      }
                      onMouseLeave={() =>
                        setShowTooltip({ ...showTooltip, client: false })
                      }
                      className={`w-full relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                        formData.role === "client"
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 bg-gray-50 hover:border-primary-300"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          formData.role === "client"
                            ? "bg-primary-500 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
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
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <span
                        className={`font-medium ${
                          formData.role === "client"
                            ? "text-primary-700"
                            : "text-gray-600"
                        }`}
                      >
                        Client
                      </span>
                      {formData.role === "client" && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                    {showTooltip.client && (
                      <div className="absolute left-1/2 -translate-x-1/2 -bottom-16 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg z-10 w-56 text-center">
                        Pour les particuliers souhaitant louer des véhicules
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, role: "agency_admin" })
                      }
                      onMouseEnter={() =>
                        setShowTooltip({ ...showTooltip, agency: true })
                      }
                      onMouseLeave={() =>
                        setShowTooltip({ ...showTooltip, agency: false })
                      }
                      className={`w-full relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                        formData.role === "agency_admin"
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 bg-gray-50 hover:border-primary-300"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          formData.role === "agency_admin"
                            ? "bg-primary-500 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
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
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                      <span
                        className={`font-medium ${
                          formData.role === "agency_admin"
                            ? "text-primary-700"
                            : "text-gray-600"
                        }`}
                      >
                        Agence
                      </span>
                      {formData.role === "agency_admin" && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                    {showTooltip.agency && (
                      <div className="absolute left-1/2 -translate-x-1/2 -bottom-16 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg z-10 w-56 text-center">
                        Pour les agences de location gérant leur flotte de
                        véhicules
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Champs conditionnels pour Client */}
              {formData.role === "client" && (
                <>
                  <div className="relative">
                    <input
                      id="address"
                      type="text"
                      className="w-full px-5 py-3 rounded-full bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-primary-500 focus:bg-white transition-all hover:border-primary-300 peer"
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
                      Adresse (optionnel)
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      id="driverLicense"
                      type="text"
                      className="w-full px-5 py-3 rounded-full bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-primary-500 focus:bg-white transition-all hover:border-primary-300 peer"
                      placeholder=" "
                      value={formData.driverLicense}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          driverLicense: e.target.value,
                        })
                      }
                    />
                    <label
                      htmlFor="driverLicense"
                      className="absolute left-5 top-3 text-gray-500 text-sm transition-all duration-300 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-gray-700 pointer-events-none"
                    >
                      Permis de conduire (optionnel)
                    </label>
                  </div>
                </>
              )}

              {/* Champs conditionnels pour Agence */}
              {formData.role === "agency_admin" && (
                <>
                  <div className="relative">
                    <input
                      id="agencyName"
                      type="text"
                      required
                      className="w-full px-5 py-3 rounded-full bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-primary-500 focus:bg-white transition-all hover:border-primary-300 peer"
                      placeholder=" "
                      value={formData.agencyName}
                      onChange={(e) =>
                        setFormData({ ...formData, agencyName: e.target.value })
                      }
                    />
                    <label
                      htmlFor="agencyName"
                      className="absolute left-5 top-3 text-gray-500 text-sm transition-all duration-300 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-gray-700 pointer-events-none"
                    >
                      Nom de l'agence *
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      id="agencyLocation"
                      type="text"
                      required
                      className="w-full px-5 py-3 rounded-full bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-primary-500 focus:bg-white transition-all hover:border-primary-300 peer"
                      placeholder=" "
                      value={formData.agencyLocation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          agencyLocation: e.target.value,
                        })
                      }
                    />
                    <label
                      htmlFor="agencyLocation"
                      className="absolute left-5 top-3 text-gray-500 text-sm transition-all duration-300 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-gray-700 pointer-events-none"
                    >
                      Localisation de l'agence *
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      id="agencyAddress"
                      type="text"
                      className="w-full px-5 py-3 rounded-full bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-primary-500 focus:bg-white transition-all hover:border-primary-300 peer"
                      placeholder=" "
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                    <label
                      htmlFor="agencyAddress"
                      className="absolute left-5 top-3 text-gray-500 text-sm transition-all duration-300 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-gray-700 pointer-events-none"
                    >
                      Adresse complète (optionnel)
                    </label>
                  </div>
                </>
              )}

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  className={`w-full px-5 py-3 pr-12 rounded-full bg-gray-50 border-2 ${
                    errors.password
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-primary-500"
                  } focus:outline-none focus:bg-white transition-all hover:border-primary-300 peer`}
                  placeholder=" "
                  value={formData.password}
                  onChange={handlePasswordChange}
                  onFocus={() =>
                    setShowTooltip({ ...showTooltip, password: true })
                  }
                  onBlur={() =>
                    setShowTooltip({ ...showTooltip, password: false })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-gray-500 hover:text-primary-600 transition-colors"
                >
                  {showPassword ? (
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
                  htmlFor="password"
                  className={`absolute left-5 top-3 text-sm transition-all duration-300 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 pointer-events-none ${
                    errors.password
                      ? "text-red-500 peer-focus:text-red-500 peer-[:not(:placeholder-shown)]:text-red-500"
                      : "text-gray-500 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-gray-700"
                  }`}
                >
                  Mot de passe
                </label>
                {showTooltip.password && !errors.password && (
                  <div className="absolute left-0 -bottom-16 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg z-10 w-64">
                    <p className="font-semibold mb-1">
                      Le mot de passe doit contenir:
                    </p>
                    <ul className="space-y-0.5">
                      <li>• Au moins 8 caractères</li>
                      <li>• Une lettre majuscule</li>
                      <li>• Un symbole (!@#$%^&*...)</li>
                    </ul>
                  </div>
                )}
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 ml-5">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  Confirmer le mot de passe
                </label>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1 ml-5">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-primary-600 focus:outline-none border-gray-300 rounded"
                    checked={formData.agreeToTerms}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        agreeToTerms: e.target.checked,
                      })
                    }
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-gray-700">
                    J'accepte les{" "}
                    <Link
                      to="/terms-of-service"
                      className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                    >
                      conditions d'utilisation
                    </Link>{" "}
                    et la{" "}
                    <Link
                      to="/privacy-policy"
                      className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                    >
                      politique de confidentialité
                    </Link>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
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
                    Inscription en cours...
                  </span>
                ) : (
                  "Créer mon compte"
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-white text-gray-400 font-medium">
                    OU S'INSCRIRE AVEC
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center px-4 py-2.5 bg-white border-2 border-gray-200 rounded-full hover:border-primary-300 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Google
                  </span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center px-4 py-2.5 bg-white border-2 border-gray-200 rounded-full hover:border-primary-300 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Facebook
                  </span>
                </button>
              </div>
            </form>
          </div>

          <p className="text-center text-sm text-gray-600">
            Vous avez déjà un compte?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              Se connecter
            </Link>
          </p>

          <div className="text-center lg:hidden">
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-primary-600 transition-colors inline-flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </div>
  );
};

export default Register;
