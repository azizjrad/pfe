import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ResolveReportModal from "./ResolveReportModal";
import ConfirmationModal from "./ConfirmationModal";
import { REPORT_STATUS } from "../../constants/statuses";

const ReportDetailsModal = ({
  isOpen,
  onClose,
  report,
  onResolve,
  onDismiss,
  onDelete,
}) => {
  const { t } = useTranslation();

  const [resolveModal, setResolveModal] = useState({
    isOpen: false,
    type: null,
  });

  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);

  if (!isOpen || !report) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getReportTypeIcon = (type) => {
    switch (type) {
      case "vehicle":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
          />
        );
      case "agency":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        );
      case "client":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        );
      default:
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case REPORT_STATUS.RESOLVED:
        return "bg-green-100 text-green-800";
      case REPORT_STATUS.DISMISSED:
        return "bg-gray-100 text-gray-800";
      case REPORT_STATUS.PENDING:
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case REPORT_STATUS.RESOLVED:
        return t("admin.reports.filter.resolved");
      case REPORT_STATUS.DISMISSED:
        return t("admin.reports.filter.dismissed");
      case REPORT_STATUS.PENDING:
        return t("admin.reports.filter.pending");
      default:
        return status;
    }
  };

  const getReportTypeLabel = (type) => {
    switch (type) {
      case "vehicle":
        return t("reports.type.vehicle");
      case "agency":
        return t("reports.type.agency");
      case "client":
        return t("reports.type.client");
      default:
        return t("roles.user");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-white/70 backdrop-blur-xl border-b border-gray-100/80 px-6 py-5 rounded-t-3xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {getReportTypeIcon(report.reportType)}
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {t("modals.reportDetails.title", { id: report.id })}
                </h2>
                <p className="text-xs text-gray-500">
                  {getReportTypeLabel(report.reportType)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Status + Date */}
          <div className="flex items-center justify-between">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(report.status)}`}
            >
              {getStatusLabel(report.status)}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(
                report.reportedAt || report.created_at,
              ).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {/* Target & Reporter */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-gray-100/80 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1 h-4 bg-red-400 rounded-full inline-block" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t("modals.reportDetails.reportedTarget")}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {report.targetName}
              </p>
              {report.targetId && (
                <p className="text-xs text-gray-400 mt-0.5">
                  ID: {report.targetId}
                </p>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1 h-4 bg-gray-400 rounded-full inline-block" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t("reports.reportedBy")}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {report.reportedBy || t("roles.user")}
              </p>
            </div>
          </div>

          {/* Reason */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-gray-100/80">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1 h-4 bg-amber-400 rounded-full inline-block" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t("reports.reason")}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900">{report.reason}</p>
          </div>

          {/* Description */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-gray-100/80">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1 h-4 bg-primary-400 rounded-full inline-block" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t("modals.reportDetails.descriptionDetailed")}
              </span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {report.description}
            </p>
          </div>

          {/* Admin Notes */}
          {report.adminNotes && (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-blue-100/80">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1 h-4 bg-blue-400 rounded-full inline-block" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t("reports.adminNotes")}
                </span>
              </div>
              <p className="text-sm text-gray-700">{report.adminNotes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/70 backdrop-blur-xl border-t border-gray-100/80 px-5 py-4 rounded-b-3xl">
          {report.status === REPORT_STATUS.PENDING ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() =>
                  setResolveModal({ isOpen: true, type: "resolve" })
                }
                className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {t("admin.reports.resolve")}
              </button>
              <button
                onClick={() =>
                  setResolveModal({ isOpen: true, type: "dismiss" })
                }
                className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
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
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
                {t("admin.reports.dismiss")}
              </button>
              <button
                onClick={() => setDeleteConfirmModal(true)}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                {t("common.delete")}
              </button>
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors"
              >
                {t("common.close")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Resolve/Dismiss Modal */}
      <ResolveReportModal
        isOpen={resolveModal.isOpen}
        onClose={() => setResolveModal({ isOpen: false, type: null })}
        report={report}
        type={resolveModal.type}
        onConfirm={(report, notes) => {
          if (resolveModal.type === "resolve") {
            onResolve && onResolve(report, notes);
          } else if (resolveModal.type === "dismiss") {
            onDismiss && onDismiss(report, notes);
          }
          onClose();
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmModal}
        onClose={() => setDeleteConfirmModal(false)}
        onConfirm={() => {
          onDelete && onDelete(report);
          setDeleteConfirmModal(false);
          onClose();
        }}
        title={t("modals.reportDetails.trashTitle")}
        message={t("modals.reportDetails.trashMessage", {
          targetName: report?.targetName,
        })}
        confirmText={t("admin.reports.delete")}
        cancelText={t("common.cancel")}
        danger={true}
      />
    </div>
  );
};

export default ReportDetailsModal;
