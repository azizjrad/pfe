import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import useScrollAnimation from "../../hooks/useScrollAnimation";

const About = () => {
  // Scroll animations
  const hero = useScrollAnimation({ threshold: 0.2 });
  const story = useScrollAnimation({ threshold: 0.2 });
  const values = useScrollAnimation({ threshold: 0.2 });
  const team = useScrollAnimation({ threshold: 0.2 });
  const stats = useScrollAnimation({ threshold: 0.2 });
  const cta = useScrollAnimation({ threshold: 0.3 });

  const companyValues = [
    {
      title: "Qualité",
      description:
        "Véhicules récents et bien entretenus. Contrôle systématique avant chaque location.",
      icon: (
        <svg
          className="w-10 h-10"
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
      title: "Transparence",
      description:
        "Tarifs clairs affichés en ligne. Pas de frais cachés. État des lieux détaillé.",
      icon: (
        <svg
          className="w-10 h-10"
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
      title: "Disponibilité",
      description:
        "Réservation en ligne 24/7. Service client joignable tous les jours. Réponse rapide.",
      icon: (
        <svg
          className="w-10 h-10"
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
    },
    {
      title: "Flexibilité",
      description:
        "Formules adaptées à tous les besoins. Modifications possibles. Plusieurs modes de paiement.",
      icon: (
        <svg
          className="w-10 h-10"
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
      ),
    },
  ];

  const companyStats = [
    { number: "2015", label: "Année de création" },
    { number: "150+", label: "Véhicules" },
    { number: "3", label: "Agences" },
    { number: "24/7", label: "Assistance" },
  ];

  const teamMembers = [
    {
      name: "Mohamed Ben Ali",
      role: "Directeur Général",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    },
    {
      name: "Amira Trabelsi",
      role: "Responsable Service Client",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    },
    {
      name: "Karim Hamza",
      role: "Chef de Parc Automobile",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    },
    {
      name: "Salma Mansour",
      role: "Responsable Marketing",
      image:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400",
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
              À Propos d'<span className="text-primary-600">Elite Drive</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Location de véhicules haut de gamme en Tunisie. Une approche
              centrée sur la qualité du service et la satisfaction client.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={story.ref}
            className={`grid lg:grid-cols-2 gap-12 items-center transition-all duration-700 ${story.isVisible ? "animate-slideUp" : "opacity-0"}`}
          >
            <div>
              <div className="space-y-6">
                <div>
                  <span className="inline-block px-4 py-2 bg-primary-100 text-primary-600 rounded-full text-sm font-semibold mb-4">
                    Depuis 2015
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Qui sommes-nous
                  </h2>
                </div>
                <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
                  <p>
                    Elite Drive est une entreprise tunisienne spécialisée dans
                    la location de véhicules. Nous proposons une gamme variée
                    allant des citadines économiques aux véhicules haut de
                    gamme.
                  </p>
                  <p>
                    Notre flotte de plus de 150 véhicules est régulièrement
                    renouvelée et soigneusement entretenue. Chaque véhicule fait
                    l'objet d'un contrôle technique rigoureux avant chaque
                    location.
                  </p>
                  <p>
                    Avec des agences à Tunis, Sousse et Sfax, nous servons aussi
                    bien les particuliers que les professionnels pour leurs
                    besoins ponctuels ou réguliers.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800"
                  alt="Elite Drive Fleet"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-6 -right-6 w-72 h-72 bg-gradient-to-br from-primary-500/20 to-primary-700/20 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={stats.ref}
            className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-8 transition-all duration-700 ${stats.isVisible ? "animate-fadeIn" : "opacity-0"}`}
          >
            {companyStats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105"
                style={{
                  animation: stats.isVisible
                    ? `scaleIn 0.6s ease-out ${index * 100}ms both`
                    : "none",
                }}
              >
                <div className="text-5xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-700 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={values.ref}
            className={`transition-all duration-700 ${values.isVisible ? "animate-slideUp" : "opacity-0"}`}
          >
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-2 bg-primary-100 text-primary-600 rounded-full text-sm font-semibold mb-4">
                Nos engagements
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Ce qui nous guide
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {companyValues.map((value, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                  style={{
                    animation: values.isVisible
                      ? `slideUp 0.6s ease-out ${index * 100}ms both`
                      : "none",
                  }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center text-primary-600 mb-6 group-hover:scale-105 transition-transform">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={team.ref}
            className={`transition-all duration-700 ${team.isVisible ? "animate-fadeIn" : "opacity-0"}`}
          >
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-2 bg-primary-100 text-primary-600 rounded-full text-sm font-semibold mb-4">
                L'équipe
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                À votre service
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Une équipe expérimentée disponible pour vous accompagner
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="group text-center"
                  style={{
                    animation: team.isVisible
                      ? `slideUp 0.6s ease-out ${index * 100}ms both`
                      : "none",
                  }}
                >
                  <div className="relative mb-6 overflow-hidden rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary-600 text-sm font-medium">
                    {member.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Customer Success Section */}
      <section className="py-24 relative overflow-hidden bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="group bg-gray-200 hover:bg-gradient-to-br hover:from-yellow-50 hover:via-amber-50 hover:to-orange-50 rounded-3xl pt-8 px-6 sm:px-10 md:px-16 pb-8 shadow-lg hover:shadow-2xl transition-all duration-500 ease-out flex flex-col min-h-[400px] cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1">
              {/* Enhanced multi-color glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/25 via-amber-200/20 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-xl"></div>

              {/* Additional secondary color accent */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-orange-200/15 to-amber-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>

              {/* Customer Success Header */}
              <div className="relative z-10 mb-8">
                <div className="flex items-center gap-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 group-hover:bg-gradient-to-br group-hover:from-yellow-500 group-hover:to-amber-500 rounded-full shadow-lg group-hover:scale-110 transition-all duration-300 group-hover:shadow-yellow-200/50">
                    <svg
                      className="w-7 h-7 text-white group-hover:text-white transition-colors duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 group-hover:text-yellow-600 transition-colors duration-300">
                    Satisfaction Client
                  </h3>
                </div>
              </div>

              <div className="max-w-5xl flex-grow relative z-10">
                <h2 className="text-4xl md:text-5xl font-medium mb-10 text-gray-900 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
                  Nos clients sont notre priorité. Questions ou commentaires?
                  Nous sommes là pour vous aider, avec un support disponible
                  24h/24.
                </h2>
              </div>

              <div className="max-w-5xl relative z-10">
                <Link
                  to="/contact"
                  className="group/btn relative inline-block px-10 py-5 bg-gray-800 border-2 border-gray-800 text-white font-medium rounded-full hover:bg-gradient-to-r hover:from-yellow-500 hover:to-amber-500 hover:border-yellow-500 hover:scale-105 transition-all duration-300 text-lg overflow-hidden backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-yellow-200/50"
                >
                  {/* Enhanced glass overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/25 via-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-all duration-500 rounded-full"></div>

                  {/* Premium shimmer effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"></div>

                  {/* Lighthouse-style inner glow */}
                  <div className="absolute inset-0 shadow-inner shadow-white/20 rounded-full transition-all duration-500"></div>

                  <span className="relative z-10">
                    Contacter le service client
                  </span>
                </Link>
              </div>
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
              Besoin d'un véhicule?
            </h2>
            <p className="text-lg md:text-xl mb-8 text-primary-50 max-w-2xl mx-auto">
              Consultez notre flotte et réservez en ligne en quelques clics.
              Notre équipe reste à votre disposition pour toute question.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/vehicles"
                className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Découvrir nos véhicules
              </Link>
              <Link
                to="/contact"
                className="px-8 py-4 bg-primary-700 text-white font-semibold rounded-xl border-2 border-white hover:bg-primary-600 hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
