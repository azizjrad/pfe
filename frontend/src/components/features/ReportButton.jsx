import React, { useState } from "react";
import ReportModal from "../modals/ReportModal";
import { useTranslation } from "react-i18next";

const ReportButton = ({
  reportType, // 'vehicle', 'agency', or 'client'
  reportTarget, // { id, name }
  variant = "icon", // 'icon', 'text', or 'full'
  className = "",
  onReportSubmit,
}) => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { t } = useTranslation();

  const handleReportClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsReportModalOpen(true);
  };

  const handleReportSubmit = async (reportData) => {
    if (onReportSubmit) {
      await onReportSubmit(reportData);
    }
  };

  // Render different button styles based on variant
  const renderButton = () => {
    switch (variant) {
      case "icon":
        return (
          <button
            onClick={handleReportClick}
            className={`p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all ${className}`}
            title={t("reports.button.icon")}
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
                d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
              />
            </svg>
          </button>
        );

      case "text":
        return (
          <button
            onClick={handleReportClick}
            className={`text-sm text-gray-600 hover:text-red-600 transition-colors flex items-center gap-1 ${className}`}
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
                d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
              />
            </svg>
            <span>{t("reports.button.text")}</span>
          </button>
        );

      case "full":
        return (
          <button
            onClick={handleReportClick}
            className={`px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-all flex items-center gap-2 font-medium ${className}`}
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
                d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
              />
            </svg>
            <span>{t("reports.button.full")}</span>
          </button>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {renderButton()}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportType={reportType}
        reportTarget={reportTarget}
        onSubmit={handleReportSubmit}
      />
    </>
  );
};

export default ReportButton;
