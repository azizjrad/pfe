import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useScrollAnimation from "../../hooks/useScrollAnimation";

const ForgotPassword = () => {
  const formAnim = useScrollAnimation({ threshold: 0.2 });
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
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
                <img src="/logo.png" alt={t("app.name")} className="w-7 h-7" />
              </div>
              <span className="text-2xl font-bold">{t("app.name")}</span>
            </Link>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-5xl font-bold mb-6 leading-tight whitespace-pre-line">
                {t("auth.forgotPassword.title").replace(" ", "\n")}
              </h1>
              <p className="text-xl text-primary-100 leading-relaxed">
                {t("auth.forgotPassword.subtitle")}
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
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  ),
                  text: t("auth.forgotPassword.feature1"),
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
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  ),
                  text: t("auth.forgotPassword.feature2"),
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                  text: t("auth.forgotPassword.feature3"),
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
                        d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  ),
                  text: t("auth.forgotPassword.feature4"),
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

      {/* Right Side - Forgot Password Form */}
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
              {t("auth.forgotPassword.formTitle")}
            </h2>
            <p className="text-gray-600">
              {t("auth.forgotPassword.formSubtitle")}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100">
            {!isSubmitted ? (
              <form className="p-8 space-y-6" onSubmit={handleSubmit}>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="w-full px-5 py-3 rounded-full bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-primary-500 focus:bg-white transition-all hover:border-primary-300 peer"
                    placeholder=" "
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <label
                    htmlFor="email"
                    className="absolute left-5 top-3 text-gray-500 text-sm transition-all duration-300 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-gray-700 pointer-events-none"
                  >
                    {t("auth.forgotPassword.emailLabel")}
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={!email.trim()}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                  {t("auth.forgotPassword.submitButton")}
                </button>
              </form>
            ) : (
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
                  {t("auth.forgotPassword.successTitle")}
                </h3>
                <p className="text-gray-600">
                  {t("auth.forgotPassword.successDesc1")}{" "}
                  <span className="font-semibold text-primary-600">
                    {email}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  {t("auth.forgotPassword.successDesc2")}
                </p>
              </div>
            )}
          </div>

          <p className="text-center text-sm text-gray-600">
            <Link
              to="/login"
              className="font-semibold text-primary-600 hover:text-primary-700 transition-colors inline-flex items-center gap-2"
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
              {t("auth.forgotPassword.backToLogin")}
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              {t("common.backHome")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
