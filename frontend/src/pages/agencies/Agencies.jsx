import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Pagination from "../../components/features/Pagination";
import useScrollAnimation from "../../hooks/useScrollAnimation";
import publicAgencyService from "../../services/publicAgencyService";

const Agencies = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [agencies, setAgencies] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // 6 agencies per page (2x3 grid)

  // Scroll animations
  const hero = useScrollAnimation({ threshold: 0.2 });
  const grid = useScrollAnimation({ threshold: 0.2 });

  // Fetch agencies on component mount
  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const response = await publicAgencyService.getAll(currentPage, 12);
        if (response.success && response.data) {
          setAgencies(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch agencies:", error);
        setAgencies([]);
      }
    };

    fetchAgencies();
  }, [currentPage]);

  // Filter agencies based on search query
  const filteredAgencies = useMemo(() => {
    if (!searchQuery.trim()) {
      return agencies;
    }

    const query = searchQuery.toLowerCase();
    return agencies.filter(
      (agency) =>
        agency.name.toLowerCase().includes(query) ||
        agency.location.toLowerCase().includes(query) ||
        agency.address.toLowerCase().includes(query),
    );
  }, [searchQuery, agencies]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredAgencies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAgencies = filteredAgencies.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of grid section
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section
        className={`relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white pt-24 sm:pt-28 md:pt-32 pb-14 sm:pb-16 md:pb-20 overflow-hidden ${
          hero.isVisible ? "animate-fadeInUp" : "opacity-0"
        }`}
        ref={hero.ref}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6">
              Nos Agences
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-primary-100 mb-6 sm:mb-8 px-2 sm:px-0">
              Trouvez l'agence Elite Drive la plus proche de vous et découvrez
              notre flotte de véhicules premium
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div
                className={`relative transition-all duration-300 ${
                  isSearchFocused ? "md:scale-[1.02]" : ""
                }`}
              >
                <input
                  type="text"
                  placeholder="Rechercher une agence par nom ou ville..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full px-4 sm:px-6 py-3.5 sm:py-4 pl-11 sm:pl-14 rounded-xl sm:rounded-2xl text-sm sm:text-base text-gray-900 bg-white/95 backdrop-blur-sm border-2 border-transparent focus:border-white focus:bg-white transition-all duration-300 outline-none shadow-xl"
                />
                <svg
                  className="absolute left-3.5 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600"
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
                )}
              </div>
            </div>

            {/* Results count */}
            <p className="text-sm sm:text-base text-primary-100 mt-5 sm:mt-6">
              {filteredAgencies.length}{" "}
              {filteredAgencies.length === 1
                ? "agence trouvée"
                : "agences trouvées"}
            </p>
          </div>
        </div>
      </section>

      {/* Agencies Grid */}
      <section
        className={`py-10 sm:py-12 md:py-16 ${grid.isVisible ? "animate-fadeInUp" : "opacity-0"}`}
        ref={grid.ref}
      >
        <div className="container mx-auto px-4">
          {filteredAgencies.length === 0 ? (
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                Aucune agence trouvée
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Essayez de modifier votre recherche
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-semibold"
              >
                Voir toutes les agences
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
                {paginatedAgencies.map((agency, index) => (
                  <AgencyCard key={agency.id} agency={agency} index={index} />
                ))}
              </div>

              {/* Pagination */}
              {filteredAgencies.length > itemsPerPage && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredAgencies.length}
                />
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Agency Card Component
const AgencyCard = ({ agency, index }) => {
  const card = useScrollAnimation({ threshold: 0.2 });

  return (
    <Link
      to={`/agency/${agency.id}`}
      aria-label={`Voir les details de ${agency.name}`}
      ref={card.ref}
      className={`group block bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 ${
        card.isVisible
          ? "animate-fadeInUp opacity-100"
          : "opacity-0 translate-y-8"
      }`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Image */}
      <div className="relative h-52 sm:h-56 overflow-hidden">
        <img
          src={agency.image}
          alt={agency.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

        {/* Rating Badge */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-white/95 backdrop-blur-sm rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 shadow-lg">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm sm:text-base font-bold text-gray-900">
            {agency.rating}
          </span>
          <span className="text-xs sm:text-sm text-gray-600">
            ({agency.totalReviews})
          </span>
        </div>

        {/* Location Badge */}
        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 bg-primary-600/90 backdrop-blur-sm text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-sm sm:text-base font-semibold flex items-center gap-1.5 sm:gap-2 max-w-[calc(100%-1.5rem)] sm:max-w-[calc(100%-2rem)] truncate">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
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

      {/* Content */}
      <div className="p-4 sm:p-6">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
          {agency.name}
        </h3>

        <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2">
          {agency.description}
        </p>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2 text-sm text-gray-600 min-w-0">
            <svg
              className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5"
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
            <span className="break-words">{agency.address}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
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
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span>{agency.phone}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{agency.hours}</span>
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-6">
          {agency.features.slice(0, 3).map((feature, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full"
            >
              {feature}
            </span>
          ))}
          {agency.features.length > 3 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
              +{agency.features.length - 3}
            </span>
          )}
        </div>

        {/* CTA Button */}
        <div className="block w-full text-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg group-hover:from-primary-700 group-hover:to-primary-800 group-hover:shadow-xl group-hover:scale-[1.02]">
          Voir l'agence
        </div>
      </div>
    </Link>
  );
};

export default Agencies;
