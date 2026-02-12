import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
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
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Elite Drive
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#home"
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
            >
              Accueil
            </a>
            <a
              href="#vehicles"
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
            >
              Véhicules
            </a>
            <a
              href="#services"
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
            >
              Services
            </a>
            <a
              href="#about"
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
            >
              À propos
            </a>
            <a
              href="#contact"
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
            >
              Contact
            </a>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
            >
              Connexion
            </Link>
            <Link to="/register" className="btn-primary">
              Inscription
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 animate-fadeIn">
            <div className="flex flex-col space-y-3">
              <a
                href="#home"
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium py-2"
              >
                Accueil
              </a>
              <a
                href="#vehicles"
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium py-2"
              >
                Véhicules
              </a>
              <a
                href="#services"
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium py-2"
              >
                Services
              </a>
              <a
                href="#about"
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium py-2"
              >
                À propos
              </a>
              <a
                href="#contact"
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium py-2"
              >
                Contact
              </a>
              <hr className="my-2" />
              <Link
                to="/login"
                className="text-primary-600 font-semibold text-left py-2"
              >
                Connexion
              </Link>
              <Link to="/register" className="btn-primary text-center">
                Inscription
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
