import React, { useState } from "react";
import ResolveReportModal from "./ResolveReportModal";
import ConfirmationModal from "./ConfirmationModal";

const ReportDetailsModal = ({
  isOpen,
  onClose,
  report,
  onResolve,
  onDismiss,
  onDelete,
}) => {
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
      case "resolved":
        return "bg-green-100 text-green-800";
      case "dismissed":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "resolved":
        return "Résolu";
      case "dismissed":
        return "Rejeté";
      case "pending":
        return "En attente";
      default:
        return status;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-t-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {getReportTypeIcon(report.reportType)}
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Signalement #{report.id}
                </h2>
                <p className="text-red-100 text-sm">
                  {report.reportType === "vehicle"
                    ? "Véhicule"
                    : report.reportType === "agency"
                      ? "Agence"
                      : "Client"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadge(report.status)}`}
            >
              {getStatusLabel(report.status)}
            </span>
            <span className="text-sm text-gray-500">
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

          {/* Report Details */}
          <div className="grid gap-4">
            {/* Target Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Signalé
              </label>
              <p className="text-gray-900 font-medium">{report.targetName}</p>
              {report.targetId && (
                <p className="text-sm text-gray-500">ID: {report.targetId}</p>
              )}
            </div>

            {/* Reporter Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Signalé par
              </label>
              <p className="text-gray-900">
                {report.reportedBy || "Utilisateur"}
              </p>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Raison
              </label>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                <p className="text-gray-900 font-medium">{report.reason}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description détaillée
              </label>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {report.description}
                </p>
              </div>
            </div>

            {/* Admin Notes (if resolved or dismissed) */}
            {report.adminNotes && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes administratives
                </label>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-gray-700">{report.adminNotes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons (only if pending) */}
          {report.status === "pending" && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  setResolveModal({ isOpen: true, type: "resolve" });
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg flex items-center justify-center gap-2"
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Résoudre
              </button>
              <button
                onClick={() => {
                  setResolveModal({ isOpen: true, type: "dismiss" });
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg flex items-center justify-center gap-2"
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
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
                Rejeter
              </button>
              <button
                onClick={() => {
                  setDeleteConfirmModal(true);
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg flex items-center justify-center gap-2"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Supprimer
              </button>
            </div>
          )}

          {/* Close button for resolved/dismissed */}
          {report.status !== "pending" && (
            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fermer
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
        title="Déplacer vers la corbeille ?"
        message={`Êtes-vous sûr de vouloir déplacer le signalement "${report?.targetName}" vers la corbeille ? Il sera automatiquement supprimé après 30 jours.`}
        confirmText="Déplacer vers la corbeille"
        cancelText="Annuler"
        danger={true}
      />
    </div>
  );
};

export default ReportDetailsModal;
