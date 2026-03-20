import React, { useState } from "react";

/**
 * Vehicle Image Gallery Component
 * Displays multiple vehicle images with thumbnail selector
 * First image is displayed as main, others as thumbnails
 */
export default function VehicleImageGallery({ images = [] }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Fallback to default image if no images provided
  const displayImages =
    images && images.length > 0 ? images : ["/default-car.jpg"];

  const mainImage = displayImages[selectedImageIndex];

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm shadow-2xl">
        <img
          src={mainImage}
          alt={`Véhicule - Image ${selectedImageIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-300"
        />

        {/* Image Counter Badge */}
        {displayImages.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-sm font-semibold px-3 py-2 rounded-full">
            {selectedImageIndex + 1}/{displayImages.length}
          </div>
        )}

        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={() =>
                setSelectedImageIndex(
                  selectedImageIndex === 0
                    ? displayImages.length - 1
                    : selectedImageIndex - 1,
                )
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg transition-all hover:shadow-xl z-10"
              title="Image précédente"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={() =>
                setSelectedImageIndex(
                  selectedImageIndex === displayImages.length - 1
                    ? 0
                    : selectedImageIndex + 1,
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg transition-all hover:shadow-xl z-10"
              title="Image suivante"
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative flex-shrink-0 h-20 w-24 rounded-xl overflow-hidden transition-all duration-200 ${
                selectedImageIndex === index
                  ? "ring-3 ring-primary-500 shadow-lg scale-105"
                  : "ring-2 ring-gray-300 hover:ring-primary-400 hover:scale-102"
              }`}
              title={`Image ${index + 1}`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* First Image Badge */}
              {index === 0 && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end justify-center p-1">
                  <span className="text-white text-xs font-bold bg-blue-500 px-2 py-0.5 rounded">
                    Principal
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
