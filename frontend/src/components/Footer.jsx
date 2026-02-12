import React from "react";

const Footer = () => {
  return (
    <footer id="contact" className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
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
              <span className="text-xl font-bold">Elite Drive</span>
            </div>
            <p className="text-gray-400">
              Votre partenaire pour une expérience de location premium.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Liens rapides</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a
                  href="#vehicles"
                  className="hover:text-white transition-colors"
                >
                  Véhicules
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="hover:text-white transition-colors"
                >
                  Services
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  À propos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>📍 Tunis, Tunisie</li>
              <li>📞 +216 XX XXX XXX</li>
              <li>✉️ contact@elitedrive.tn</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Horaires</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Lun - Ven: 8h - 18h</li>
              <li>Samedi: 9h - 16h</li>
              <li>Dimanche: Fermé</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2026 Elite Drive. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
