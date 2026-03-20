import React, { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import VehicleCard from "../../components/cards/VehicleCard";
import Pagination from "../../components/features/Pagination";
import useScrollAnimation from "../../hooks/useScrollAnimation";
import publicVehicleService from "../../services/publicVehicleService";
import { FormControl, Select, MenuItem } from "@mui/material";

const Vehicles = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedTransmission, setSelectedTransmission] = useState("Tous");
  const [selectedFuel, setSelectedFuel] = useState("Tous");
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [vehicles, setVehicles] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // 9 vehicles per page (3x3 grid)

  // Search criteria from hero section
  const [searchCriteria, setSearchCriteria] = useState(null);

  // Read search parameters from URL (from hero section)
  useEffect(() => {
    const location = searchParams.get("location");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const startTime = searchParams.get("startTime");
    const endTime = searchParams.get("endTime");
    if (location && startDate && endDate) {
      setSearchCriteria({
        location,
        startDate,
        endDate,
        startTime: startTime || "10:00",
        endTime: endTime || "10:00",
      });

      // Scroll to vehicles section
      setTimeout(() => {
        window.scrollTo({ top: 400, behavior: "smooth" });
      }, 100);
    }
  }, [searchParams]);

  // Scroll animations
  const hero = useScrollAnimation({ threshold: 0.2 });
  const vehiclesGrid = useScrollAnimation({ threshold: 0.2 });

  // Fetch vehicles on component mount
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await publicVehicleService.getAll(currentPage, 12);
        if (response.success && response.data) {
          setVehicles(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch vehicles:", error);
        setVehicles([]);
      }
    };

    fetchVehicles();
  }, [currentPage]);

  const filteredVehicles = useMemo(() => {
    let result = vehicles;

    // Filter by search query
    if (searchQuery.trim()) {
      result = result.filter((v) =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Filter by price range
    result = result.filter(
      (v) => v.price >= priceRange[0] && v.price <= priceRange[1],
    );

    // Filter by transmission
    if (selectedTransmission !== "Tous") {
      result = result.filter((v) => v.transmission === selectedTransmission);
    }

    // Filter by fuel
    if (selectedFuel !== "Tous") {
      result = result.filter((v) => v.fuel === selectedFuel);
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "name":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return result;
  }, [
    vehicles,
    searchQuery,
    priceRange,
    selectedTransmission,
    selectedFuel,
    sortBy,
  ]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of vehicles section
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, priceRange, selectedTransmission, selectedFuel, sortBy]);

  const resetFilters = () => {
    setSearchQuery("");
    setPriceRange([0, 500]);
    setSelectedTransmission("Tous");
    setSelectedFuel("Tous");
    setSortBy("default");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 sm:pt-40 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={hero.ref}
            className={`transition-all duration-700 ${hero.isVisible ? "animate-fadeIn" : "opacity-0"}`}
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Notre <span className="text-primary-500">Flotte</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                Trouvez le véhicule idéal parmi notre large sélection disponible
                à travers toutes nos agences partenaires.
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un véhicule..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full px-6 py-4 pl-14 rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-all bg-white shadow-sm"
                />
                <svg
                  className={`w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    isSearchFocused ? "text-primary-500" : "text-gray-400"
                  }`}
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Search Results Banner (from hero section) */}
            {searchCriteria && (
              <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
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
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        <h3 className="text-xl font-bold">
                          Résultats de recherche
                        </h3>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
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
                          <div>
                            <div className="text-primary-100 text-xs">Lieu</div>
                            <div className="font-semibold">
                              {searchCriteria.location}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
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
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <div>
                            <div className="text-primary-100 text-xs">
                              Début
                            </div>
                            <div className="font-semibold">
                              {new Date(
                                searchCriteria.startDate,
                              ).toLocaleDateString("fr-FR")}{" "}
                              à {searchCriteria.startTime}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
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
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <div>
                            <div className="text-primary-100 text-xs">Fin</div>
                            <div className="font-semibold">
                              {new Date(
                                searchCriteria.endDate,
                              ).toLocaleDateString("fr-FR")}{" "}
                              à {searchCriteria.endTime}
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 text-primary-100 text-sm">
                        Affichage de {filteredVehicles.length} véhicule
                        {filteredVehicles.length > 1 ? "s" : ""} disponible
                        {filteredVehicles.length > 1 ? "s" : ""} pour vos dates
                      </p>
                    </div>
                    <button
                      onClick={() => setSearchCriteria(null)}
                      className="self-end sm:self-auto p-2 hover:bg-white/20 rounded-lg transition-colors"
                      title="Effacer la recherche"
                    >
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Filter Toggle & Sort */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-6 max-w-5xl mx-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-2xl hover:border-primary-500 transition-all"
              >
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
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
                <span className="font-medium">Filtres avancés</span>
                {showFilters && (
                  <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                    {
                      [selectedTransmission, selectedFuel].filter(
                        (f) => f !== "Tous",
                      ).length
                    }
                  </span>
                )}
              </button>

              <FormControl fullWidth>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  displayEmpty
                  sx={{
                    borderRadius: "1rem",
                    backgroundColor: "white",
                    fontWeight: 500,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderWidth: "2px",
                      borderColor: "#e5e7eb",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#3b82f6",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#3b82f6",
                    },
                    "& .MuiSelect-select": {
                      padding: "12px 24px",
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        mt: 1,
                        borderRadius: 2,
                        boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                      },
                    },
                  }}
                >
                  <MenuItem value="default">Trier par</MenuItem>
                  <MenuItem value="price-asc">Prix croissant</MenuItem>
                  <MenuItem value="price-desc">Prix décroissant</MenuItem>
                  <MenuItem value="name">Nom (A-Z)</MenuItem>
                </Select>
              </FormControl>

              <button
                onClick={resetFilters}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all font-medium"
              >
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Réinitialiser
              </button>

              <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 rounded-2xl">
                <span className="font-semibold text-primary-600">
                  {filteredVehicles.length}
                </span>
                <span className="text-gray-600">
                  véhicule{filteredVehicles.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 mb-8 animate-slideDown">
                <h3 className="font-bold text-lg mb-6 text-gray-900">
                  Filtres avancés
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Prix par jour: {priceRange[0]}dt - {priceRange[1]}dt
                    </label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="500"
                        value={priceRange[1]}
                        onChange={(e) =>
                          setPriceRange([
                            priceRange[0],
                            parseInt(e.target.value),
                          ])
                        }
                        className="w-full accent-primary-500"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={priceRange[0]}
                          onChange={(e) =>
                            setPriceRange([
                              parseInt(e.target.value) || 0,
                              priceRange[1],
                            ])
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={priceRange[1]}
                          onChange={(e) =>
                            setPriceRange([
                              priceRange[0],
                              parseInt(e.target.value) || 500,
                            ])
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Transmission */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Transmission
                    </label>
                    <div className="space-y-2">
                      {["Tous", "Automatique", "Manuelle"].map((trans) => (
                        <label
                          key={trans}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <input
                            type="radio"
                            name="transmission"
                            value={trans}
                            checked={selectedTransmission === trans}
                            onChange={(e) =>
                              setSelectedTransmission(e.target.value)
                            }
                            className="w-4 h-4 text-primary-600 accent-primary-500"
                          />
                          <span className="group-hover:text-primary-600 transition-colors">
                            {trans}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Fuel Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Carburant
                    </label>
                    <div className="space-y-2">
                      {[
                        "Tous",
                        "Essence",
                        "Diesel",
                        "Hybride",
                        "Électrique",
                      ].map((fuel) => (
                        <label
                          key={fuel}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <input
                            type="radio"
                            name="fuel"
                            value={fuel}
                            checked={selectedFuel === fuel}
                            onChange={(e) => setSelectedFuel(e.target.value)}
                            className="w-4 h-4 text-primary-600 accent-primary-500"
                          />
                          <span className="group-hover:text-primary-600 transition-colors">
                            {fuel}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Vehicles Grid */}
      <section className="pb-20 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div
            ref={vehiclesGrid.ref}
            className={`flex flex-wrap justify-center gap-5 sm:gap-8 transition-all duration-700 ${vehiclesGrid.isVisible ? "animate-fadeIn" : "opacity-100"}`}
          >
            {paginatedVehicles.map((vehicle, index) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                index={index}
                isVisible={vehiclesGrid.isVisible}
              />
            ))}
          </div>

          {/* Pagination */}
          {filteredVehicles.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={filteredVehicles.length}
            />
          )}

          {filteredVehicles.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
              <svg
                className="w-24 h-24 mx-auto text-gray-300 mb-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Aucun véhicule trouvé
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Essayez de modifier vos critères de recherche ou de
                réinitialiser les filtres.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-full transition-all"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Vehicles;
