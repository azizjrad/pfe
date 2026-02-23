import React, { useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

/**
 * PriceBreakdown Component
 * Displays detailed dynamic pricing breakdown with collapsible adjustments
 */
const PriceBreakdown = ({ pricing, compact = false }) => {
  const [isExpanded, setIsExpanded] = useState(!compact);

  if (!pricing) {
    return null;
  }

  const {
    base_price,
    rental_days,
    subtotal: initialSubtotal,
    adjustments = [],
    total,
    average_daily_rate,
  } = pricing;

  // Separate adjustments into discounts and premiums
  const discounts = adjustments.filter((adj) => adj.amount < 0);
  const premiums = adjustments.filter((adj) => adj.amount > 0);

  // Calculate total discount and premium amounts
  const totalDiscount = discounts.reduce(
    (sum, adj) => sum + Math.abs(adj.amount),
    0,
  );
  const totalPremium = premiums.reduce((sum, adj) => sum + adj.amount, 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header - Always visible */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Prix final garanti
            </h3>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary-600">
              {total.toFixed(2)} <span className="text-xl">DT</span>
            </div>
            <div className="text-sm text-gray-600">
              {average_daily_rate.toFixed(2)} DT/jour en moyenne
            </div>
          </div>
        </div>

        {/* Summary indicators */}
        <div className="flex items-center justify-between text-sm mt-3 pt-3 border-t border-primary-200">
          <div className="flex gap-4">
            {totalDiscount > 0 && (
              <span className="text-green-700 font-medium">
                ↓ {totalDiscount.toFixed(2)} DT économisés
              </span>
            )}
            {totalPremium > 0 && (
              <span className="text-orange-700 font-medium">
                ↑ {totalPremium.toFixed(2)} DT supplémentaires
              </span>
            )}
          </div>

          {compact && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium"
            >
              {isExpanded ? "Masquer" : "Voir"} les détails
              {isExpanded ? (
                <ChevronUpIcon className="h-4 w-4" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Breakdown details - Collapsible in compact mode */}
      {isExpanded && (
        <div className="p-4 space-y-3">
          {/* Base price */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <div>
              <div className="font-medium text-gray-900">Prix de base</div>
              <div className="text-sm text-gray-500">
                {base_price.toFixed(2)} DT × {rental_days} jour
                {rental_days > 1 ? "s" : ""}
              </div>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {initialSubtotal.toFixed(2)} DT
            </div>
          </div>

          {/* Adjustments */}
          {adjustments.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <InformationCircleIcon className="h-4 w-4" />
                Ajustements dynamiques
              </div>

              {adjustments.map((adjustment, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                    adjustment.amount < 0
                      ? "bg-green-50 border border-green-200"
                      : "bg-orange-50 border border-orange-200"
                  }`}
                >
                  <div className="flex-1">
                    <div
                      className={`text-sm font-medium ${
                        adjustment.amount < 0
                          ? "text-green-800"
                          : "text-orange-800"
                      }`}
                    >
                      {adjustment.label}
                    </div>
                    {adjustment.percentage && (
                      <div className="text-xs text-gray-600">
                        {adjustment.amount < 0 ? "-" : "+"}
                        {adjustment.percentage}%
                      </div>
                    )}
                    {adjustment.multiplier && (
                      <div className="text-xs text-gray-600">
                        Multiplicateur: {adjustment.multiplier}×
                      </div>
                    )}
                  </div>
                  <div
                    className={`text-sm font-bold ${
                      adjustment.amount < 0
                        ? "text-green-700"
                        : "text-orange-700"
                    }`}
                  >
                    {adjustment.amount < 0 ? "" : "+"}
                    {adjustment.amount.toFixed(2)} DT
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Final total summary */}
          <div className="pt-3 border-t-2 border-gray-300">
            <div className="flex items-center justify-between">
              <div className="font-bold text-gray-900">Total final</div>
              <div className="text-2xl font-bold text-primary-600">
                {total.toFixed(2)} DT
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
              Prix garanti - Aucun frais caché
            </div>
          </div>
        </div>
      )}

      {/* Info footer */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
        <p className="text-xs text-gray-600 text-center">
          Les ajustements sont appliqués séquentiellement selon notre politique
          de tarification dynamique.
        </p>
      </div>
    </div>
  );
};

export default PriceBreakdown;
