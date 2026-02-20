import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import VehicleCard from "../components/VehicleCard";
import useScrollAnimation from "../hooks/useScrollAnimation";

const Vehicles = () => {
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedTransmission, setSelectedTransmission] = useState("Tous");
  const [selectedFuel, setSelectedFuel] = useState("Tous");
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Scroll animations
  const hero = useScrollAnimation({ threshold: 0.2 });
  const filters = useScrollAnimation({ threshold: 0.2 });
  const vehiclesGrid = useScrollAnimation({ threshold: 0.2 });

  const categories = [
    {
      name: "Tous",
      icon: (
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
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      ),
    },
    {
      name: "Économique",
      icon: (
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
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      name: "SUV",
      icon: (
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      name: "Luxe",
      icon: (
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
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      ),
    },
    {
      name: "Sport",
      icon: (
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
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
  ];

  const vehicles = [
    {
      id: 1,
      name: "Mercedes-Benz Classe E",
      category: "Luxe",
      price: 150,
      image:
        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500",
      features: ["Automatique", "GPS", "Climatisation", "5 places"],
      transmission: "Automatique",
      fuel: "Diesel",
    },
    {
      id: 2,
      name: "BMW Série 3",
      category: "Luxe",
      price: 120,
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500",
      features: ["Automatique", "GPS", "Cuir", "5 places"],
      transmission: "Automatique",
      fuel: "Essence",
    },
    {
      id: 3,
      name: "Audi A4",
      category: "Luxe",
      price: 110,
      image:
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500",
      features: ["Automatique", "GPS", "Sièges chauffants", "5 places"],
      transmission: "Automatique",
      fuel: "Diesel",
    },
    {
      id: 4,
      name: "Range Rover Sport",
      category: "SUV",
      price: 200,
      image:
        "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=500",
      features: ["4x4", "Automatique", "Toit panoramique", "7 places"],
      transmission: "Automatique",
      fuel: "Diesel",
    },
    {
      id: 5,
      name: "Renault Clio",
      category: "Économique",
      price: 45,
      image:
        "https://images.unsplash.com/photo-1583267746897-f5d2c6e49f8b?w=500",
      features: ["Manuelle", "Climatisation", "5 places", "Bluetooth"],
      transmission: "Manuelle",
      fuel: "Essence",
    },
    {
      id: 6,
      name: "Peugeot 208",
      category: "Économique",
      price: 40,
      image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500",
      features: ["Manuelle", "Climatisation", "5 places", "Radio"],
      transmission: "Manuelle",
      fuel: "Essence",
    },
    {
      id: 7,
      name: "Porsche 911",
      category: "Sport",
      price: 300,
      image:
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500",
      features: ["Automatique", "GPS", "Cuir sport", "2 places"],
      transmission: "Automatique",
      fuel: "Essence",
    },
    {
      id: 8,
      name: "Toyota RAV4",
      category: "SUV",
      price: 90,
      image:
        "https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?w=500",
      features: ["Automatique", "GPS", "4x4", "5 places"],
      transmission: "Automatique",
      fuel: "Hybride",
    },
  ];

  const filteredVehicles = useMemo(() => {
    let result = vehicles;

    // Filter by category
    if (selectedCategory !== "Tous") {
      result = result.filter((v) => v.category === selectedCategory);
    }

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
    selectedCategory,
    searchQuery,
    priceRange,
    selectedTransmission,
    selectedFuel,
    sortBy,
  ]);

  const resetFilters = () => {
    setSelectedCategory("Tous");
    setSearchQuery("");
    setPriceRange([0, 500]);
    setSelectedTransmission("Tous");
    setSelectedFuel("Tous");
    setSortBy("default");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-40 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={hero.ref}
            className={`transition-all duration-700 ${hero.isVisible ? "animate-fadeIn" : "opacity-0"}`}
          >
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Notre <span className="text-primary-500">Flotte</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Découvrez notre large sélection de véhicules premium pour tous
                vos besoins. Des modèles économiques aux voitures de luxe.
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

            {/* Filter Toggle & Sort */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-2xl hover:border-primary-500 transition-all"
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

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-6 py-3 bg-white border-2 border-gray-200 rounded-2xl hover:border-primary-500 focus:border-primary-500 focus:outline-none transition-all font-medium cursor-pointer"
              >
                <option value="default">Trier par</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="name">Nom (A-Z)</option>
              </select>

              <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all font-medium"
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

              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-2xl">
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
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-8 animate-slideDown">
                <h3 className="font-bold text-lg mb-6 text-gray-900">
                  Filtres avancés
                </h3>

                <div className="grid md:grid-cols-3 gap-6">
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

      {/* Category Filters */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={filters.ref}
            className={`transition-all duration-700 ${filters.isVisible ? "animate-slideUp" : "opacity-0"}`}
          >
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`group relative px-6 py-3 rounded-2xl font-medium transition-all duration-500 overflow-hidden ${
                    selectedCategory === category.name
                      ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-xl scale-105"
                      : "bg-white/70 backdrop-blur-sm text-gray-700 hover:text-primary-600 hover:shadow-lg hover:scale-105 border-2 border-gray-200"
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {category.icon}
                    {category.name}
                  </span>

                  {selectedCategory !== category.name && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/10 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-all duration-500"></div>
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-2xl"></div>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vehicles Grid */}
      <section className="pb-20 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div
            ref={vehiclesGrid.ref}
            className={`flex flex-wrap justify-center gap-8 transition-all duration-700 ${vehiclesGrid.isVisible ? "animate-fadeIn" : "opacity-0"}`}
          >
            {filteredVehicles.map((vehicle, index) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                index={index}
                isVisible={vehiclesGrid.isVisible}
              />
            ))}
          </div>

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
