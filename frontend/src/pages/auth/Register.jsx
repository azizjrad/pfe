import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import Toast from "../../components/common/Toast";
import useScrollAnimation from "../../hooks/useScrollAnimation";
import { ROLES } from "../../constants/roles";

const Register = () => {
  const formAnim = useScrollAnimation({ threshold: 0.2 });
  const navigate = useNavigate();
  const { t } = useTranslation();
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
    role: ROLES.CLIENT,
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
      return t("auth.register.errors.emailInvalid");
    }
    return "";
  };

  const validatePhone = (phone) => {
    if (!phone) return "";
    if (!/^\d+$/.test(phone)) {
      return t("auth.register.errors.phoneDigits");
    }
    if (phone.length !== 8) {
      return t("auth.register.errors.phoneLength");
    }
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "";
    const hasUppercase = /[A-Z]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < 8) {
      return t("auth.register.errors.passwordLength");
    }
    if (!hasUppercase) {
      return t("auth.register.errors.passwordUppercase");
    }
    if (!hasSymbol) {
      return t("auth.register.errors.passwordSymbol");
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
        confirmPassword: t("auth.register.errors.passwordMismatch"),
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
        ? t("auth.register.errors.passwordMismatch")
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
      setRegisterError(t("auth.register.errors.agreeTerms"));
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
      if (formData.role === ROLES.AGENCY_ADMIN) {
        registrationData.agency_name = formData.agencyName;
        registrationData.agency_location = formData.agencyLocation;
      }

      const response = await registerUser(registrationData);

      // Show success toast
      showToast(t("auth.register.successMsg"), "success");

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
              <div className="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform">
                <img src="/logo.png" alt={t("app.name")} className="w-7 h-7" />
              </div>
              <span className="text-2xl font-bold">{t("app.name")}</span>
            </Link>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                {t("auth.register.welcomeTitle1")}
                <br />
                {t("app.name")}
              </h1>
              <p className="text-xl text-primary-100 leading-relaxed">
                {t("auth.register.welcomeSubtitle")}
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
                  text: t("auth.login.feature1"),
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
                  text: t("auth.login.feature2"),
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
                  text: t("auth.login.feature3"),
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
                  text: t("auth.login.feature4"),
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
          <div className="text-sm text-primary-200">{t("app.copyright")}</div>
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
              <div className="w-12 h-12 flex items-center justify-center">
                <img src="/logo.png" alt={t("app.name")} className="w-7 h-7" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                {t("app.name")}
              </span>
            </Link>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              {t("auth.register.title")}
            </h2>
            <p className="text-gray-600">{t("auth.register.subtitle")}</p>
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
                    {t("auth.register.firstNameLabel")}
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
                    {t("auth.register.lastNameLabel")}
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
                  {t("auth.register.emailLabel")}
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
                  {t("auth.register.phoneLabel")}
                </label>
                {showTooltip.phone && !errors.phone && (
                  <div className="absolute left-0 -bottom-7 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg z-10">
                    {t("auth.register.phoneFormat")}
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
                  {t("auth.register.accountType")}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, role: ROLES.CLIENT })
                      }
                      onMouseEnter={() =>
                        setShowTooltip({ ...showTooltip, client: true })
                      }
                      onMouseLeave={() =>
                        setShowTooltip({ ...showTooltip, client: false })
                      }
                      className={`w-full relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                        formData.role === ROLES.CLIENT
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 bg-gray-50 hover:border-primary-300"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          formData.role === ROLES.CLIENT
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
                          formData.role === ROLES.CLIENT
                            ? "text-primary-700"
                            : "text-gray-600"
                        }`}
                      >
                        {t("auth.register.client")}
                      </span>
                      {formData.role === ROLES.CLIENT && (
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
                        {t("auth.register.clientTooltip")}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, role: ROLES.AGENCY_ADMIN })
                      }
                      onMouseEnter={() =>
                        setShowTooltip({ ...showTooltip, agency: true })
                      }
                      onMouseLeave={() =>
                        setShowTooltip({ ...showTooltip, agency: false })
                      }
                      className={`w-full relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                        formData.role === ROLES.AGENCY_ADMIN
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 bg-gray-50 hover:border-primary-300"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          formData.role === ROLES.AGENCY_ADMIN
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
                          formData.role === ROLES.AGENCY_ADMIN
                            ? "text-primary-700"
                            : "text-gray-600"
                        }`}
                      >
                        {t("auth.register.agency")}
                      </span>
                      {formData.role === ROLES.AGENCY_ADMIN && (
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
                        {t("auth.register.agencyTooltip")}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Champs conditionnels pour Client */}
              {formData.role === ROLES.CLIENT && (
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
                      {t("auth.register.addressOptional")}
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
                      {t("auth.register.driverLicenseOptional")}
                    </label>
                  </div>
                </>
              )}

              {/* Champs conditionnels pour Agence */}
              {formData.role === ROLES.AGENCY_ADMIN && (
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
                      {t("auth.register.agencyName")}
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
                      {t("auth.register.agencyLocation")}
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
                      {t("auth.register.agencyAddress")}
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
                  {t("auth.register.passwordLabel")}
                </label>
                {showTooltip.password && !errors.password && (
                  <div className="absolute left-0 -bottom-16 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg z-10 w-64">
                    <p className="font-semibold mb-1">
                      {t("auth.register.passwordHelpTitle")}
                    </p>
                    <ul className="space-y-0.5">
                      <li>• {t("auth.register.passwordHelpLength")}</li>
                      <li>• {t("auth.register.passwordHelpUppercase")}</li>
                      <li>• {t("auth.register.passwordHelpSymbol")}</li>
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
                  {t("auth.register.confirmPasswordLabel")}
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
                    {t("auth.register.termsText")}{" "}
                    <Link
                      to="/terms-of-service"
                      className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                    >
                      {t("auth.register.termsLink")}
                    </Link>{" "}
                    {t("auth.register.andText")}{" "}
                    <Link
                      to="/privacy-policy"
                      className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                    >
                      {t("auth.register.privacyLink")}
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
                    {t("auth.register.submitting")}
                  </span>
                ) : (
                  t("auth.register.submitButton")
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-white text-gray-400 font-medium">
                    {t("auth.register.orRegisterWith")}
                  </span>
                </div>
              </div>
            </form>
          </div>

          <p className="text-center text-sm text-gray-600">
            {t("auth.register.alreadyHaveAccount")}{" "}
            <Link
              to="/login"
              className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              {t("auth.register.loginLink")}
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
              {t("auth.register.returnHome")}
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
