import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import useScrollAnimation from "../hooks/useScrollAnimation";

const Services = () => {
  // Scroll animations
  const hero = useScrollAnimation({ threshold: 0.2 });
  const servicesGrid = useScrollAnimation({ threshold: 0.2 });
  const features = useScrollAnimation({ threshold: 0.2 });
  const cta = useScrollAnimation({ threshold: 0.3 });

  const mainServices = [
    {
      title: "Location Courte Durée",
      description:
        "Location flexible de 1 jour à plusieurs semaines pour vos déplacements ponctuels.",
      icon: (
        <svg
          className="w-12 h-12"
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
      features: [
        "Disponibilité immédiate",
        "Sans engagement",
        "Tarifs dégressifs",
        "Assurance incluse",
      ],
    },
    {
      title: "Location Longue Durée",
      description:
        "Solutions de location mensuelles et annuelles avec des tarifs avantageux.",
      icon: (
        <svg
          className="w-12 h-12"
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
      ),
      features: [
        "Contrats flexibles",
        "Maintenance incluse",
        "Véhicule de remplacement",
        "Prix préférentiels",
      ],
    },
    {
      title: "Location avec Chauffeur",
      description:
        "Service premium avec chauffeur professionnel pour vos événements et déplacements.",
      icon: (
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      features: [
        "Chauffeurs expérimentés",
        "Discrétion garantie",
        "Disponible 24/7",
        "Véhicules premium",
      ],
    },
    {
      title: "Location Événementielle",
      description:
        "Véhicules d'exception pour mariages, événements d'entreprise et occasions spéciales.",
      icon: (
        <svg
          className="w-12 h-12"
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
      features: [
        "Véhicules décorés",
        "Service personnalisé",
        "Forfaits sur mesure",
        "Coordination événement",
      ],
    },
    {
      title: "Transfert Aéroport",
      description:
        "Service de navette privée depuis et vers tous les aéroports de Tunisie.",
      icon: (
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      ),
      features: [
        "Suivi de vol",
        "Accueil personnalisé",
        "Tarif forfaitaire",
        "Paiement flexible",
      ],
    },
    {
      title: "Assistance Routière",
      description:
        "Support 24/7 en cas de panne, accident ou besoin d'assistance sur la route.",
      icon: (
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      features: [
        "Disponible 24/7",
        "Dépannage rapide",
        "Véhicule de remplacement",
        "Intervention dans toute la Tunisie",
      ],
    },
  ];

  const additionalFeatures = [
    {
      title: "Assurance Tous Risques",
      description: "Protection complète pour une tranquillité d'esprit totale",
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
    },
    {
      title: "GPS & Équipements",
      description: "Navigation GPS, sièges bébé et accessoires disponibles",
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
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      title: "Livraison Gratuite",
      description: "Livraison et récupération du véhicule à votre adresse",
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
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      ),
    },
    {
      title: "Paiement Flexible",
      description: "Espèces, carte bancaire ou paiement en ligne sécurisé",
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
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-40 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={hero.ref}
            className={`text-center transition-all duration-700 ${hero.isVisible ? "animate-fadeIn" : "opacity-0"}`}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Nos <span className="text-primary-600">Services</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Solutions de location flexibles pour particuliers et
              professionnels. Trouvez la formule adaptée à vos besoins.
            </p>
          </div>
        </div>
      </section>

      {/* Main Services Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={servicesGrid.ref}
            className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-700 ${servicesGrid.isVisible ? "animate-slideUp" : "opacity-0"}`}
          >
            {mainServices.map((service, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                style={{
                  animation: servicesGrid.isVisible
                    ? `slideUp 0.6s ease-out ${index * 100}ms both`
                    : "none",
                }}
              >
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-105 transition-transform">
                  {service.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                  {service.description}
                </p>

                {/* Features List */}
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={features.ref}
            className={`transition-all duration-700 ${features.isVisible ? "animate-fadeIn" : "opacity-0"}`}
          >
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-2 bg-primary-100 text-primary-600 rounded-full text-sm font-semibold mb-4">
                Inclus
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Tout est pris en charge
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {additionalFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="group text-center p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center text-primary-600 mx-auto mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={cta.ref}
            className={`bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-12 text-center text-white shadow-2xl transition-all duration-700 ${cta.isVisible ? "animate-scaleIn" : "opacity-0"}`}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Une question sur nos services?
            </h2>
            <p className="text-lg md:text-xl mb-8 text-primary-50 max-w-2xl mx-auto">
              Notre équipe est disponible pour vous accompagner dans le choix de
              la formule adaptée à vos besoins.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/contact"
                className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Nous contacter
              </Link>
              <Link
                to="/vehicles"
                className="px-8 py-4 bg-primary-700 text-white font-semibold rounded-xl border-2 border-white hover:bg-primary-600 hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Voir les véhicules
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
