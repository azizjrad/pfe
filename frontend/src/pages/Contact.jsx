import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import useScrollAnimation from "../hooks/useScrollAnimation";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Scroll animations
  const leftColumn = useScrollAnimation({ threshold: 0.2 });
  const rightColumn = useScrollAnimation({ threshold: 0.2 });
  const logo = useScrollAnimation({ threshold: 0.3 });
  const title = useScrollAnimation({ threshold: 0.3 });
  const contactInfo = useScrollAnimation({ threshold: 0.3 });
  const social = useScrollAnimation({ threshold: 0.3 });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleBlur = (fieldName) => {
    setTouched({ ...touched, [fieldName]: true });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setTouched({});

      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-40 pb-16 bg-white">
        <div className="max-w-full mx-auto pl-20 pr-4">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left Column - Text Content */}
            <div
              ref={leftColumn.ref}
              className={`lg:col-span-4 lg:pl-8 lg:pt-8 transition-all duration-700 ${leftColumn.isVisible ? "opacity-100" : "opacity-0"}`}
            >
              <div
                ref={logo.ref}
                className={`transition-all duration-700 delay-100 ${logo.isVisible ? "animate-slideInLeft" : "opacity-0"}`}
              >
                <Link
                  to="/"
                  className="inline-flex items-center space-x-2 mb-8"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                    <img
                      src="/car-logo.svg"
                      alt="Elite Drive"
                      className="w-8 h-8"
                    />
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                    Elite Drive
                  </span>
                </Link>
              </div>

              <div
                ref={title.ref}
                className={`transition-all duration-700 delay-200 ${title.isVisible ? "animate-slideUp" : "opacity-0"}`}
              >
                <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                  <span className="text-gray-900">Contactez</span>{" "}
                  <span className="text-primary-500">nous</span>
                </h1>

                <p className="text-base text-gray-600 mb-8 leading-relaxed">
                  Notre équipe est là pour répondre à toutes vos questions.
                  Parlez-nous de votre projet de location.
                </p>
              </div>

              <div
                ref={contactInfo.ref}
                className={`mb-8 transition-all duration-700 delay-300 ${contactInfo.isVisible ? "animate-fadeIn" : "opacity-0"}`}
              >
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  Informations de contact:
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">
                      <strong>Adresse:</strong> 123 Avenue Habib Bourguiba,
                      Tunis 1000, Tunisie
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">
                      <strong>Téléphone:</strong> +216 71 123 456 / +216 98 765
                      432
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">
                      <strong>Email:</strong> contact@elitedrive.tn
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">
                      <strong>Horaires:</strong> Lun-Ven 8h-18h, Sam 9h-17h
                    </span>
                  </li>
                </ul>
              </div>

              <div
                ref={social.ref}
                className={`mb-8 transition-all duration-700 delay-[400ms] ${social.isVisible ? "animate-fadeIn" : "opacity-0"}`}
              >
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  Suivez-nous:
                </h3>
                <div className="flex space-x-3">
                  <a
                    href="#"
                    className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div
              ref={rightColumn.ref}
              className={`lg:col-span-7 lg:col-start-6 bg-white rounded-2xl p-8 lg:mr-8 transition-all duration-700 delay-200 ${rightColumn.isVisible ? "animate-slideInRight" : "opacity-0"}`}
            >
              {submitted ? (
                <div className="bg-gray-100 rounded-2xl p-12 text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Merci pour votre message.
                  </h2>
                  <p className="text-lg text-gray-700 leading-relaxed max-w-md mx-auto">
                    Notre équipe a bien reçu votre demande et vous contactera
                    dans les plus brefs délais.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  {/* Name */}
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={() => handleBlur("name")}
                      className={`w-full px-4 py-5 border rounded-lg focus:border-primary-500 transition-all duration-300 bg-gray-50 focus:bg-gray-50 text-lg text-black peer focus:outline-none ${
                        touched.name && !formData.name.trim()
                          ? "border-primary-500"
                          : "border-gray-300"
                      }`}
                      placeholder=" "
                    />
                    <label className="absolute left-4 top-4 text-black text-lg transition-all duration-300 peer-focus:text-sm peer-focus:-top-2 peer-focus:left-2 peer-focus:bg-white peer-focus:px-2 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-black pointer-events-none">
                      Nom complet*
                    </label>
                    {touched.name && !formData.name.trim() && (
                      <p className="mt-1 text-sm text-primary-500">
                        Veuillez compléter ce champ obligatoire.
                      </p>
                    )}
                  </div>

                  {/* Email and Phone */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={() => handleBlur("email")}
                        className={`w-full px-4 py-5 border rounded-lg focus:border-primary-500 transition-all duration-300 bg-gray-50 focus:bg-gray-50 text-lg text-black peer focus:outline-none ${
                          touched.email && !formData.email.trim()
                            ? "border-primary-500"
                            : "border-gray-300"
                        }`}
                        placeholder=" "
                      />
                      <label className="absolute left-4 top-4 text-black text-lg transition-all duration-300 peer-focus:text-sm peer-focus:-top-2 peer-focus:left-2 peer-focus:bg-white peer-focus:px-2 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-black pointer-events-none">
                        Email*
                      </label>
                      {touched.email && !formData.email.trim() && (
                        <p className="mt-1 text-sm text-primary-500">
                          Veuillez compléter ce champ obligatoire.
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={() => handleBlur("phone")}
                        className={`w-full px-4 py-5 border rounded-lg focus:border-primary-500 transition-all duration-300 bg-gray-50 focus:bg-gray-50 text-lg text-black peer focus:outline-none ${
                          touched.phone && !formData.phone.trim()
                            ? "border-primary-500"
                            : "border-gray-300"
                        }`}
                        placeholder=" "
                      />
                      <label className="absolute left-4 top-4 text-black text-lg transition-all duration-300 peer-focus:text-sm peer-focus:-top-2 peer-focus:left-2 peer-focus:bg-white peer-focus:px-2 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-black pointer-events-none">
                        Téléphone*
                      </label>
                      {touched.phone && !formData.phone.trim() && (
                        <p className="mt-1 text-sm text-primary-500">
                          Veuillez compléter ce champ obligatoire.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="relative">
                    <input
                      type="text"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      onBlur={() => handleBlur("subject")}
                      className={`w-full px-4 py-5 border rounded-lg focus:border-primary-500 transition-all duration-300 bg-gray-50 focus:bg-gray-50 text-lg text-black peer focus:outline-none ${
                        touched.subject && !formData.subject.trim()
                          ? "border-primary-500"
                          : "border-gray-300"
                      }`}
                      placeholder=" "
                    />
                    <label className="absolute left-4 top-4 text-black text-lg transition-all duration-300 peer-focus:text-sm peer-focus:-top-2 peer-focus:left-2 peer-focus:bg-white peer-focus:px-2 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-black pointer-events-none">
                      Sujet*
                    </label>
                    {touched.subject && !formData.subject.trim() && (
                      <p className="mt-1 text-sm text-primary-500">
                        Veuillez compléter ce champ obligatoire.
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="relative">
                    <textarea
                      name="message"
                      rows={6}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      onBlur={() => handleBlur("message")}
                      className={`w-full px-4 py-5 border rounded-lg focus:border-primary-500 transition-all duration-300 bg-gray-50 focus:bg-gray-50 text-lg text-black peer focus:outline-none resize-none ${
                        touched.message && !formData.message.trim()
                          ? "border-primary-500"
                          : "border-gray-300"
                      }`}
                      placeholder=" "
                    />
                    <label className="absolute left-4 top-4 text-black text-lg transition-all duration-300 peer-focus:text-sm peer-focus:-top-2 peer-focus:left-2 peer-focus:bg-white peer-focus:px-2 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:text-black pointer-events-none">
                      Message*
                    </label>
                    {touched.message && !formData.message.trim() && (
                      <p className="mt-1 text-sm text-primary-500">
                        Veuillez compléter ce champ obligatoire.
                      </p>
                    )}
                  </div>

                  {/* Privacy Notice */}
                  <div className="text-sm text-gray-600 leading-relaxed">
                    En soumettant ce formulaire, vous acceptez notre{" "}
                    <Link
                      to="/privacy-policy"
                      className="text-gray-800 hover:text-primary-500 font-bold underline"
                    >
                      politique de confidentialité
                    </Link>
                    .
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-8 py-4 bg-gray-800 hover:bg-primary-500 text-white font-semibold rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Envoi en cours...</span>
                      </div>
                    ) : (
                      "Envoyer le message"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
