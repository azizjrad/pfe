import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import VehicleCard from "../../components/cards/VehicleCard";
import { Select, MenuItem, FormControl } from "@mui/material";
import useScrollAnimation from "../../hooks/useScrollAnimation";
import publicVehicleService from "../../services/publicVehicleService";

const Home = () => {
  const navigate = useNavigate();
  const [featuredVehicles, setFeaturedVehicles] = useState([]);

  // Scroll animations for sections
  const heroContentAnim = useScrollAnimation({ threshold: 0.2 });
  const vehiclesAnim = useScrollAnimation({ threshold: 0.2 });
  const featuresAnim = useScrollAnimation({ threshold: 0.2 });
  const ctaAnim = useScrollAnimation({ threshold: 0.3 });

  // State for scroll buttons
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const getCardStep = (container) => {
    if (!container) return 320;
    const firstCard = container.firstElementChild;
    if (!firstCard) return 320;

    const computedStyles = window.getComputedStyle(container);
    const gap = parseFloat(
      computedStyles.columnGap || computedStyles.gap || "0",
    );
    return firstCard.getBoundingClientRect().width + gap;
  };

  // Handle scroll pagination dots and buttons state
  useEffect(() => {
    const scrollContainer = document.getElementById(
      "vehicles-scroll-container",
    );
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrollLeft = scrollContainer.scrollLeft;
      const cardStep = getCardStep(scrollContainer);
      const activeIndex = Math.round(scrollLeft / cardStep);

      // Update dots
      document.querySelectorAll('[id^="scroll-dot-"]').forEach((dot, index) => {
        if (index === activeIndex) {
          dot.className =
            "h-2 w-8 rounded-full bg-primary-600 transition-all duration-300 cursor-pointer";
        } else {
          dot.className =
            "h-2 w-2 rounded-full bg-gray-300 transition-all duration-300 cursor-pointer hover:bg-gray-400";
        }
      });

      // Update scroll button states
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(
        scrollLeft <
          scrollContainer.scrollWidth - scrollContainer.clientWidth - 10,
      );
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();

    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch featured vehicles on component mount
  useEffect(() => {
    const fetchFeaturedVehicles = async () => {
      try {
        const response = await publicVehicleService.getAll(1, 4);
        if (response.success && response.data) {
          setFeaturedVehicles(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch featured vehicles:", error);
        setFeaturedVehicles([]);
      }
    };

    fetchFeaturedVehicles();
  }, []);

  // Scroll to specific card
  const scrollToCard = (index) => {
    const scrollContainer = document.getElementById(
      "vehicles-scroll-container",
    );
    if (!scrollContainer) return;

    const cardWidth = getCardStep(scrollContainer);
    scrollContainer.scrollTo({
      left: index * cardWidth,
      behavior: "smooth",
    });
  };

  // Scroll left/right
  const scrollLeft = () => {
    const scrollContainer = document.getElementById(
      "vehicles-scroll-container",
    );
    if (!scrollContainer) return;

    const cardWidth = getCardStep(scrollContainer);
    scrollContainer.scrollBy({
      left: -cardWidth,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    const scrollContainer = document.getElementById(
      "vehicles-scroll-container",
    );
    if (!scrollContainer) return;

    const cardWidth = getCardStep(scrollContainer);
    scrollContainer.scrollBy({
      left: cardWidth,
      behavior: "smooth",
    });
  };

  const [searchData, setSearchData] = useState({
    pickupLocation: "Tunis Carthage aéroport",
    returnLocation: "",
    pickupDate: "",
    pickupTime: "10:00",
    returnDate: "",
    returnTime: "10:00",
    category: "Tous",
  });

  // Handle search form submission
  const handleSearchSubmit = () => {
    // Validate dates are selected
    if (!searchData.pickupDate || !searchData.returnDate) {
      alert("Veuillez sélectionner les dates de prise en charge et de retour");
      return;
    }

    // Navigate to vehicles page with search parameters
    const searchParams = new URLSearchParams({
      location: searchData.pickupLocation,
      startDate: searchData.pickupDate,
      endDate: searchData.returnDate,
      startTime: searchData.pickupTime,
      endTime: searchData.returnTime,
    });

    // Add category if not "Tous"
    if (searchData.category && searchData.category !== "Tous") {
      searchParams.append("category", searchData.category);
    }

    navigate(`/vehicles?${searchParams.toString()}`);
  };

  const features = [
    {
      icon: (
        <svg
          className="w-8 h-8"
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
      ),
      title: "Réservation 24/7",
      description: "Réservez votre véhicule à tout moment en ligne",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      title: "Assurance complète",
      description: "Protection optimale pour une conduite en toute sérénité",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      title: "Meilleurs prix",
      description: "Tarifs compétitifs et transparents sans frais cachés",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      ),
      title: "Service client",
      description: "Assistance personnalisée pour chaque besoin",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section
        id="home"
        className="relative pt-32 lg:pt-40 pb-20 lg:pb-32 bg-gradient-to-br from-primary-50 via-white to-primary-50 overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-5">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <path
              fill="currentColor"
              d="M45.3,-59.4C57.5,-49.1,65.3,-33.5,69.8,-16.7C74.3,0.1,75.5,18.1,68.9,33.2C62.3,48.3,47.9,60.5,31.8,67.1C15.7,73.7,-2.1,74.7,-19.5,70.5C-36.9,66.3,-53.9,56.9,-64.3,43C-74.7,29.1,-78.5,10.8,-76.1,-6.7C-73.7,-24.2,-65.1,-40.9,-52.8,-50.9C-40.5,-60.9,-24.5,-64.2,-8.2,-64.6C8.1,-65,33.1,-69.7,45.3,-59.4Z"
              transform="translate(100 100)"
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start lg:items-center">
            {/* Hero Content */}
            <div
              ref={heroContentAnim.ref}
              className={`text-left space-y-8 transition-all duration-700 ${heroContentAnim.isVisible ? "animate-slideInLeft" : "opacity-0"}`}
            >
              {/* Booking Card */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 p-5 sm:p-6 md:p-8 max-w-md mx-auto lg:mx-0 hover:shadow-3xl transition-shadow duration-300">
                <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-6">
                  <div className="p-2 bg-primary-50 rounded-lg">
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
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                    Rechercher un véhicule
                  </h2>
                </div>

                {/* Pick up and return location */}
                <div className="mb-5">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Lieu de prise en charge et de retour
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <svg
                        className="w-5 h-5 text-primary-500 group-focus-within:text-primary-600 transition-colors"
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
                    <FormControl fullWidth>
                      <Select
                        value={searchData.pickupLocation}
                        onChange={(e) =>
                          setSearchData({
                            ...searchData,
                            pickupLocation: e.target.value,
                          })
                        }
                        sx={{
                          borderRadius: "9999px",
                          backgroundColor: "#f9fafb",
                          paddingLeft: "2.5rem",
                          fontSize: "0.875rem",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderWidth: "2px",
                            borderColor: "#e5e7eb",
                          },
                          "&:hover": {
                            backgroundColor: "#eff6ff",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#60a5fa",
                            },
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "white",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#3b82f6",
                              borderWidth: "2px",
                            },
                          },
                          "& .MuiSelect-select": {
                            paddingTop: "0.75rem",
                            paddingBottom: "0.75rem",
                          },
                        }}
                      >
                        <MenuItem value="Tunis Carthage aéroport">
                          Tunis Carthage aéroport
                        </MenuItem>
                        <MenuItem value="Tunis Centre">Tunis Centre</MenuItem>
                        <MenuItem value="Sfax">Sfax</MenuItem>
                        <MenuItem value="Sousse">Sousse</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                  <div className="mt-3 flex items-center">
                    <input
                      type="checkbox"
                      id="differentLocation"
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:outline-none cursor-pointer"
                    />
                    <label
                      htmlFor="differentLocation"
                      className="ml-2 text-xs sm:text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition-colors"
                    >
                      lieu de retour différent
                    </label>
                  </div>
                </div>

                {/* Pick up date */}
                <div className="mb-5">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Date de prise en charge
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                    <div className="relative group">
                      <input
                        type="date"
                        value={searchData.pickupDate}
                        onChange={(e) =>
                          setSearchData({
                            ...searchData,
                            pickupDate: e.target.value,
                          })
                        }
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:bg-white transition-all duration-200 cursor-pointer hover:border-gray-300 appearance-none"
                      />
                    </div>
                    <div className="relative group">
                      <FormControl fullWidth>
                        <Select
                          value={searchData.pickupTime}
                          onChange={(e) =>
                            setSearchData({
                              ...searchData,
                              pickupTime: e.target.value,
                            })
                          }
                          sx={{
                            borderRadius: "9999px",
                            backgroundColor: "#f9fafb",
                            fontSize: "0.875rem",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderWidth: "2px",
                              borderColor: "#e5e7eb",
                            },
                            "&:hover": {
                              backgroundColor: "#eff6ff",
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#60a5fa",
                              },
                              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            },
                            "&.Mui-focused": {
                              backgroundColor: "white",
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#3b82f6",
                                borderWidth: "2px",
                              },
                            },
                            "& .MuiSelect-select": {
                              paddingTop: "0.625rem",
                              paddingBottom: "0.625rem",
                            },
                          }}
                        >
                          <MenuItem value="00:00">00:00</MenuItem>
                          <MenuItem value="01:00">01:00</MenuItem>
                          <MenuItem value="02:00">02:00</MenuItem>
                          <MenuItem value="03:00">03:00</MenuItem>
                          <MenuItem value="04:00">04:00</MenuItem>
                          <MenuItem value="05:00">05:00</MenuItem>
                          <MenuItem value="06:00">06:00</MenuItem>
                          <MenuItem value="07:00">07:00</MenuItem>
                          <MenuItem value="08:00">08:00</MenuItem>
                          <MenuItem value="09:00">09:00</MenuItem>
                          <MenuItem value="10:00">10:00</MenuItem>
                          <MenuItem value="11:00">11:00</MenuItem>
                          <MenuItem value="12:00">12:00</MenuItem>
                          <MenuItem value="13:00">13:00</MenuItem>
                          <MenuItem value="14:00">14:00</MenuItem>
                          <MenuItem value="15:00">15:00</MenuItem>
                          <MenuItem value="16:00">16:00</MenuItem>
                          <MenuItem value="17:00">17:00</MenuItem>
                          <MenuItem value="18:00">18:00</MenuItem>
                          <MenuItem value="19:00">19:00</MenuItem>
                          <MenuItem value="20:00">20:00</MenuItem>
                          <MenuItem value="21:00">21:00</MenuItem>
                          <MenuItem value="22:00">22:00</MenuItem>
                          <MenuItem value="23:00">23:00</MenuItem>
                        </Select>
                      </FormControl>
                    </div>
                  </div>
                </div>

                {/* Return date */}
                <div className="mb-5">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Date de retour
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                    <div className="relative group">
                      <input
                        type="date"
                        value={searchData.returnDate}
                        onChange={(e) =>
                          setSearchData({
                            ...searchData,
                            returnDate: e.target.value,
                          })
                        }
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:bg-white transition-all duration-200 cursor-pointer hover:border-gray-300 appearance-none"
                      />
                    </div>
                    <div className="relative group">
                      <FormControl fullWidth>
                        <Select
                          value={searchData.returnTime}
                          onChange={(e) =>
                            setSearchData({
                              ...searchData,
                              returnTime: e.target.value,
                            })
                          }
                          sx={{
                            borderRadius: "9999px",
                            backgroundColor: "#f9fafb",
                            fontSize: "0.875rem",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderWidth: "2px",
                              borderColor: "#e5e7eb",
                            },
                            "&:hover": {
                              backgroundColor: "#eff6ff",
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#60a5fa",
                              },
                              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            },
                            "&.Mui-focused": {
                              backgroundColor: "white",
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#3b82f6",
                                borderWidth: "2px",
                              },
                            },
                            "& .MuiSelect-select": {
                              paddingTop: "0.625rem",
                              paddingBottom: "0.625rem",
                            },
                          }}
                        >
                          <MenuItem value="00:00">00:00</MenuItem>
                          <MenuItem value="01:00">01:00</MenuItem>
                          <MenuItem value="02:00">02:00</MenuItem>
                          <MenuItem value="03:00">03:00</MenuItem>
                          <MenuItem value="04:00">04:00</MenuItem>
                          <MenuItem value="05:00">05:00</MenuItem>
                          <MenuItem value="06:00">06:00</MenuItem>
                          <MenuItem value="07:00">07:00</MenuItem>
                          <MenuItem value="08:00">08:00</MenuItem>
                          <MenuItem value="09:00">09:00</MenuItem>
                          <MenuItem value="10:00">10:00</MenuItem>
                          <MenuItem value="11:00">11:00</MenuItem>
                          <MenuItem value="12:00">12:00</MenuItem>
                          <MenuItem value="13:00">13:00</MenuItem>
                          <MenuItem value="14:00">14:00</MenuItem>
                          <MenuItem value="15:00">15:00</MenuItem>
                          <MenuItem value="16:00">16:00</MenuItem>
                          <MenuItem value="17:00">17:00</MenuItem>
                          <MenuItem value="18:00">18:00</MenuItem>
                          <MenuItem value="19:00">19:00</MenuItem>
                          <MenuItem value="20:00">20:00</MenuItem>
                          <MenuItem value="21:00">21:00</MenuItem>
                          <MenuItem value="22:00">22:00</MenuItem>
                          <MenuItem value="23:00">23:00</MenuItem>
                        </Select>
                      </FormControl>
                    </div>
                  </div>
                </div>

                {/* Category selection */}
                <div className="mb-6">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Type de véhicule (optionnel)
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <svg
                        className="w-5 h-5 text-primary-500 group-focus-within:text-primary-600 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                    </div>
                    <FormControl fullWidth>
                      <Select
                        value={searchData.category}
                        onChange={(e) =>
                          setSearchData({
                            ...searchData,
                            category: e.target.value,
                          })
                        }
                        sx={{
                          borderRadius: "9999px",
                          backgroundColor: "#f9fafb",
                          paddingLeft: "2.5rem",
                          fontSize: "0.875rem",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderWidth: "2px",
                            borderColor: "#e5e7eb",
                          },
                          "&:hover": {
                            backgroundColor: "#eff6ff",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#60a5fa",
                            },
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "white",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#3b82f6",
                              borderWidth: "2px",
                            },
                          },
                          "& .MuiSelect-select": {
                            paddingTop: "0.75rem",
                            paddingBottom: "0.75rem",
                          },
                        }}
                      >
                        <MenuItem value="Tous">Tous les véhicules</MenuItem>
                        <MenuItem value="Économique">Économique</MenuItem>
                        <MenuItem value="SUV">SUV</MenuItem>
                        <MenuItem value="Luxe">Luxe</MenuItem>
                        <MenuItem value="Sport">Sport</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                </div>

                {/* Search button */}
                <button
                  onClick={handleSearchSubmit}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group text-sm sm:text-base"
                >
                  <span>Rechercher des véhicules</span>
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-200"
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
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative hidden lg:flex justify-end">
              <img
                src="/clio.png"
                alt="Renault Clio"
                className="w-full max-w-2xl object-contain drop-shadow-[0_30px_35px_rgba(0,0,0,0.25)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section
        ref={vehiclesAnim.ref}
        id="vehicles"
        className={`py-14 sm:py-16 md:py-20 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 transition-all duration-700 ${vehiclesAnim.isVisible ? "animate-slideUp" : "opacity-0"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">
              Véhicules en vedette
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              Notre sélection de véhicules premium
            </p>
          </div>

          {/* Horizontal Scrollable Container */}
          <div className="relative">
            {/* Left Scroll Button */}
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className={`hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm shadow-lg items-center justify-center transition-all duration-300 text-gray-900 ${
                canScrollLeft
                  ? "opacity-100 hover:bg-primary-600 hover:text-white cursor-pointer"
                  : "opacity-30 cursor-not-allowed"
              }`}
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

            {/* Right Scroll Button */}
            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              className={`hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm shadow-lg items-center justify-center transition-all duration-300 text-gray-900 ${
                canScrollRight
                  ? "opacity-100 hover:bg-primary-600 hover:text-white cursor-pointer"
                  : "opacity-30 cursor-not-allowed"
              }`}
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

            <div
              id="vehicles-scroll-container"
              className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide scroll-smooth px-1 sm:px-12"
            >
              {featuredVehicles.map((vehicle, index) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  index={index}
                  isVisible={vehiclesAnim.isVisible}
                  className="flex-none w-[240px] sm:w-[300px] lg:w-[340px]"
                />
              ))}
            </div>

            {/* Scroll Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {featuredVehicles.map((_, index) => (
                <div
                  key={index}
                  id={`scroll-dot-${index}`}
                  onClick={() => scrollToCard(index)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    index === 0
                      ? "w-8 bg-primary-600"
                      : "w-2 bg-gray-300 hover:bg-gray-400"
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Scrollbar Styles */}
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </section>

      {/* Features Section */}
      <section
        ref={featuresAnim.ref}
        id="services"
        className={`py-24 bg-gradient-to-br from-gray-50 via-white to-primary-50 relative overflow-hidden transition-all duration-700 ${featuresAnim.isVisible ? "animate-fadeIn" : "opacity-0"}`}
      >
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-primary-100 text-primary-600 rounded-full text-sm font-semibold mb-4">
              Nos avantages
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Pourquoi nous choisir?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des services pensés pour votre confort et votre sérénité
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="relative group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-primary-200 h-full transform hover:-translate-y-2">
                  {/* Gradient background on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

                  {/* Icon with animated background */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-primary-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
                    <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-50 text-primary-600 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 group-hover:shadow-xl">
                      {feature.icon}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-3 relative group-hover:text-primary-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 relative leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-100 to-transparent opacity-0 group-hover:opacity-50 rounded-bl-full transition-opacity duration-500"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes blob {
            0%,
            100% {
              transform: translate(0, 0) scale(1);
            }
            25% {
              transform: translate(20px, -20px) scale(1.1);
            }
            50% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            75% {
              transform: translate(20px, 20px) scale(1.05);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
        `}</style>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaAnim.ref}
        className={`py-24 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white relative overflow-hidden transition-all duration-700 ${ctaAnim.isVisible ? "animate-scaleIn" : "opacity-0"}`}
      >
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-soft-light opacity-10 animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-300 rounded-full mix-blend-soft-light opacity-10 animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
            <svg
              className="w-full h-full opacity-5"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grid)" />
              <defs>
                <pattern
                  id="grid"
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 10 0 L 0 0 0 10"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
            </svg>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Prêt à prendre la route?
            </h2>
            <p className="text-xl md:text-2xl mb-10 text-primary-100 max-w-3xl mx-auto leading-relaxed">
              Réservez maintenant et profitez de nos offres exceptionnelles avec
              des véhicules premium
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button className="group bg-white text-primary-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 flex items-center justify-center gap-2">
                <span>Voir les offres</span>
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
              <button className="group bg-transparent border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-primary-600 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>Nous contacter</span>
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-8 items-center opacity-90">
              <div className="flex items-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-semibold">Paiement sécurisé</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-semibold">Annulation gratuite</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="font-semibold">Support 24/7</span>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes float {
            0%,
            100% {
              transform: translate(0, 0) rotate(0deg);
            }
            25% {
              transform: translate(10px, -10px) rotate(5deg);
            }
            50% {
              transform: translate(-10px, 10px) rotate(-5deg);
            }
            75% {
              transform: translate(10px, 10px) rotate(3deg);
            }
          }
          @keyframes float-delayed {
            0%,
            100% {
              transform: translate(0, 0) rotate(0deg);
            }
            25% {
              transform: translate(-15px, 10px) rotate(-3deg);
            }
            50% {
              transform: translate(15px, -10px) rotate(3deg);
            }
            75% {
              transform: translate(-10px, -10px) rotate(-5deg);
            }
          }
          .animate-float {
            animation: float 8s infinite ease-in-out;
          }
          .animate-float-delayed {
            animation: float-delayed 10s infinite ease-in-out;
          }
        `}</style>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
