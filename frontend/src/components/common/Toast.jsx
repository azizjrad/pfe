import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function Toast({
  message,
  messageKey,
  messageValues,
  type = "success",
  isVisible,
  onClose,
  duration = 3000,
}) {
  const { t } = useTranslation();

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const fallbackMessages = {
    success: t("common.toast.success"),
    error: t("common.toast.error"),
    info: t("common.toast.info"),
  };

  const resolvedMessage = messageKey
    ? t(messageKey, messageValues)
    : message || fallbackMessages[type] || fallbackMessages.info;

  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
        ? "bg-red-500"
        : "bg-blue-500";
  const icon =
    type === "success" ? (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ) : (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    );

  const iconBg =
    type === "success"
      ? "from-green-500 to-emerald-600"
      : type === "error"
        ? "from-red-500 to-red-600"
        : "from-blue-500 to-blue-600";

  return (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-[9999] animate-slideInRight pointer-events-none">
      <div className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 w-full sm:w-auto sm:min-w-[320px] max-w-[560px] ml-auto pointer-events-auto">
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${iconBg} flex items-center justify-center flex-shrink-0 shadow-lg`}
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {icon}
          </svg>
        </div>
        <p className="font-semibold text-gray-800 flex-1">{resolvedMessage}</p>
        <button
          onClick={onClose}
          aria-label={t("common.close")}
          title={t("common.close")}
          className="text-gray-400 hover:text-gray-600 transition-colors"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
