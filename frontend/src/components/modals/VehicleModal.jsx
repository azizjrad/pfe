import React, { useState, useEffect } from "react";
import ConfirmationModal from "./ConfirmationModal";

/**
 * Vehicle Modal Component for Add/Edit Operations
 * Used by agency admins to manage their vehicle fleet
 */
export default function VehicleModal({ isOpen, onClose, vehicle, onSubmit }) {
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    mileage: 0,
    daily_price: 0,
    license_plate: "",
    color: "",
    seats: 5,
    transmission: "automatic",
    fuel_type: "petrol",
    status: "available",
    images: [],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const MAX_IMAGES = 4;

  // Populate form when editing existing vehicle
  useEffect(() => {
    if (vehicle) {
      setFormData({
        brand: vehicle.brand || "",
        model: vehicle.model || "",
        year: vehicle.year || new Date().getFullYear(),
        mileage: vehicle.mileage || 0,
        daily_price: vehicle.daily_price || 0,
        license_plate: vehicle.license_plate || "",
        color: vehicle.color || "",
        seats: vehicle.seats || 5,
        transmission: vehicle.transmission || "automatic",
        fuel_type: vehicle.fuel_type || "petrol",
        status: vehicle.status || "available",
        images: vehicle.images || [],
      });
      if (vehicle.images && Array.isArray(vehicle.images)) {
        setImagePreviews(vehicle.images);
      }
    } else {
      // Reset form for new vehicle
      setFormData({
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        mileage: 0,
        daily_price: 0,
        license_plate: "",
        color: "",
        seats: 5,
        transmission: "automatic",
        fuel_type: "petrol",
        status: "available",
        images: [],
      });
      setImagePreviews([]);
    }
    setErrors({});
  }, [vehicle, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageChange = (file) => {
    if (file && file.type.startsWith("image/")) {
      // Check if we're at max limit
      if (imagePreviews.length >= MAX_IMAGES) {
        setErrors((prev) => ({
          ...prev,
          images: `Vous ne pouvez ajouter que ${MAX_IMAGES} images maximum`,
        }));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;
        const newPreviews = [...imagePreviews, base64String];
        setImagePreviews(newPreviews);
        setFormData((prev) => ({
          ...prev,
          images: newPreviews,
        }));
        setErrors((prev) => ({
          ...prev,
          images: "",
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setErrors((prev) => ({
        ...prev,
        images: "Veuillez sélectionner une image valide",
      }));
    }
  };

  const removeImage = (index) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
    setFormData((prev) => ({
      ...prev,
      images: newPreviews,
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      // Handle multiple files
      Array.from(e.dataTransfer.files).forEach((file) => {
        if (imagePreviews.length < MAX_IMAGES) {
          handleImageChange(file);
        }
      });
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach((file) => {
        if (imagePreviews.length < MAX_IMAGES) {
          handleImageChange(file);
        }
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.brand.trim()) newErrors.brand = "Brand is required";
    if (!formData.model.trim()) newErrors.model = "Model is required";
    if (formData.year < 2000 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = "Invalid year";
    }
    if (formData.mileage < 0) newErrors.mileage = "Mileage cannot be negative";
    if (formData.daily_price <= 0)
      newErrors.daily_price = "Price must be greater than 0";
    if (!formData.license_plate.trim())
      newErrors.license_plate = "License plate is required";
    if (!formData.color.trim()) newErrors.color = "Color is required";
    if (formData.seats < 2 || formData.seats > 9)
      newErrors.seats = "Seats must be between 2 and 9";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    // Store form data and show confirmation
    setPendingFormData(formData);
    setShowConfirmation(true);
  };

  const confirmSubmit = async () => {
    setLoading(true);
    setShowConfirmation(false);
    try {
      await onSubmit(pendingFormData);
      onClose();
    } catch (error) {
      console.error("Error submitting vehicle:", error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
      setPendingFormData(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl border border-white/60 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scaleIn">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 shadow-lg z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <span className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
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
                      d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                    />
                  </svg>
                </span>
                {vehicle ? "Éditer le Véhicule" : "Ajouter un Véhicule"}
              </h2>
              <p className="text-primary-100 text-sm mt-1">
                {vehicle
                  ? "Update vehicle information"
                  : "Add a new vehicle to your fleet"}
              </p>
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

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]"
        >
          {/* Basic Information */}
          <div className="bg-gradient-to-br from-primary-50/50 to-purple-50/50 rounded-2xl p-5 border border-primary-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
              Informations de Base
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marque <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 bg-white/50 backdrop-blur-sm transition-all"
                  placeholder="ex: Toyota"
                />
                {errors.brand && (
                  <p className="text-red-500 text-sm mt-1">{errors.brand}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                    errors.model ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Camry"
                />
                {errors.model && (
                  <p className="text-red-500 text-sm mt-1">{errors.model}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  min="2000"
                  max={new Date().getFullYear() + 1}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                    errors.year ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.year && (
                  <p className="text-red-500 text-sm mt-1">{errors.year}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mileage (km) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                    errors.mileage ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.mileage && (
                  <p className="text-red-500 text-sm mt-1">{errors.mileage}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Price (DT) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="daily_price"
                  value={formData.daily_price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                    errors.daily_price ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., 80.00"
                />
                {errors.daily_price && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.daily_price}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Plate <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="license_plate"
                  value={formData.license_plate}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                    errors.license_plate ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., TUN-123-456"
                />
                {errors.license_plate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.license_plate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                    errors.color ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., White"
                />
                {errors.color && (
                  <p className="text-red-500 text-sm mt-1">{errors.color}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seats <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="seats"
                  value={formData.seats}
                  onChange={handleChange}
                  min="2"
                  max="9"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                    errors.seats ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.seats && (
                  <p className="text-red-500 text-sm mt-1">{errors.seats}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transmission <span className="text-red-500">*</span>
                </label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuel Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="fuel_type"
                  value={formData.fuel_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="available">Available</option>
                  <option value="rented">Rented</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Image Upload with Drag & Drop */}
          <div className="bg-gradient-to-br from-blue-50/50 to-cyan-50/50 rounded-2xl p-5 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Photos du Véhicule
              </span>
              <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                {imagePreviews.length}/{MAX_IMAGES}
              </span>
            </h3>

            {/* Drag & Drop Zone */}
            {imagePreviews.length < MAX_IMAGES && (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer mb-4 ${
                  dragActive
                    ? "border-blue-500 bg-blue-100/30"
                    : "border-blue-300 bg-white/50 hover:border-blue-400 hover:bg-blue-50/20"
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="vehicle-image-input"
                  multiple
                />
                <label
                  htmlFor="vehicle-image-input"
                  className="cursor-pointer block w-full h-full absolute inset-0 rounded-2xl"
                />

                <div className="space-y-3 pointer-events-none">
                  <svg
                    className="w-12 h-12 text-blue-400 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6 20.25v-2.468c0-.119.023-.232.067-.343m12.732-12.638A9 9 0 017.875 5.25v12.468m0 0a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zm12-1.41A16.318 16.318 0 005.487 20.917m16.026-5.192l-5.313 5.313a2.25 2.25 0 01-3.182 0l-5.313-5.313m0 0a2.25 2.25 0 00-3.182 0l-5.313 5.313m16.026-5.192l3.182 3.182a2.25 2.25 0 010 3.182l-5.313 5.313m0 0a2.25 2.25 0 01-3.182 0l-5.313-5.313"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Glissez vos images ici
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ou cliquez pour sélectionner (
                      {MAX_IMAGES - imagePreviews.length} restante
                      {MAX_IMAGES - imagePreviews.length > 1 ? "s" : ""})
                    </p>
                  </div>
                  <p className="text-xs text-blue-600 font-medium">
                    PNG, JPG, GIF - Max {MAX_IMAGES} images
                  </p>
                </div>
              </div>
            )}

            {/* Image Thumbnails Grid */}
            {imagePreviews.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  {imagePreviews.length === 1
                    ? "Image ajoutée"
                    : "Images ajoutées"}{" "}
                  ({imagePreviews.length}/{MAX_IMAGES})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative group rounded-xl overflow-hidden shadow-md border-2 border-blue-100 hover:border-blue-300 transition-all"
                    >
                      <img
                        src={preview}
                        alt={`Aperçu ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                      {index === 0 && (
                        <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          Principal
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        title="Supprimer cette image"
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
                  ))}
                </div>
              </div>
            )}

            {errors.images && (
              <p className="text-red-500 text-sm mt-2">{errors.images}</p>
            )}
            <p className="text-xs text-gray-500 mt-3">
              💡 La première image s'affichera sur la fiche du véhicule
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200/50 sticky bottom-0 bg-gradient-to-t from-white to-white/95 backdrop-blur-sm pb-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium shadow-sm hover:shadow"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Sauvegarde...
                </>
              ) : vehicle ? (
                "Mettre à jour"
              ) : (
                "Ajouter le Véhicule"
              )}
            </button>
          </div>
        </form>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showConfirmation}
          onClose={() => {
            setShowConfirmation(false);
            setPendingFormData(null);
          }}
          onConfirm={confirmSubmit}
          title={vehicle ? "Confirmer la modification" : "Confirmer l'ajout"}
          message={
            vehicle
              ? "Êtes-vous sûr de vouloir enregistrer ces modifications ?"
              : "Êtes-vous sûr de vouloir ajouter ce véhicule à votre flotte ?"
          }
          confirmText={vehicle ? "Modifier" : "Ajouter"}
          danger={false}
        />
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
