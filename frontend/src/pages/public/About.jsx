import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import useScrollAnimation from "../../hooks/useScrollAnimation";

const About = () => {
  const { t } = useTranslation();

  // Scroll animations
  const hero = useScrollAnimation({ threshold: 0.2 });
  const story = useScrollAnimation({ threshold: 0.2 });
  const values = useScrollAnimation({ threshold: 0.2 });
  const stats = useScrollAnimation({ threshold: 0.2 });
  const cta = useScrollAnimation({ threshold: 0.3 });

  const companyValues = [
    {
      title: t("about.values.list.quality.title"),
      description: t("about.values.list.quality.desc"),
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
      title: t("about.values.list.transparency.title"),
      description: t("about.values.list.transparency.desc"),
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
      title: t("about.values.list.availability.title"),
      description: t("about.values.list.availability.desc"),
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
      title: t("about.values.list.flexibility.title"),
      description: t("about.values.list.flexibility.desc"),
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
    { number: "2015", label: t("about.stats.year") },
    { number: "150+", label: t("about.stats.vehicles") },
    { number: "3", label: t("about.stats.agencies") },
    { number: "24/7", label: t("about.stats.support") },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 sm:pt-32 lg:pt-40 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={hero.ref}
            className={`text-center transition-all duration-700 ${hero.isVisible ? "animate-fadeIn" : "opacity-0"}`}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              {t("about.hero.titlePart1")}<span className="text-primary-600">{t("app.name")}</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t("about.hero.description")}
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="pb-14 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={story.ref}
            className={`grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center transition-all duration-700 ${story.isVisible ? "animate-slideUp" : "opacity-0"}`}
          >
            <div>
              <div className="space-y-6">
                <div>
                  <span className="inline-block px-4 py-2 bg-primary-100 text-primary-600 rounded-full text-sm font-semibold mb-4">
                    {t("about.story.badge")}
                  </span>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {t("about.story.title")}
                  </h2>
                </div>
                <div className="space-y-4 text-gray-700 text-base sm:text-lg leading-relaxed">
                  <p>{t("about.story.p1")}</p>
                  <p>{t("about.story.p2")}</p>
                  <p>{t("about.story.p3")}</p>
                </div>
              </div>
            </div>

            <div className="relative mt-2 lg:mt-0">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800"
                  alt="Elite Drive Fleet"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-br from-primary-500/20 to-primary-700/20 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="pb-14 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={stats.ref}
            className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 transition-all duration-700 ${stats.isVisible ? "animate-fadeIn" : "opacity-0"}`}
          >
            {companyStats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-5 sm:p-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105"
                style={{
                  animation: stats.isVisible
                    ? `scaleIn 0.6s ease-out ${index * 100}ms both`
                    : "none",
                }}
              >
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-700 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="pb-14 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={values.ref}
            className={`transition-all duration-700 ${values.isVisible ? "animate-slideUp" : "opacity-0"}`}
          >
            <div className="text-center mb-8 sm:mb-12">
              <span className="inline-block px-4 py-2 bg-primary-100 text-primary-600 rounded-full text-sm font-semibold mb-4">
                {t("about.values.badge")}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                {t("about.values.title")}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {companyValues.map((value, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-5 sm:p-6 lg:p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                  style={{
                    animation: values.isVisible
                      ? `slideUp 0.6s ease-out ${index * 100}ms both`
                      : "none",
                  }}
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center text-primary-600 mb-4 sm:mb-6 group-hover:scale-105 transition-transform">
                    {value.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
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

      {/* Customer Success Section */}
      <section className="py-14 sm:py-20 lg:py-24 relative overflow-hidden bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="group bg-gray-200 hover:bg-gradient-to-br hover:from-yellow-50 hover:via-amber-50 hover:to-orange-50 rounded-3xl pt-6 sm:pt-8 px-4 sm:px-8 lg:px-12 xl:px-16 pb-6 sm:pb-8 shadow-lg hover:shadow-2xl transition-all duration-500 ease-out flex flex-col min-h-[320px] sm:min-h-[380px] md:min-h-[400px] cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1">
              {/* Enhanced multi-color glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/25 via-amber-200/20 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-xl"></div>

              {/* Additional secondary color accent */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-orange-200/15 to-amber-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>

              {/* Customer Success Header */}
              <div className="relative z-10 mb-8">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gray-800 group-hover:bg-gradient-to-br group-hover:from-yellow-500 group-hover:to-amber-500 rounded-full shadow-lg group-hover:scale-110 transition-all duration-300 group-hover:shadow-yellow-200/50">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white group-hover:text-white transition-colors duration-300"
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
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 group-hover:text-yellow-600 transition-colors duration-300">
                    {t("about.support.title")}
                  </h3>
                </div>
              </div>

              <div className="max-w-5xl flex-grow relative z-10">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium mb-8 sm:mb-10 text-gray-900 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
                  {t("about.support.description")}
                </h2>
              </div>

              <div className="max-w-5xl relative z-10">
                <Link
                  to="/contact"
                  className="group/btn relative inline-block px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-gray-800 border-2 border-gray-800 text-white font-medium rounded-full hover:bg-gradient-to-r hover:from-yellow-500 hover:to-amber-500 hover:border-yellow-500 hover:scale-105 transition-all duration-300 text-sm sm:text-base md:text-lg overflow-hidden backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-yellow-200/50"
                >
                  {/* Enhanced glass overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/25 via-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-all duration-500 rounded-full"></div>

                  {/* Premium shimmer effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"></div>

                  {/* Lighthouse-style inner glow */}
                  <div className="absolute inset-0 shadow-inner shadow-white/20 rounded-full transition-all duration-500"></div>

                  <span className="relative z-10">
                    {t("about.support.contactBtn")}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-14 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={cta.ref}
            className={`bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-6 sm:p-8 lg:p-12 text-center text-white shadow-2xl transition-all duration-700 ${cta.isVisible ? "animate-scaleIn" : "opacity-0"}`}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              {t("about.cta.title")}
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-primary-50 max-w-2xl mx-auto">
              {t("about.cta.description")}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link
                to="/vehicles"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary-600 font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                {t("about.cta.discoverBtn")}
              </Link>
              <Link
                to="/contact"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-primary-700 text-white font-semibold rounded-xl border-2 border-white hover:bg-primary-600 hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                {t("about.cta.contactBtn")}
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
