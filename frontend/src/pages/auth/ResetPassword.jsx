import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import http from "../../services/http";
import useScrollAnimation from "../../hooks/useScrollAnimation";

const ResetPassword = () => {
  const formAnim = useScrollAnimation({ threshold: 0.2 });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const initialToken = query.get("token") || "";
  const initialEmail = query.get("email") || "";

  const [token] = useState(initialToken);
  const [email] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // no-op: token/email are read from query params
  }, [token, email]);

  const validatePassword = (value) => {
    if (!value) return "";
    const hasUppercase = /[A-Z]/.test(value);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    if (value.length < 8) return t("auth.register.errors.passwordLength");
    if (!hasUppercase) return t("auth.register.errors.passwordUppercase");
    if (!hasSymbol) return t("auth.register.errors.passwordSymbol");
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ password: "", confirmPassword: "" });

    const pwErr = validatePassword(password);
    const confirmErr =
      password !== confirmPassword
        ? t("auth.register.errors.passwordMismatch")
        : "";

    if (pwErr || confirmErr) {
      setErrors({ password: pwErr, confirmPassword: confirmErr });
      return;
    }

    if (!token || !email) {
      setErrors({ ...errors, confirmPassword: t("auth.reset.missingToken") });
      return;
    }

    setLoading(true);
    try {
      await http.post("/reset-password", {
        email,
        token,
        password,
        password_confirmation: confirmPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1600);
    } catch (err) {
      const msg = err.response?.data?.message || t("auth.reset.error");
      setErrors({ ...errors, confirmPassword: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-12 relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-between w-full text-white">
          <div>
            <Link to="/" className="inline-flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <img src="/logo.png" alt={t("app.name")} className="w-7 h-7" />
              </div>
              <span className="text-2xl font-bold">{t("app.name")}</span>
            </Link>
          </div>

          <div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              {t("auth.reset.title")}
            </h1>
            <p className="text-xl text-primary-100 leading-relaxed">
              {t("auth.reset.subtitle")}
            </p>
          </div>

          <div className="text-sm text-primary-200">{t("app.copyright")}</div>
        </div>
      </div>

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
                <img src="/logo.png" alt={t("app.name")} className="w-7 h-7" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                {t("app.name")}
              </span>
            </Link>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              {t("auth.reset.formTitle")}
            </h2>
            <p className="text-gray-600">{t("auth.reset.formSubtitle")}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100">
            {success ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {t("auth.reset.successTitle")}
                </h3>
                <p className="text-gray-600">{t("auth.reset.successDesc")}</p>
                <Link to="/login" className="text-primary-600 font-semibold">
                  {t("auth.reset.backToLogin")}
                </Link>
              </div>
            ) : (
              <form className="p-8 space-y-6" onSubmit={handleSubmit}>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full px-5 py-3 rounded-full bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-primary-500 focus:bg-white transition-all hover:border-primary-300 peer"
                    placeholder=" "
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label
                    htmlFor="password"
                    className="absolute left-5 top-3 text-gray-500 text-sm transition-all duration-300 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-focus:text-primary-500 pointer-events-none"
                  >
                    {t("auth.register.passwordLabel")}
                  </label>
                </div>
                {errors.password && (
                  <div className="text-sm text-red-600">{errors.password}</div>
                )}

                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full px-5 py-3 rounded-full bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-primary-500 focus:bg-white transition-all hover:border-primary-300 peer"
                    placeholder=" "
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <label
                    htmlFor="confirmPassword"
                    className="absolute left-5 top-3 text-gray-500 text-sm transition-all duration-300 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-focus:text-primary-500 pointer-events-none"
                  >
                    {t("auth.register.confirmPasswordLabel")}
                  </label>
                </div>
                {errors.confirmPassword && (
                  <div className="text-sm text-red-600">
                    {errors.confirmPassword}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={showPassword}
                      onChange={() => setShowPassword(!showPassword)}
                      className="h-4 w-4"
                    />
                    {t("auth.register.showPassword")}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  {t("auth.reset.submitButton")}
                </button>

                {!token || !email ? (
                  <p className="text-sm text-gray-500 text-center">
                    {t("auth.reset.noToken")}.{" "}
                    <Link to="/forgot-password" className="text-primary-600">
                      {t("auth.reset.requestLink")}
                    </Link>
                  </p>
                ) : null}
              </form>
            )}
          </div>

          <p className="text-center text-sm text-gray-600">
            <Link
              to="/login"
              className="font-semibold text-primary-600 hover:text-primary-700 transition-colors inline-flex items-center gap-2"
            >
              {t("auth.reset.backLoginLink")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
