import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

const ReportModal = ({
  isOpen,
  onClose,
  reportType, // 'vehicle', 'agency', or 'client'
  reportTarget, // { id, name } - the object being reported
  onSubmit,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    reason: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({ reason: "", description: "" });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Get dynamic content based on report type
  const getReportContent = () => {
    switch (reportType) {
      case "vehicle":
        return {
          title: "Signaler un véhicule",
          subtitle: `Signaler: ${reportTarget?.name || "ce véhicule"}`,
          reasons: [
            "Informations incorrectes",
            "Photos trompeuses",
            "Prix incorrect",
            "Véhicule indisponible",
            "État du véhicule non conforme",
            "Problèmes de sécurité",
            "Autre",
          ],
        };
      case "agency":
        return {
          title: "Signaler une agence",
          subtitle: `Signaler: ${reportTarget?.name || "cette agence"}`,
          reasons: [
            "Service client médiocre",
            "Informations de contact incorrectes",
            "Pratiques commerciales douteuses",
            "Non-respect des conditions",
            "Arnaque ou fraude",
            "Véhicules mal entretenus",
            "Autre",
          ],
        };
      case "client":
        return {
          title: "Signaler un client",
          subtitle: `Signaler: ${reportTarget?.name || "ce client"}`,
          reasons: [
            "Non-paiement",
            "Retard de retour",
            "Dommages au véhicule",
            "Comportement inapproprié",
            "Violation des conditions",
            "Documents falsifiés",
            "Autre",
          ],
        };
      default:
        return {
          title: "Signaler un problème",
          subtitle: "",
          reasons: ["Autre"],
        };
    }
  };

  const content = getReportContent();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.reason) {
      newErrors.reason = "Veuillez sélectionner une raison";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Veuillez décrire le problème";
    } else if (formData.description.trim().length < 20) {
      newErrors.description =
        "La description doit contenir au moins 20 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const reportData = {
        reportType,
        targetId: reportTarget?.id,
        targetName: reportTarget?.name,
        reason: formData.reason,
        description: formData.description,
        reportedBy: user?.name || user?.email,
        reportedAt: new Date().toISOString(),
      };

      if (onSubmit) {
        await onSubmit(reportData);
      }

      // Success - close modal
      onClose();
    } catch (error) {
      console.error("Report submission error:", error);
      setErrors({
        submit: "Erreur lors de l'envoi du signalement. Veuillez réessayer.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-[min(100vw-1rem,42rem)] sm:w-full max-w-xl lg:max-w-2xl max-h-[88vh] overflow-y-auto overflow-x-hidden animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 p-4 sm:p-5 rounded-t-xl">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-white mb-1">
                {content.title}
              </h2>
              <p className="text-red-100 text-xs sm:text-sm break-words">
                {content.subtitle}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors disabled:opacity-50"
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
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-4 sm:space-y-6"
        >
          {/* Warning Message */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 sm:p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs sm:text-sm text-yellow-700">
                  Les signalements abusifs peuvent entraîner la suspension de
                  votre compte. Veuillez ne signaler que des problèmes réels et
                  vérifiables.
                </p>
              </div>
            </div>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Raison du signalement <span className="text-red-500">*</span>
            </label>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className={`w-full px-4 py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                errors.reason
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 bg-white"
              }`}
              disabled={isSubmitting}
            >
              <option value="">Sélectionnez une raison...</option>
              {content.reasons.map((reason, index) => (
                <option key={index} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Description détaillée <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              placeholder="Décrivez en détail le problème que vous signalez. Plus votre description est précise, mieux nous pourrons traiter votre signalement."
              className={`w-full px-4 py-3 text-sm sm:text-base leading-relaxed placeholder:text-sm sm:placeholder:text-base placeholder:leading-snug border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none ${
                errors.description
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 bg-white"
              }`}
              disabled={isSubmitting}
            />
            <div className="flex items-center justify-between mt-1">
              {errors.description ? (
                <p className="text-xs sm:text-sm text-red-600">
                  {errors.description}
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-gray-500">
                  Minimum 20 caractères
                </p>
              )}
              <p className="text-xs sm:text-sm text-gray-400">
                {formData.description.length}/500
              </p>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3 sm:p-4 rounded-md">
              <p className="text-xs sm:text-sm text-red-700">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-3 sm:px-5 py-2.5 sm:py-3 border border-gray-300 text-gray-700 text-sm sm:text-base font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-3 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm sm:text-base font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Envoi en cours...
                </>
              ) : (
                <>
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Envoyer le signalement
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
