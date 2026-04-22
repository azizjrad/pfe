import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const VehicleCard = ({
  vehicle,
  index = 0,
  isVisible = true,
  onClick,
  className = "",
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleCardClick = () => {
    navigate(`/vehicle/${vehicle.id}`);
  };

  return (
    <div
      className={`group relative w-full h-[470px] sm:h-[520px] bg-white/95 border border-slate-200 rounded-3xl shadow-[0_12px_28px_rgba(15,23,42,0.08)] hover:shadow-[0_18px_40px_rgba(15,23,42,0.14)] transition-all duration-500 overflow-hidden snap-start cursor-pointer ${className}`}
      style={{
        animation: isVisible
          ? `slideUp 0.6s ease-out ${index * 100}ms both`
          : "none",
      }}
      onClick={onClick || handleCardClick}
    >
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-700 via-primary-500 to-sky-500" />
      <div className="absolute top-10 -right-16 w-40 h-40 rounded-full bg-primary-100/50 blur-2xl" />

      <div className="p-5 sm:p-6 h-full flex flex-col relative">
        {/* Vehicle Image */}
        <div className="relative h-44 sm:h-52 mb-4 sm:mb-5 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
          <img
            src={
              vehicle.images && vehicle.images.length > 0
                ? vehicle.images[0]
                : vehicle.image || "/default-car.jpg"
            }
            alt={vehicle.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />

          <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200">
            {vehicle.status || "Disponible"}
          </div>

          {/* Agency Badge */}
          {vehicle.agency && (
            <div className="absolute bottom-3 left-3 bg-slate-900/75 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 max-w-[85%]">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span className="text-xs font-medium text-white truncate">
                {vehicle.agency.name}
              </span>
            </div>
          )}
        </div>

        {/* Vehicle Name */}
        <h3 className="text-lg sm:text-2xl font-black text-slate-900 mb-3 text-left flex-shrink-0 break-words leading-tight">
          {vehicle.name}
        </h3>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
            {vehicle.transmission || "Automatique"}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-100">
            {vehicle.fuel || "Essence"}
          </span>
        </div>

        {/* Price */}
        <div className="mb-5 sm:mb-6 flex-shrink-0 rounded-2xl border border-primary-100 bg-gradient-to-r from-primary-50 to-sky-50 p-3">
          <p className="text-xs uppercase tracking-[0.1em] text-primary-700 font-semibold mb-1">
            Tarification
          </p>
          <div className="flex items-end gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {vehicle.price} {t("common.currency")}
            </span>
            <span className="text-slate-600 text-sm mb-1">
              {t("vehicles.card.perDay")}
            </span>
          </div>
        </div>

        {/* Spacer to push button to bottom */}
        <div className="flex-grow"></div>

        {/* Reserve Button */}
        <button className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl hover:from-primary-700 hover:to-primary-800 transition-all text-sm sm:text-base font-semibold flex-shrink-0">
          <span className="inline-flex items-center justify-center gap-2">
            {t("vehicles.card.reserve")}
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
};

export default VehicleCard;
