import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { ROLES } from "../../constants/roles";

const VehicleCard = ({
  vehicle,
  index = 0,
  isVisible = true,
  onClick,
  onSaveToggle,
  className = "",
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Check if vehicle is already saved
    if (user && user.role === ROLES.CLIENT) {
      const savedVehicles = JSON.parse(
        localStorage.getItem(`savedVehicles_${user.id}`) || "[]",
      );
      setIsSaved(savedVehicles.some((v) => v.id === vehicle.id));
    }
  }, [user, vehicle.id]);

  const handleCardClick = () => {
    navigate(`/vehicle/${vehicle.id}`);
  };

  const handleSaveToggle = (e) => {
    e.stopPropagation();

    if (!user || user.role !== ROLES.CLIENT) {
      // Redirect to login if not authenticated
      navigate("/login");
      return;
    }

    const savedVehicles = JSON.parse(
      localStorage.getItem(`savedVehicles_${user.id}`) || "[]",
    );

    if (isSaved) {
      // Remove from saved
      const updated = savedVehicles.filter((v) => v.id !== vehicle.id);
      localStorage.setItem(`savedVehicles_${user.id}`, JSON.stringify(updated));
      setIsSaved(false);
    } else {
      // Add to saved
      savedVehicles.push(vehicle);
      localStorage.setItem(
        `savedVehicles_${user.id}`,
        JSON.stringify(savedVehicles),
      );
      setIsSaved(true);
    }

    // Notify parent component if callback provided
    if (onSaveToggle) {
      onSaveToggle(vehicle.id, !isSaved);
    }
  };

  return (
    <div
      className={`group relative w-full max-w-[340px] h-[460px] sm:h-[520px] bg-white/20 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden snap-start cursor-pointer ${className}`}
      style={{
        animation: isVisible
          ? `slideUp 0.6s ease-out ${index * 100}ms both`
          : "none",
      }}
      onClick={onClick || handleCardClick}
    >
      <div className="p-5 sm:p-10 h-full flex flex-col">
        {/* Vehicle Image */}
        <div className="relative h-44 sm:h-56 mb-5 sm:mb-8 rounded-2xl overflow-hidden bg-white/50 flex-shrink-0">
          <img
            src={
              vehicle.images && vehicle.images.length > 0
                ? vehicle.images[0]
                : vehicle.image || "/default-car.jpg"
            }
            alt={vehicle.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Save Button */}
          {user && user.role === ROLES.CLIENT && (
            <button
              onClick={handleSaveToggle}
              className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all flex items-center justify-center group/save z-10"
              title={isSaved ? t("vehicles.card.removeFavorite") : t("vehicles.card.addFavorite")}
            >
              <svg
                className={`w-6 h-6 transition-all ${
                  isSaved
                    ? "text-primary-600 fill-current"
                    : "text-gray-700 group-hover/save:text-primary-600 group-hover/save:scale-110"
                }`}
                fill={isSaved ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
          )}
          {/* Agency Badge */}
          {vehicle.agency && (
            <div className="absolute bottom-3 left-3 bg-gray-900/70 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
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
              <span className="text-xs font-medium text-white">
                {vehicle.agency.name}
              </span>
            </div>
          )}
        </div>

        {/* Vehicle Name */}
        <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 text-center flex-shrink-0 break-words">
          {vehicle.name}
        </h3>

        {/* Price */}
        <div className="text-center mb-5 sm:mb-6 flex-shrink-0">
          <span className="text-2xl sm:text-3xl font-bold text-gray-900">
            {vehicle.price} {t("common.currency")}
          </span>
          <span className="text-gray-700 text-sm ml-1">{t("vehicles.card.perDay")}</span>
        </div>

        {/* Spacer to push button to bottom */}
        <div className="flex-grow"></div>

        {/* Reserve Button */}
        <button className="w-full bg-primary-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base font-semibold flex-shrink-0">
          {t("vehicles.card.reserve")}
        </button>
      </div>
    </div>
  );
};

export default VehicleCard;
