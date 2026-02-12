import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Home = () => {
  const [searchData, setSearchData] = useState({
    pickupLocation: "",
    returnLocation: "",
    pickupDate: "",
    returnDate: "",
  });

  // Featured vehicles data
  const featuredVehicles = [
    {
      id: 1,
      name: "Mercedes-Benz Classe E",
      category: "Luxe",
      price: 150,
      image:
        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500",
      features: ["Automatique", "GPS", "Climatisation"],
    },
    {
      id: 2,
      name: "BMW Série 3",
      category: "Premium",
      price: 120,
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500",
      features: ["Automatique", "GPS", "Cuir"],
    },
    {
      id: 3,
      name: "Audi A4",
      category: "Premium",
      price: 110,
      image:
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500",
      features: ["Automatique", "GPS", "Sièges chauffants"],
    },
    {
      id: 4,
      name: "Range Rover Sport",
      category: "SUV Luxe",
      price: 200,
      image:
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500",
      features: ["4x4", "Automatique", "Toit panoramique"],
    },
  ];

  const categories = [
    { name: "Économique", icon: "💼", count: 12 },
    { name: "SUV", icon: "🚙", count: 8 },
    { name: "Luxe", icon: "👑", count: 6 },
    { name: "Sport", icon: "⚡", count: 4 },
  ];

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
        className="relative pt-40 pb-32 bg-gradient-to-br from-primary-50 via-white to-primary-50 overflow-hidden"
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
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-left space-y-8">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Conduisez le
                <span className="block bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  luxe
                </span>
                aujourd'hui
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Découvrez notre sélection de véhicules premium et profitez d'une
                expérience de location exceptionnelle.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="btn-primary flex items-center justify-center gap-2">
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Trouver un véhicule
                </button>
                <button className="btn-secondary flex items-center justify-center gap-2">
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  En savoir plus
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <div className="text-3xl font-bold text-primary-600">30+</div>
                  <div className="text-sm text-gray-600">Véhicules</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary-600">5★</div>
                  <div className="text-sm text-gray-600">Satisfaction</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary-600">
                    24/7
                  </div>
                  <div className="text-sm text-gray-600">Support</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop"
                  alt="Luxury car"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-6 z-20 hidden lg:block">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Vérifié & Sûr</div>
                    <div className="text-sm text-gray-600">
                      Tous nos véhicules
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="relative -mt-16 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h3 className="text-2xl font-bold mb-6">Réservez votre véhicule</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu de prise en charge
                </label>
                <select
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={searchData.pickupLocation}
                  onChange={(e) =>
                    setSearchData({
                      ...searchData,
                      pickupLocation: e.target.value,
                    })
                  }
                >
                  <option value="">Sélectionner une agence</option>
                  <option value="tunis">Tunis Centre</option>
                  <option value="sfax">Sfax</option>
                  <option value="sousse">Sousse</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de prise en charge
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={searchData.pickupDate}
                  onChange={(e) =>
                    setSearchData({ ...searchData, pickupDate: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de retour
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={searchData.returnDate}
                  onChange={(e) =>
                    setSearchData({ ...searchData, returnDate: e.target.value })
                  }
                />
              </div>

              <div className="flex items-end">
                <button className="w-full btn-primary">Rechercher</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Explorez par catégorie</h2>
            <p className="text-xl text-gray-600">
              Trouvez le véhicule parfait pour vos besoins
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div
                key={index}
                className="card group cursor-pointer hover:scale-105 transform transition-all"
              >
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600">{category.count} véhicules</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section id="vehicles" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Véhicules en vedette</h2>
            <p className="text-xl text-gray-600">
              Notre sélection de véhicules premium
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredVehicles.map((vehicle) => (
              <div key={vehicle.id} className="card group">
                <div className="relative overflow-hidden h-48">
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold">
                    {vehicle.category}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{vehicle.name}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {vehicle.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-primary-600">
                        {vehicle.price} DT
                      </span>
                      <span className="text-gray-600 text-sm">/jour</span>
                    </div>
                    <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                      Réserver
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="btn-secondary">Voir tous les véhicules</button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Pourquoi nous choisir?</h2>
            <p className="text-xl text-gray-600">
              Des services pensés pour votre confort
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-xl mb-4 group-hover:bg-primary-600 group-hover:text-white transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Prêt à prendre la route?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Réservez maintenant et profitez de nos offres exceptionnelles
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg">
              Voir les offres
            </button>
            <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-all">
              Nous contacter
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
