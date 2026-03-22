import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ProfileMenu from "./ProfileMenu";
import { ADMIN_ROLES } from "../../constants/roles";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Update scrolled state for styling
      setScrolled(currentScrollY > 10);

      // Show navbar when at top or scrolling up, hide when scrolling down
      if (currentScrollY < 10) {
        setShowNavbar(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down
        setShowNavbar(false);
      } else {
        // Scrolling up
        setShowNavbar(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  // Handle closing with animation delay
  const handleCloseSidebar = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsMenuOpen(false);
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  // Only show public navigation to clients and unauthenticated users
  // Admins should only access their dashboard
  const isAdmin = ADMIN_ROLES.includes(user?.role);

  const allNavItems = [
    {
      name: "Accueil",
      path: "/",
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
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: "Véhicules",
      path: "/vehicles",
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
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      ),
    },
    {
      name: "Agences",
      path: "/agencies",
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
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    {
      name: "À propos",
      path: "/about",
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
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      name: "Contact",
      path: "/contact",
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
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ];

  // Hide public pages from admins - they should only use dashboard
  const navItems = isAdmin ? [] : allNavItems;

  return (
    <nav
      className={`fixed left-0 right-0 z-[1000] transition-all duration-500 ${showNavbar || isMenuOpen || isClosing ? "top-0" : "-top-40"}`}
    >
      {/* Glass Morphism Container */}
      <div className="px-4 md:px-6 py-2">
        <div
          className={`relative transition-all duration-700 bg-white/70 backdrop-blur-[20px] supports-[backdrop-filter]:bg-white/70 border border-gray-200/50 shadow-2xl shadow-primary-500/10 rounded-2xl md:rounded-3xl ${scrolled ? "shadow-xl" : ""}`}
        >
          {/* Multi-layer gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-primary-300/3 to-primary-500/5 opacity-100 rounded-2xl md:rounded-3xl"></div>

          {/* Glass reflection */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/10 to-transparent opacity-100 rounded-2xl md:rounded-3xl"></div>

          {/* Subtle inner glow */}
          <div className="absolute inset-0 shadow-inner shadow-primary-500/5 opacity-100 rounded-2xl md:rounded-3xl"></div>

          <div className="relative z-10 w-full px-6 md:px-8">
            <div
              className={`flex items-center transition-all duration-700 ${scrolled ? "py-3" : "py-4"}`}
            >
              {/* Mobile Menu Button - Left on mobile, hidden on desktop */}
              <div className="md:hidden flex-shrink-0 order-1">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="group relative p-2.5 rounded-2xl transition-all duration-500 bg-gray-100/60 hover:bg-gray-200/60 backdrop-blur-[20px] border border-gray-300/30 hover:border-gray-400/50 shadow-lg hover:shadow-xl hover:shadow-primary-500/15 hover:scale-105"
                >
                  <div className="w-6 h-6 flex flex-col justify-center items-center relative z-10">
                    <span
                      className={`block w-6 h-0.5 transition-all duration-500 bg-gray-700 ${isMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}
                    ></span>
                    <span
                      className={`block w-6 h-0.5 mt-1.5 transition-all duration-500 bg-gray-700 ${isMenuOpen ? "opacity-0" : ""}`}
                    ></span>
                    <span
                      className={`block w-6 h-0.5 mt-1.5 transition-all duration-500 bg-gray-700 ${isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
                    ></span>
                  </div>

                  {/* Glass reflection */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/10 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-all duration-500"></div>

                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-2xl"></div>
                </button>
              </div>

              {/* Mobile spacer */}
              <div className="md:hidden flex-1 order-2"></div>

              {/* Logo - Right on mobile, Left on desktop */}
              <div className="relative flex-shrink-0 order-3 md:order-1">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-lg">
                    <img
                      src="/car-logo.svg"
                      alt="Elite Drive"
                      className="w-6 h-6"
                    />
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                    Elite Drive
                  </span>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center justify-center flex-1 pl-8 order-2">
                <div className="flex items-center space-x-1">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `group relative px-4 py-2.5 rounded-2xl font-medium transition-all duration-500 overflow-hidden ${
                          isActive
                            ? "text-primary-600 bg-primary-50/50 backdrop-blur-[16px] shadow-lg shadow-primary-500/10"
                            : "text-gray-700 hover:text-primary-600 hover:bg-gray-100/50 hover:backdrop-blur-[16px] hover:shadow-lg hover:scale-105"
                        }`
                      }
                    >
                      <span className="relative z-10">{item.name}</span>

                      {/* Glass reflection */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/10 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-all duration-500"></div>

                      {/* Shimmer effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-2xl"></div>
                    </NavLink>
                  ))}
                </div>
              </div>

              {/* Desktop Auth Buttons / Profile Menu */}
              <div className="hidden md:flex items-center space-x-3 flex-shrink-0 order-3">
                {isAuthenticated && user ? (
                  <ProfileMenu />
                ) : (
                  <Link
                    to="/login"
                    className="group relative px-6 py-2.5 font-semibold rounded-2xl transition-all duration-500 overflow-hidden bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg hover:shadow-xl hover:shadow-primary-500/25 hover:scale-105"
                  >
                    <span className="relative z-10">Connexion</span>

                    {/* Glass overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/25 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl"></div>

                    {/* Premium shimmer */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>

                    {/* Inner glow */}
                    <div className="absolute inset-0 shadow-inner shadow-primary-300/20 rounded-2xl"></div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {(isMenuOpen || isClosing) && (
        <>
          {/* Backdrop Overlay */}
          <div
            className={`fixed inset-0 bg-black transition-opacity duration-300 md:hidden ${
              isMenuOpen && !isClosing ? "opacity-50" : "opacity-0"
            }`}
            style={{ zIndex: 998 }}
            onClick={handleCloseSidebar}
          />

          {/* Sidebar Panel */}
          <div
            className={`fixed top-0 left-0 h-full w-80 bg-white/70 backdrop-blur-[20px] shadow-2xl flex flex-col transition-transform duration-300 ease-out md:hidden ${
              isMenuOpen && !isClosing ? "translate-x-0" : "-translate-x-full"
            }`}
            style={{ zIndex: 999 }}
          >
            {/* Multi-layer gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-primary-300/3 to-primary-500/5 opacity-100"></div>

            {/* Glass reflection */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/10 to-transparent opacity-100"></div>

            {/* Subtle inner glow */}
            <div className="absolute inset-0 shadow-inner shadow-primary-500/5 opacity-100"></div>

            {/* Sidebar Header */}
            <div className="relative z-10 flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-primary-50/50 to-primary-100/50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg shadow-lg">
                  <svg
                    className="w-5 h-5 text-white"
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
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  Menu
                </h2>
              </div>
              <button
                onClick={handleCloseSidebar}
                className="group relative text-gray-600 hover:text-primary-600 hover:bg-white/50 rounded-lg p-2 transition-all duration-300"
              >
                <svg
                  className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300"
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

            {/* Scrollable Sidebar Content */}
            <div className="relative z-10 flex-1 overflow-y-auto">
              <div className="flex min-h-full flex-col justify-between">
                <div className="p-6 space-y-2">
                  {/* Navigation Links with staggered animation */}
                  {navItems.map((item, index) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={handleCloseSidebar}
                      style={{
                        animation:
                          isMenuOpen && !isClosing
                            ? `slideInFromLeft 0.3s ease-out ${100 + index * 50}ms both`
                            : "none",
                      }}
                    >
                      {({ isActive }) => (
                        <div
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 group ${
                            isActive
                              ? "text-primary-600 bg-primary-50/50 shadow-md"
                              : "text-gray-700 hover:text-primary-600 hover:bg-gray-100/50"
                          }`}
                        >
                          <span
                            className={`transition-colors ${
                              isActive
                                ? "text-primary-600"
                                : "text-gray-400 group-hover:text-primary-600"
                            }`}
                          >
                            {item.icon}
                          </span>
                          <span className="font-medium">{item.name}</span>
                        </div>
                      )}
                    </NavLink>
                  ))}
                </div>

                {/* Action Buttons */}
                {/* Mobile Auth Section */}
                <div className="p-6 space-y-3 border-t border-gray-200/50 bg-gradient-to-b from-transparent to-primary-50/30">
                  {isAuthenticated && user ? (
                    <>
                      {/* User Info */}
                      <div className="bg-gradient-to-br from-primary-50 to-primary-100 px-4 py-3 rounded-xl border border-primary-200 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold shadow-lg">
                            {user.name
                              ? user.name.substring(0, 2).toUpperCase()
                              : "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Dashboard Link */}
                      <Link
                        to="/dashboard"
                        className="group relative flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl hover:shadow-primary-500/25 hover:scale-[1.02] transition-all duration-500 overflow-hidden"
                        onClick={handleCloseSidebar}
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
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        <span className="relative z-10">Tableau de bord</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/25 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                      </Link>

                      {/* Logout Button */}
                      <button
                        onClick={async () => {
                          try {
                            await logout();
                            handleCloseSidebar();
                          } catch (error) {
                            console.error("Erreur de déconnexion:", error);
                          }
                        }}
                        className="group relative flex items-center justify-center gap-2 w-full px-6 py-3 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-all duration-500 overflow-hidden border border-red-200"
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
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span className="relative z-10">Déconnexion</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      className="group relative flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl hover:shadow-primary-500/25 hover:scale-[1.02] transition-all duration-500 overflow-hidden"
                      onClick={handleCloseSidebar}
                      style={{
                        animation:
                          isMenuOpen && !isClosing
                            ? `slideInFromLeft 0.3s ease-out ${150 + navItems.length * 50}ms both`
                            : "none",
                      }}
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
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                        />
                      </svg>
                      <span className="relative z-10">Connexion</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/25 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                    </Link>
                  )}

                  <div className="pt-2 text-center">
                    <p className="text-xs text-gray-500">Elite Drive</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Location simple et rapide 24/7
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add keyframes for slide animation */}
      <style>{`
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
