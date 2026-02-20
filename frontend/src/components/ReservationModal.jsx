import React, { useState } from "react";

const ReservationModal = ({ isOpen, onClose, vehicle, onSubmit }) => {
  const [reservationData, setReservationData] = useState({
    startDate: "",
    endDate: "",
    fullName: "",
    email: "",
    phone: "",
  });
  const [touched, setTouched] = useState({});
  const [focused, setFocused] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReservationData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFocus = (fieldName) => {
    setFocused((prev) => ({ ...prev, [fieldName]: true }));
  };

  const handleBlur = (fieldName) => {
    setFocused((prev) => ({ ...prev, [fieldName]: false }));
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(reservationData);
    // Reset form
    setReservationData({
      startDate: "",
      endDate: "",
      fullName: "",
      email: "",
      phone: "",
    });
    setTouched({});
    setFocused({});
  };

  const handleClose = () => {
    setReservationData({
      startDate: "",
      endDate: "",
      fullName: "",
      email: "",
      phone: "",
    });
    setTouched({});
    setFocused({});
    onClose();
  };

  if (!isOpen || !vehicle) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 rounded-t-3xl flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">Réserver votre véhicule</h3>
            <p className="text-primary-100 mt-1">{vehicle.name}</p>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
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

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Vehicle Summary */}
          <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-2xl">
            <img
              src={vehicle.image}
              alt={vehicle.name}
              className="w-24 h-24 object-cover rounded-xl"
            />
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-lg">
                {vehicle.name}
              </h4>
              <p className="text-gray-600">{vehicle.category}</p>
              <p className="text-primary-600 font-bold text-xl mt-1">
                {vehicle.price} DT/jour
              </p>
            </div>
          </div>

          {/* Reservation Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Dates */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="date"
                  name="startDate"
                  value={reservationData.startDate}
                  onChange={handleChange}
                  onFocus={() => handleFocus("startDate")}
                  onBlur={() => handleBlur("startDate")}
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:border-primary-500 transition-all duration-300 bg-gray-50 focus:bg-gray-50 text-black focus:text-primary-500 peer focus:outline-none ${
                    touched.startDate && !reservationData.startDate
                      ? "border-primary-500"
                      : "border-gray-300"
                  }`}
                  placeholder=" "
                />
                <label
                  className={`absolute text-xs -top-2 left-2 bg-white px-2 transition-colors duration-300 pointer-events-none ${
                    focused.startDate ? "text-primary-500" : "text-gray-600"
                  }`}
                >
                  Date de début*
                </label>
                {touched.startDate && !reservationData.startDate && (
                  <p className="mt-1 text-sm text-primary-500">
                    Veuillez compléter ce champ obligatoire.
                  </p>
                )}
              </div>
              <div className="relative">
                <input
                  type="date"
                  name="endDate"
                  value={reservationData.endDate}
                  onChange={handleChange}
                  onFocus={() => handleFocus("endDate")}
                  onBlur={() => handleBlur("endDate")}
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:border-primary-500 transition-all duration-300 bg-gray-50 focus:bg-gray-50 text-black focus:text-primary-500 peer focus:outline-none ${
                    touched.endDate && !reservationData.endDate
                      ? "border-primary-500"
                      : "border-gray-300"
                  }`}
                  placeholder=" "
                />
                <label
                  className={`absolute text-xs -top-2 left-2 bg-white px-2 transition-colors duration-300 pointer-events-none ${
                    focused.endDate ? "text-primary-500" : "text-gray-600"
                  }`}
                >
                  Date de fin*
                </label>
                {touched.endDate && !reservationData.endDate && (
                  <p className="mt-1 text-sm text-primary-500">
                    Veuillez compléter ce champ obligatoire.
                  </p>
                )}
              </div>
            </div>

            {/* Personal Info */}
            <div className="relative">
              <input
                type="text"
                name="fullName"
                value={reservationData.fullName}
                onChange={handleChange}
                onBlur={() => handleBlur("fullName")}
                required
                className={`w-full px-4 py-3 border rounded-lg focus:border-primary-500 transition-all duration-300 bg-gray-50 focus:bg-gray-50 text-black peer focus:outline-none ${
                  touched.fullName && !reservationData.fullName.trim()
                    ? "border-primary-500"
                    : "border-gray-300"
                }`}
                placeholder=" "
              />
              <label className="absolute left-4 top-3 text-black text-sm transition-all duration-300 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-2 peer-focus:bg-white peer-focus:px-2 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-black pointer-events-none">
                Nom complet*
              </label>
              {touched.fullName && !reservationData.fullName.trim() && (
                <p className="mt-1 text-sm text-primary-500">
                  Veuillez compléter ce champ obligatoire.
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={reservationData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur("email")}
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:border-primary-500 transition-all duration-300 bg-gray-50 focus:bg-gray-50 text-black peer focus:outline-none ${
                    touched.email && !reservationData.email.trim()
                      ? "border-primary-500"
                      : "border-gray-300"
                  }`}
                  placeholder=" "
                />
                <label className="absolute left-4 top-3 text-black text-sm transition-all duration-300 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-2 peer-focus:bg-white peer-focus:px-2 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-black pointer-events-none">
                  Email*
                </label>
                {touched.email && !reservationData.email.trim() && (
                  <p className="mt-1 text-sm text-primary-500">
                    Veuillez compléter ce champ obligatoire.
                  </p>
                )}
              </div>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={reservationData.phone}
                  onChange={handleChange}
                  onBlur={() => handleBlur("phone")}
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:border-primary-500 transition-all duration-300 bg-gray-50 focus:bg-gray-50 text-black peer focus:outline-none ${
                    touched.phone && !reservationData.phone.trim()
                      ? "border-primary-500"
                      : "border-gray-300"
                  }`}
                  placeholder=" "
                />
                <label className="absolute left-4 top-3 text-black text-sm transition-all duration-300 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-2 peer-focus:bg-white peer-focus:px-2 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-black pointer-events-none">
                  Téléphone*
                </label>
                {touched.phone && !reservationData.phone.trim() && (
                  <p className="mt-1 text-sm text-primary-500">
                    Veuillez compléter ce champ obligatoire.
                  </p>
                )}
              </div>
            </div>

            {/* Agency Info */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Agence de retrait
              </p>
              <p className="text-gray-900 font-medium">{vehicle.agency.name}</p>
              <p className="text-gray-600 text-sm">{vehicle.agency.address}</p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                Confirmer la réservation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;
