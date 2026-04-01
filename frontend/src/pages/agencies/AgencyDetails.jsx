import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import VehicleCard from "../../components/cards/VehicleCard";
import ReportButton from "../../components/features/ReportButton";
import Toast from "../../components/common/Toast";
import publicAgencyService from "../../services/publicAgencyService";

const AgencyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [agency, setAgency] = useState(null);
  const [agencyVehicles, setAgencyVehicles] = useState([]);
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
      showToast(t("agencies.details.messages.reportSuccess"), "success");
    } catch (error) {
      console.error("Report submission error:", error);
      showToast(t("agencies.details.messages.reportError"), "error");
    }
  };

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);

    const fetchAgencyData = async () => {
      try {
        const response = await publicAgencyService.getById(id);
        if (response.success && response.data) {
          setAgency(response.data);
          // Vehicles are included in response.data
          if (response.data.vehicles) {
            setAgencyVehicles(response.data.vehicles);
          }
        } else {
          // Agency not found, redirect to agencies page
          setTimeout(() => navigate("/agencies"), 100);
        }
      } catch (error) {
        console.error("Failed to fetch agency:", error);
        setTimeout(() => navigate("/agencies"), 100);
      }
    };

    fetchAgencyData();
  }, [id, navigate]);

  if (!agency) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {t("agencies.details.messages.loading")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section with Agency Image */}
      <section className="relative pt-16 sm:pt-20">
        <div className="relative h-[420px] sm:h-96 overflow-hidden">
          <img
            src={agency.image}
            alt={agency.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>

          {/* Breadcrumb */}
          <div className="absolute top-6 sm:top-8 left-0 right-0 container mx-auto px-4">
            <div className="hidden sm:flex items-center gap-2 text-white/80 text-sm">
              <Link to="/" className="hover:text-white transition-colors">
                {t("agencies.details.breadcrumb.home")}
              </Link>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <Link
                to="/agencies"
                className="hover:text-white transition-colors"
              >
                {t("agencies.details.breadcrumb.agencies")}
              </Link>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-white">{agency.name}</span>
            </div>
          </div>

          {/* Agency Title */}
          <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8 sm:pb-12">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="bg-primary-600/90 backdrop-blur-sm text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-sm sm:text-base font-semibold flex items-center gap-2">
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {agency.location}
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-3 sm:mb-4 flex items-center justify-between gap-3">
                <span className="min-w-0 break-words">{agency.name}</span>
                <ReportButton
                  reportType="agency"
                  reportTarget={{ id: agency.id, name: agency.name }}
                  variant="icon"
                  className="bg-white/10 hover:bg-white/20 text-white hover:text-red-200"
                  onReportSubmit={handleReportSubmit}
                />
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl">
                {agency.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Agency Information */}
      <section className="py-10 sm:py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
            {/* Contact Information Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5 sm:mb-6 flex items-center gap-3">
                  <svg
                    className="w-7 h-7 sm:w-8 sm:h-8 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {t("agencies.details.contactCard.title")}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                  {/* Address */}
                  <div className="flex gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600"
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
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                        {t("agencies.details.contactCard.address")}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 break-words">
                        {agency.address}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600"
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
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                        {t("agencies.details.contactCard.phone")}
                      </h3>
                      <a
                        href={`tel:${agency.phone}`}
                        className="text-sm sm:text-base text-primary-600 hover:text-primary-700 transition-colors break-all"
                      >
                        {agency.phone}
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600"
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
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                        {t("agencies.details.contactCard.email")}
                      </h3>
                      <a
                        href={`mailto:${agency.email}`}
                        className="text-sm sm:text-base text-primary-600 hover:text-primary-700 transition-colors break-all"
                      >
                        {agency.email}
                      </a>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600"
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
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                        {t("agencies.details.contactCard.hours")}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        {agency.hours}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Card */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg text-white">
                <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">
                  {t("agencies.details.features.title")}
                </h2>
                <ul className="space-y-3 sm:space-y-4">
                  {agency.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-primary-200 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm sm:text-base text-primary-50">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/20">
                  <Link
                    to="/contact"
                    className="block w-full text-center px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-white text-primary-600 rounded-xl hover:bg-primary-50 transition-all duration-300 font-semibold shadow-lg"
                  >
                    {t("agencies.details.features.contactBtn")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agency Vehicles */}
      <section className="py-10 sm:py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              {t("agencies.details.vehiclesSection.title")}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              {agencyVehicles.length === 1
                ? t("agencies.details.vehiclesSection.subtitle_one")
                : t("agencies.details.vehiclesSection.subtitle_other", {
                    count: agencyVehicles.length,
                  })}
            </p>
          </div>

          {agencyVehicles.length === 0 ? (
            <div className="text-center py-14 sm:py-16 md:py-20">
              <svg
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto text-gray-300 mb-5 sm:mb-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                {t("agencies.details.vehiclesSection.emptyTitle")}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                {t("agencies.details.vehiclesSection.emptyDesc")}
              </p>
              <Link
                to="/vehicles"
                className="inline-block px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-semibold"
              >
                {t("agencies.details.vehiclesSection.viewAllBtn")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
              {agencyVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
};

export default AgencyDetails;
