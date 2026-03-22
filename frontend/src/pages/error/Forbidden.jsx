import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Forbidden() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4">
      <div className="text-center">
        {/* Animated Error Code */}
        <div className="relative">
          <h1 className="text-[200px] md:text-[280px] font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600 leading-none animate-pulse">
            403
          </h1>
          <div className="absolute inset-0 text-[200px] md:text-[280px] font-black text-primary-200 blur-2xl opacity-30 leading-none">
            403
          </div>
        </div>

        {/* Message */}
        <div className="mt-4 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            {t("errors.forbidden.title")}
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            {t("errors.forbidden.message")}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
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
          </button>
        </div>
      </div>
    </div>
  );
}
