import React from "react";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="inline-flex items-center space-x-2">
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
            <Link
              to="/"
              className="text-sm text-gray-600 hover:text-primary-600 transition-colors inline-flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
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
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-4">
            Conditions d'utilisation
          </h1>
          <p className="text-gray-600">
            Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
          </p>
        </div>

        {/* Main content */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12 space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                1
              </span>
              Acceptation des conditions
            </h2>
            <p className="text-gray-700 leading-relaxed ml-11">
              En accédant et en utilisant le service Elite Drive, vous acceptez
              d'être lié par ces conditions d'utilisation. Si vous n'acceptez
              pas ces conditions, veuillez ne pas utiliser nos services.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                2
              </span>
              Conditions de location
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700 leading-relaxed">
                Pour louer un véhicule via Elite Drive, vous devez :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Être âgé d'au moins 21 ans</li>
                <li>
                  Posséder un permis de conduire valide depuis au moins 1 an
                </li>
                <li>
                  Fournir une carte de crédit valide pour le dépôt de garantie
                </li>
                <li>Présenter une pièce d'identité valide</li>
                <li>Respecter les lois de la circulation en vigueur</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                3
              </span>
              Réservation et paiement
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700 leading-relaxed">
                Les réservations sont confirmées après réception du paiement
                complet. Les prix affichés incluent la TVA mais peuvent exclure
                certains frais supplémentaires tels que :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Assurance complémentaire optionnelle</li>
                <li>Conducteur additionnel</li>
                <li>Équipements supplémentaires (GPS, siège enfant, etc.)</li>
                <li>
                  Carburant (le véhicule doit être retourné avec le même niveau)
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                4
              </span>
              Annulation et modification
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700 leading-relaxed">
                Vous pouvez annuler ou modifier votre réservation selon les
                conditions suivantes :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  Annulation gratuite jusqu'à 48 heures avant la prise en charge
                </li>
                <li>
                  Annulation entre 24h et 48h : 50% du montant total sera retenu
                </li>
                <li>
                  Annulation moins de 24h avant : 100% du montant sera retenu
                </li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                5
              </span>
              Utilisation du véhicule
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700 leading-relaxed">
                Le locataire s'engage à :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Utiliser le véhicule conformément aux lois en vigueur</li>
                <li>Ne pas sous-louer ou prêter le véhicule à un tiers</li>
                <li>Maintenir le véhicule en bon état</li>
                <li>
                  Ne pas utiliser le véhicule pour des courses ou compétitions
                </li>
                <li>Ne pas transporter de marchandises interdites</li>
                <li>Signaler immédiatement tout accident ou dommage</li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                6
              </span>
              Assurance et responsabilité
            </h2>
            <p className="text-gray-700 leading-relaxed ml-11">
              Tous nos véhicules sont assurés avec une couverture de base. Le
              locataire reste responsable de la franchise en cas de dommages.
              Une assurance complémentaire est disponible pour réduire ou
              éliminer la franchise. Le locataire est entièrement responsable
              des amendes de stationnement et de circulation.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                7
              </span>
              Retard et prolongation
            </h2>
            <p className="text-gray-700 leading-relaxed ml-11">
              Tout retard dans la restitution du véhicule doit être signalé et
              approuvé à l'avance. Des frais supplémentaires seront appliqués
              pour les retards non autorisés. Un retard de plus de 2 heures non
              signalé sera facturé comme une journée supplémentaire complète.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                8
              </span>
              Modifications des conditions
            </h2>
            <p className="text-gray-700 leading-relaxed ml-11">
              Elite Drive se réserve le droit de modifier ces conditions
              d'utilisation à tout moment. Les modifications seront effectives
              dès leur publication sur le site. Il est de la responsabilité de
              l'utilisateur de consulter régulièrement ces conditions.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                9
              </span>
              Contact
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700 leading-relaxed">
                Pour toute question concernant ces conditions d'utilisation,
                veuillez nous contacter :
              </p>
              <div className="bg-primary-50/50 rounded-2xl p-6 space-y-2">
                <p className="text-gray-700">
                  <span className="font-semibold">Email :</span>{" "}
                  contact@elitedrive.com
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Téléphone :</span> +212
                  5XX-XXXXXX
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Adresse :</span> Casablanca,
                  Maroc
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-12 text-center space-x-6">
          <Link
            to="/privacy-policy"
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            Politique de confidentialité
          </Link>
          <span className="text-gray-300">•</span>
          <Link
            to="/"
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
