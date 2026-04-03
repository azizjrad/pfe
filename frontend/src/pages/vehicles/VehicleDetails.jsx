import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import VehicleImageGallery from "../../components/features/VehicleImageGallery";
import ReservationModal from "../../components/modals/ReservationModal";
import ReportButton from "../../components/features/ReportButton";
import Toast from "../../components/common/Toast";
import useScrollAnimation from "../../hooks/useScrollAnimation";
import publicVehicleService from "../../services/publicVehicleService";
import { reservationService } from "../../services/reservationService";

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [vehicle, setVehicle] = useState(null);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast({ isVisible: false, message: "", type: "success" });
  };

  const handleReportSubmit = async (reportData) => {
    try {
      showToast(t("vehicles.details.messages.reportSuccess"), "success");
    } catch (error) {
      console.error("Report submission error:", error);
      showToast(t("vehicles.details.messages.reportError"), "error");
    }
  };

  // Scroll animations
  const hero = useScrollAnimation({ threshold: 0.2 });
  const details = useScrollAnimation({ threshold: 0.2 });
  const features = useScrollAnimation({ threshold: 0.2 });
  const agency = useScrollAnimation({ threshold: 0.2 });

  // Ref for agency section
  const agencyRef = React.useRef(null);

  const scrollToAgency = () => {
    agencyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleReservationSubmit = async (reservationData) => {
    try {
      // Prepare submission data for backend
      const submissionPayload = {
        vehicle_id: vehicle.id,
        start_date: reservationData.startDate,
        end_date: reservationData.endDate,
        pickup_location: vehicle.agency?.location || "Tunis",
        dropoff_location: vehicle.agency?.location || "Tunis",
        full_name: reservationData.fullName,
        email: reservationData.email,
        phone: reservationData.phone,
        notes: "",
        options: reservationData.options,
        pricing_breakdown: reservationData.pricing_breakdown,
      };

      // Call the backend API
      const response = await reservationService.create(submissionPayload);

      if (response.data.success) {
        showToast(
          response.data.message ||
            t("vehicles.details.messages.reservationSuccess"),
          "success",
        );
        setIsReservationOpen(false);

        // Optional: Navigate to my-reservations page
        // navigate("/dashboard");
      }
    } catch (error) {
      console.error("Reservation error:", error);

      if (error.response?.data?.message) {
        showToast(error.response.data.message, "error");
      } else if (error.response?.status === 401) {
        showToast(t("vehicles.details.messages.authRequired"), "error");
        navigate(`/login?returnTo=/vehicles/${id}&openModal=reservation`);
      } else {
        showToast(t("vehicles.details.messages.reservationError"), "error");
      }
    }
  };

  // Handle reserve button click with authentication check
  const handleReserveClick = () => {
    if (!isAuthenticated) {
      showToast(t("vehicles.details.messages.authRequired"), "error");
      navigate(`/login?returnTo=/vehicles/${id}&openModal=reservation`);
      return;
    }
    setIsReservationOpen(true);
  };

  useEffect(() => {
    // Scroll to top when component loads
    window.scrollTo(0, 0);

    const fetchVehicle = async () => {
      try {
        const response = await publicVehicleService.getById(id);
        if (response.success && response.data) {
          setVehicle(response.data);
        } else {
          console.error("Vehicle not found for id:", id);
          setTimeout(() => navigate("/vehicles"), 100);
        }
      } catch (error) {
        console.error("Failed to fetch vehicle:", error);
        setTimeout(() => navigate("/vehicles"), 100);
      }
    };

    fetchVehicle();

    // Check if we should auto-open the reservation modal
    const openModal = searchParams.get("openModal");
    if (openModal === "reservation" && isAuthenticated) {
      setIsReservationOpen(true);
      // Remove the query parameter after opening modal
      searchParams.delete("openModal");
      setSearchParams(searchParams, { replace: true });
    }
  }, [id, searchParams, isAuthenticated]);

  if (!vehicle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("vehicles.details.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <Navbar />

      {/* Hero Section with Vehicle Image */}
      <section className="pt-24 sm:pt-28 md:pt-32 pb-8 sm:pb-10 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate("/vehicles")}
            className="mb-4 sm:mb-6 flex items-center gap-2 text-sm sm:text-base text-gray-600 hover:text-primary-600 transition-colors group"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {t("vehicles.details.back")}
          </button>

          <div
            ref={hero.ref}
            className={`transition-all duration-700 ${hero.isVisible ? "animate-fadeIn" : ""}`}
          >
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-start">
              {/* Left: Image Gallery */}
              <div className="relative">
                <VehicleImageGallery
                  images={
                    vehicle.images && vehicle.images.length > 0
                      ? vehicle.images
                      : vehicle.image
                        ? [vehicle.image]
                        : []
                  }
                />
                {/* Category Badge */}
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-white/90 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg z-20">
                  <span className="text-xs sm:text-sm text-primary-600 font-semibold">
                    {vehicle.category}
                  </span>
                </div>
              </div>

              {/* Right: Info */}
              <div className="space-y-5 sm:space-y-6">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 break-words">
                      {vehicle.name}
                    </h1>
                    <ReportButton
                      reportType="vehicle"
                      reportTarget={{ id: vehicle.id, name: vehicle.name }}
                      variant="icon"
                      onReportSubmit={handleReportSubmit}
                    />
                  </div>
                  <div className="flex items-baseline gap-2 sm:gap-3 mb-4 sm:mb-6 flex-wrap">
                    <span className="text-4xl sm:text-5xl font-bold text-primary-600">
                      {vehicle.price} dt
                    </span>
                    <span className="text-lg sm:text-xl text-gray-600">
                      {t("vehicles.details.perDay")}
                    </span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-gray-200">
                    <div className="text-gray-600 text-sm mb-1">
                      {t("vehicles.details.stats.year")}
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-gray-900">
                      {vehicle.year}
                    </div>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-gray-200">
                    <div className="text-gray-600 text-sm mb-1">
                      {t("vehicles.details.stats.seats")}
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-gray-900">
                      {vehicle.seats}
                    </div>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-gray-200">
                    <div className="text-gray-600 text-sm mb-1">
                      {t("vehicles.details.stats.transmission")}
                    </div>
                    <div className="text-base sm:text-lg font-bold text-gray-900 break-words">
                      {vehicle.transmission}
                    </div>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-gray-200">
                    <div className="text-gray-600 text-sm mb-1">
                      {t("vehicles.details.stats.fuel")}
                    </div>
                    <div className="text-base sm:text-lg font-bold text-gray-900 break-words">
                      {vehicle.fuel}
                    </div>
                  </div>
                </div>

                {/* Reserve Button */}
                <button
                  onClick={handleReserveClick}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl hover:from-primary-700 hover:to-primary-800 transition-all font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {t("vehicles.details.reserveBtn")}
                </button>

                {/* Contact Agency */}
                <button
                  onClick={scrollToAgency}
                  className="w-full bg-white/60 backdrop-blur-sm border-2 border-primary-200 text-primary-600 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl hover:bg-primary-50 transition-all font-semibold text-base sm:text-lg flex items-center justify-center gap-2"
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  {t("vehicles.details.contactBtn")}
                </button>

                {/* Report Vehicle - Text variant */}
                <div className="flex justify-center pt-2">
                  <ReportButton
                    reportType="vehicle"
                    reportTarget={{ id: vehicle.id, name: vehicle.name }}
                    variant="text"
                    onReportSubmit={handleReportSubmit}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description & Features */}
      <section className="py-8 sm:py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={details.ref}
            className={`transition-all duration-700 delay-200 ${details.isVisible ? "animate-slideUp" : ""}`}
          >
            <div className="grid lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
              {/* Description */}
              <div className="lg:col-span-2 space-y-5 sm:space-y-6 md:space-y-8">
                <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-5 sm:p-6 md:p-8 border border-gray-200 shadow-lg">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                    {t("vehicles.details.description")}
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                    {vehicle.description}
                  </p>
                </div>

                {/* Specifications */}
                <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-5 sm:p-6 md:p-8 border border-gray-200 shadow-lg">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                    {t("vehicles.details.specsTitle")}
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                    {vehicle.specifications.map((spec, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl"
                      >
                        <span className="text-sm sm:text-base text-gray-600 font-medium">
                          {spec.label}
                        </span>
                        <span className="text-sm sm:text-base text-gray-900 font-bold text-right break-words">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Features Sidebar */}
              <div className="space-y-5 sm:space-y-6 md:space-y-8">
                <div
                  ref={features.ref}
                  className={`bg-white/60 backdrop-blur-sm rounded-3xl p-5 sm:p-6 md:p-8 border border-gray-200 shadow-lg transition-all duration-700 delay-300 ${features.isVisible ? "animate-slideInRight" : ""}`}
                >
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                    {t("vehicles.details.featuresTitle")}
                  </h2>
                  <div className="space-y-2.5 sm:space-y-3">
                    {vehicle.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2.5 sm:p-3 bg-primary-50 rounded-xl"
                      >
                        <svg
                          className="w-5 h-5 text-primary-600 flex-shrink-0"
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
                        <span className="text-sm sm:text-base text-gray-800 font-medium break-words">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agency Information */}
      <section
        ref={agencyRef}
        className="py-8 sm:py-10 md:py-12 pb-14 sm:pb-16 md:pb-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={agency.ref}
            className={`transition-all duration-700 delay-400 ${agency.isVisible ? "animate-slideUp" : ""}`}
          >
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-5 sm:p-7 md:p-12 text-white shadow-2xl">
              <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8"
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
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold break-words">
                    {vehicle.agency.name}
                  </h2>
                  <p className="text-sm sm:text-base text-primary-100">
                    {t("vehicles.details.agency.managedBy")}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-primary-200 mb-1">
                      {t("vehicles.details.agency.address")}
                    </div>
                    <div className="text-sm sm:text-base font-semibold break-words">
                      {vehicle.agency.address}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-primary-200 mb-1">
                      {t("vehicles.details.agency.phone")}
                    </div>
                    <a
                      href={`tel:${vehicle.agency.phone}`}
                      className="text-sm sm:text-base font-semibold hover:text-primary-100 transition-colors break-all"
                    >
                      {vehicle.agency.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-primary-200 mb-1">
                      {t("vehicles.details.agency.email")}
                    </div>
                    <a
                      href={`mailto:${vehicle.agency.email}`}
                      className="text-sm sm:text-base font-semibold hover:text-primary-100 transition-colors break-all"
                    >
                      {vehicle.agency.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-primary-200 mb-1">
                      {t("vehicles.details.agency.hours")}
                    </div>
                    <div className="text-sm sm:text-base font-semibold break-words">
                      {vehicle.agency.hours}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ReservationModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        vehicle={vehicle}
        onSubmit={handleReservationSubmit}
      />

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />

      <Footer />
    </div>
  );
};

export default VehicleDetails;
