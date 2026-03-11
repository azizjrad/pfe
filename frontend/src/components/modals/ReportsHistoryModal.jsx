import React from "react";

const ReportsHistoryModal = ({ isOpen, onClose, resolvedReports }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-t-3xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
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
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Historique des Signalements Résolus
                </h3>
                <p className="text-green-100 text-sm">
                  {resolvedReports.length} signalement(s) résolu(s)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
            >
              <svg
                className="w-6 h-6 text-white"
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

        {/* Body */}
        <div className="p-6">
          {resolvedReports.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto text-gray-300 mb-4"
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
              <p className="text-gray-500 text-lg">
                Aucun signalement résolu pour le moment
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {resolvedReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {report.reportType === "vehicle"
                            ? "Véhicule"
                            : report.reportType === "agency"
                              ? "Agence"
                              : "Client"}
                        </span>
                        <h4 className="font-bold text-gray-900 text-lg">
                          {report.targetName}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Signalé par:</span>{" "}
                        {report.reportedBy}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Raison:</span>{" "}
                        {report.reason}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Résolu
                      </span>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(
                          report.resolvedAt || report.reportedAt,
                        ).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>

                  {report.description && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-3">
                      <p className="text-sm text-gray-700 font-medium mb-1">
                        Description:
                      </p>
                      <p className="text-sm text-gray-600">
                        {report.description}
                      </p>
                    </div>
                  )}

                  {report.adminNotes && (
                    <div className="bg-green-50 rounded-xl p-4 border-l-4 border-green-500">
                      <p className="text-sm text-green-700 font-medium mb-1 flex items-center gap-2">
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
                        Notes administratives:
                      </p>
                      <p className="text-sm text-green-600">
                        {report.adminNotes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl p-6 border-t border-white/40 rounded-b-3xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-semibold"
          >
            Fermer
          </button>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out;
          }
          
          .animate-scaleIn {
            animation: scaleIn 0.2s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ReportsHistoryModal;
