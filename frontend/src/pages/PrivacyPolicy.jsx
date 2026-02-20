import React from "react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
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
            Politique de confidentialité
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
              Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed ml-11">
              Elite Drive s'engage à protéger votre vie privée. Cette politique
              de confidentialité explique comment nous collectons, utilisons et
              protégeons vos informations personnelles lorsque vous utilisez
              notre service de location de véhicules.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                2
              </span>
              Informations collectées
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700 leading-relaxed">
                Nous collectons les informations suivantes :
              </p>
              <div className="space-y-4">
                <div className="bg-primary-50/30 rounded-2xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Informations d'identification
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Nom et prénom</li>
                    <li>Adresse e-mail</li>
                    <li>Numéro de téléphone</li>
                    <li>Adresse postale</li>
                    <li>Date de naissance</li>
                  </ul>
                </div>
                <div className="bg-primary-50/30 rounded-2xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Informations de conduite
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Numéro de permis de conduire</li>
                    <li>Date d'obtention du permis</li>
                    <li>Catégorie du permis</li>
                  </ul>
                </div>
                <div className="bg-primary-50/30 rounded-2xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Informations de paiement
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Informations de carte bancaire (cryptées)</li>
                    <li>Historique des transactions</li>
                  </ul>
                </div>
                <div className="bg-primary-50/30 rounded-2xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Données de navigation
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Adresse IP</li>
                    <li>Type de navigateur</li>
                    <li>Pages visitées</li>
                    <li>Temps passé sur le site</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                3
              </span>
              Utilisation des informations
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700 leading-relaxed">
                Nous utilisons vos informations personnelles pour :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Traiter vos réservations et paiements</li>
                <li>Vérifier votre identité et votre permis de conduire</li>
                <li>Communiquer avec vous concernant votre location</li>
                <li>Améliorer nos services et votre expérience utilisateur</li>
                <li>
                  Vous envoyer des offres promotionnelles (avec votre
                  consentement)
                </li>
                <li>Respecter nos obligations légales et réglementaires</li>
                <li>Prévenir la fraude et assurer la sécurité</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                4
              </span>
              Partage des informations
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700 leading-relaxed">
                Nous ne vendons jamais vos informations personnelles. Nous
                pouvons partager vos données uniquement avec :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  Nos partenaires de paiement sécurisé pour traiter les
                  transactions
                </li>
                <li>Nos assureurs en cas d'accident ou de réclamation</li>
                <li>Les autorités compétentes si requis par la loi</li>
                <li>
                  Nos prestataires de services (hébergement, support client)
                  sous contrat de confidentialité
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
              Cookies
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700 leading-relaxed">
                Nous utilisons des cookies pour améliorer votre expérience sur
                notre site :
              </p>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-semibold text-gray-900">
                    Cookies essentiels
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    Nécessaires au fonctionnement du site (connexion, panier)
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-semibold text-gray-900">
                    Cookies de performance
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    Analysent l'utilisation du site pour améliorer nos services
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-semibold text-gray-900">
                    Cookies marketing
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    Personnalisent les publicités (nécessitent votre
                    consentement)
                  </p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed mt-3">
                Vous pouvez gérer vos préférences de cookies à tout moment dans
                les paramètres de votre navigateur.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                6
              </span>
              Sécurité des données
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700 leading-relaxed">
                Nous prenons la sécurité de vos données très au sérieux et
                mettons en œuvre :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  Cryptage SSL/TLS pour toutes les transmissions de données
                </li>
                <li>
                  Stockage sécurisé des informations de paiement (conformité
                  PCI-DSS)
                </li>
                <li>Authentification à deux facteurs pour les comptes</li>
                <li>Audits de sécurité réguliers</li>
                <li>Accès restreint aux données personnelles</li>
                <li>Sauvegardes régulières et chiffrées</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                7
              </span>
              Vos droits
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700 leading-relaxed">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-primary-50 to-primary-100/30 rounded-xl p-4">
                  <p className="font-semibold text-gray-900 mb-1">
                    Droit d'accès
                  </p>
                  <p className="text-gray-600 text-sm">
                    Consulter vos données personnelles
                  </p>
                </div>
                <div className="bg-gradient-to-br from-primary-50 to-primary-100/30 rounded-xl p-4">
                  <p className="font-semibold text-gray-900 mb-1">
                    Droit de rectification
                  </p>
                  <p className="text-gray-600 text-sm">
                    Corriger vos informations
                  </p>
                </div>
                <div className="bg-gradient-to-br from-primary-50 to-primary-100/30 rounded-xl p-4">
                  <p className="font-semibold text-gray-900 mb-1">
                    Droit à l'oubli
                  </p>
                  <p className="text-gray-600 text-sm">Supprimer vos données</p>
                </div>
                <div className="bg-gradient-to-br from-primary-50 to-primary-100/30 rounded-xl p-4">
                  <p className="font-semibold text-gray-900 mb-1">
                    Droit de portabilité
                  </p>
                  <p className="text-gray-600 text-sm">Récupérer vos données</p>
                </div>
                <div className="bg-gradient-to-br from-primary-50 to-primary-100/30 rounded-xl p-4">
                  <p className="font-semibold text-gray-900 mb-1">
                    Droit d'opposition
                  </p>
                  <p className="text-gray-600 text-sm">
                    Refuser le traitement de vos données
                  </p>
                </div>
                <div className="bg-gradient-to-br from-primary-50 to-primary-100/30 rounded-xl p-4">
                  <p className="font-semibold text-gray-900 mb-1">
                    Droit de limitation
                  </p>
                  <p className="text-gray-600 text-sm">
                    Limiter l'utilisation de vos données
                  </p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed mt-4">
                Pour exercer ces droits, contactez-nous à{" "}
                <a
                  href="mailto:privacy@elitedrive.com"
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  privacy@elitedrive.com
                </a>
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                8
              </span>
              Conservation des données
            </h2>
            <p className="text-gray-700 leading-relaxed ml-11">
              Nous conservons vos données personnelles aussi longtemps que
              nécessaire pour fournir nos services et respecter nos obligations
              légales. En général, nous conservons vos données pendant 3 ans
              après votre dernière location, sauf obligation légale de
              conservation plus longue.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                9
              </span>
              Modifications de cette politique
            </h2>
            <p className="text-gray-700 leading-relaxed ml-11">
              Nous pouvons mettre à jour cette politique de confidentialité
              périodiquement. Toute modification sera publiée sur cette page
              avec une date de mise à jour actualisée. Nous vous encourageons à
              consulter régulièrement cette page pour rester informé.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                10
              </span>
              Contact
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700 leading-relaxed">
                Pour toute question concernant cette politique de
                confidentialité ou pour exercer vos droits, contactez notre
                délégué à la protection des données :
              </p>
              <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-2xl p-6 space-y-3">
                <p className="text-gray-700">
                  <span className="font-semibold">Email :</span>{" "}
                  <a
                    href="mailto:privacy@elitedrive.com"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    privacy@elitedrive.com
                  </a>
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Téléphone :</span> +212
                  5XX-XXXXXX
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Adresse :</span> Elite Drive -
                  Service Protection des Données
                  <br />
                  Casablanca, Maroc
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-12 text-center space-x-6">
          <Link
            to="/terms-of-service"
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            Conditions d'utilisation
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

export default PrivacyPolicy;
