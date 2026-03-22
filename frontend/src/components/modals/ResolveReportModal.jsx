import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const ResolveReportModal = ({ isOpen, onClose, report, onConfirm, type }) => {
  const { t } = useTranslation();
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = () => {
    if (notes.trim()) {
      onConfirm(report, notes);
      setNotes("");
      onClose();
    }
  };

  const isResolve = type === "resolve";
  const headerColor = isResolve
    ? "from-green-600 to-green-700"
    : "from-gray-600 to-gray-700";
  const buttonColor = isResolve
    ? "from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
    : "from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800";

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`bg-gradient-to-r ${headerColor} p-6 rounded-t-xl text-white`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isResolve ? (
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
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                )}
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {isResolve
                  ? t("modals.resolveReport.title")
                  : t("modals.resolveReport.dismissTitle")}
              </h3>
              <p className="text-sm opacity-90">
                {t("modals.reportDetails.title", { id: report?.id })}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Report Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600">{t("reports.submit")}</p>
            <p className="font-medium text-gray-900">{report?.targetName}</p>
            <p className="text-sm text-gray-500 mt-1">{report?.reason}</p>
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t("reports.adminNotes")} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                isResolve
                  ? t("modals.resolveReport.notesPlaceholder")
                  : t("modals.resolveReport.dismissPlaceholder")
              }
              rows={5}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              {t("modals.resolveReport.notesHint")}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!notes.trim()}
              className={`flex-1 px-4 py-3 bg-gradient-to-r ${buttonColor} text-white font-medium rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {t("common.confirm")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResolveReportModal;
