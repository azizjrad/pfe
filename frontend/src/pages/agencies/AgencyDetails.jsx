import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import VehicleCard from "../../components/cards/VehicleCard";
import ReportButton from "../../components/features/ReportButton";
import Toast from "../../components/common/Toast";
import { useAuth } from "../../contexts/AuthContext";
import { getAgencyById } from "../../data/agenciesData";
import { vehiclesData } from "../../data/vehiclesData";

const AgencyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [agency, setAgency] = useState(null);
  const [agencyVehicles, setAgencyVehicles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
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
      showToast(
        "Signalement envoyé avec succès. Notre équipe examinera votre rapport.",
        "success",
      );
    } catch (error) {
      console.error("Report submission error:", error);
      showToast(
        "Erreur lors de l'envoi du signalement. Veuillez réessayer.",
        "error",
      );
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewData.comment.trim()) {
      showToast("Veuillez ajouter un commentaire", "error");
      return;
    }

    setSubmittingReview(true);
    try {
      // TODO: Replace with API call
      const newReview = {
        id: reviews.length + 1,
        agency_id: parseInt(id),
        user_id: user?.id,
        user_name: user?.name || "Client",
        rating: reviewData.rating,
        comment: reviewData.comment,
        created_at: new Date().toISOString(),
      };

      setReviews([newReview, ...reviews]);
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: "" });
      showToast("Avis publié avec succès", "success");
    } catch (error) {
      console.error("Review submission error:", error);
      showToast("Erreur lors de la publication de l'avis", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);

    // Get agency data
    const agencyData = getAgencyById(parseInt(id));

    if (agencyData) {
      setAgency(agencyData);

      // Filter vehicles by agency name
      const vehiclesFromAgency = Object.values(vehiclesData).filter(
        (vehicle) => vehicle.agency.name === agencyData.name,
      );
      setAgencyVehicles(vehiclesFromAgency);

      // Load mock reviews (TODO: Replace with API call)
      const mockReviews = [
        {
          id: 1,
          agency_id: parseInt(id),
          user_id: 5,
          user_name: "Sophie Martin",
          rating: 5,
          comment:
            "Excellent service ! Voiture impeccable et personnel très accueillant. Je recommande vivement cette agence.",
          created_at: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
        {
          id: 2,
          agency_id: parseInt(id),
          user_id: 6,
          user_name: "Thomas Dubois",
          rating: 4,
          comment:
            "Très bonne expérience. La voiture était propre et bien entretenue. Un petit délai à la prise en charge mais rien de grave.",
          created_at: new Date(
            Date.now() - 10 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
        {
          id: 3,
          agency_id: parseInt(id),
          user_id: 7,
          user_name: "Marie Leclerc",
          rating: 5,
          comment:
            "Service irréprochable ! L'équipe est professionnelle et à l'écoute. Les prix sont compétitifs.",
          created_at: new Date(
            Date.now() - 15 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
      ];
      setReviews(mockReviews);
    } else {
      // Agency not found, redirect to agencies page
      setTimeout(() => navigate("/agencies"), 100);
    }
  }, [id, navigate]);

  if (!agency) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'agence...</p>
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
                Accueil
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
                Agences
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
                <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm sm:text-base font-bold text-gray-900">
                    {agency.rating}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-600">
                    ({agency.totalReviews} avis)
                  </span>
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
                  Informations de Contact
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
                        Adresse
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
                        Téléphone
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
                        Email
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
                        Horaires
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
                  Services & Avantages
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
                    Nous Contacter
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-10 sm:py-12 md:py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Avis des Clients
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                {reviews.length > 0 ? (
                  <>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-5 h-5 sm:w-6 sm:h-6 ${
                            star <=
                            Math.round(
                              reviews.reduce((acc, r) => acc + r.rating, 0) /
                                reviews.length,
                            )
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-gray-900">
                      {(
                        reviews.reduce((acc, r) => acc + r.rating, 0) /
                        reviews.length
                      ).toFixed(1)}
                    </span>
                    <span className="text-sm sm:text-base text-gray-600">
                      ({reviews.length} avis)
                    </span>
                  </>
                ) : (
                  <span className="text-gray-500">
                    Aucun avis pour le moment
                  </span>
                )}
              </div>
            </div>

            {/* Add Review Button (only for logged in clients) */}
            {user && user.role === "client" && !showReviewForm && (
              <div className="text-center mb-6 sm:mb-8">
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
                >
                  Laisser un avis
                </button>
              </div>
            )}

            {/* Review Form */}
            {showReviewForm && (
              <div className="mb-8 bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                  Votre avis
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setReviewData({ ...reviewData, rating: star })
                          }
                          className="transition-transform hover:scale-110"
                        >
                          <svg
                            className={`w-8 h-8 sm:w-10 sm:h-10 ${
                              star <= reviewData.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commentaire
                    </label>
                    <textarea
                      value={reviewData.comment}
                      onChange={(e) =>
                        setReviewData({
                          ...reviewData,
                          comment: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Partagez votre expérience..."
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleSubmitReview}
                      disabled={submittingReview}
                      className="w-full sm:w-auto px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      {submittingReview ? "Envoi..." : "Publier"}
                    </button>
                    <button
                      onClick={() => {
                        setShowReviewForm(false);
                        setReviewData({ rating: 5, comment: "" });
                      }}
                      className="w-full sm:w-auto px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <div>
                        <p className="font-bold text-gray-900 text-base sm:text-lg">
                          {review.user_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-5 h-5 ${
                                star <= review.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString(
                          "fr-FR",
                        )}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl">
                  <p className="text-gray-500 text-lg">
                    Aucun avis pour le moment
                  </p>
                  <p className="text-gray-400 mt-2">
                    Soyez le premier à partager votre expérience !
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Agency Vehicles */}
      <section className="py-10 sm:py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Nos Véhicules
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              Découvrez notre flotte de{" "}
              {agencyVehicles.length === 1
                ? "1 véhicule disponible"
                : `${agencyVehicles.length} véhicules disponibles`}
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
                Aucun véhicule disponible
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Cette agence n'a pas encore de véhicules enregistrés
              </p>
              <Link
                to="/vehicles"
                className="inline-block px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-semibold"
              >
                Voir tous les véhicules
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
