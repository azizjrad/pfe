import React from "react";
import { useNavigate } from "react-router-dom";

const VehicleCard = ({ vehicle, index = 0, isVisible = true, onClick }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/vehicle/${vehicle.id}`);
  };

  return (
    <div
      className="group relative flex-shrink-0 w-[340px] h-[520px] bg-white/20 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden snap-start cursor-pointer"
      style={{
        animation: isVisible
          ? `slideUp 0.6s ease-out ${index * 100}ms both`
          : "none",
      }}
      onClick={onClick || handleCardClick}
    >
      <div className="p-10 h-full flex flex-col">
        {/* Vehicle Image */}
        <div className="relative h-56 mb-8 rounded-2xl overflow-hidden bg-white/50 flex-shrink-0">
          <img
            src={vehicle.image}
            alt={vehicle.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        {/* Vehicle Name */}
        <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center flex-shrink-0">
          {vehicle.name}
        </h3>

        {/* Price */}
        <div className="text-center mb-6 flex-shrink-0">
          <span className="text-3xl font-bold text-gray-900">
            {vehicle.price} DT
          </span>
          <span className="text-gray-700 text-sm ml-1">/jour</span>
        </div>

        {/* Spacer to push button to bottom */}
        <div className="flex-grow"></div>

        {/* Reserve Button */}
        <button className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold flex-shrink-0">
          Réserver maintenant
        </button>
      </div>
    </div>
  );
};

export default VehicleCard;
