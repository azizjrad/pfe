import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const TermsOfService = () => {
  const { t } = useTranslation();

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
                {t("app.name")}
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
              {t("common.backHome")}
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-4">
            {t("terms.title")}
          </h1>
          <p className="text-gray-600">
            {t("terms.lastUpdated")} : {new Date().toLocaleDateString("fr-FR")}
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
              {t("terms.sections.1.title")}
            </h2>
            <p className="text-gray-700 leading-relaxed ml-11">
              {t("terms.sections.1.content")}
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                2
              </span>
              {t("terms.sections.2.title")}
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700 leading-relaxed">
                {t("terms.sections.2.intro")}
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {t("terms.sections.2.items", { returnObjects: true }).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                3
              </span>
              {t("terms.sections.3.title")}
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700 leading-relaxed">
                {t("terms.sections.3.intro")}
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-semibold text-gray-900">
                    {t("terms.sections.3.insurance.title")}
                  </p>
                  {t("terms.sections.3.insurance.items", { returnObjects: true }).map((item, idx) => (
                    <p key={idx} className="text-sm text-gray-600">{item}</p>
                  ))}
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-semibold text-gray-900">
                    {t("terms.sections.3.equipment.title")}
                  </p>
                  {t("terms.sections.3.equipment.items", { returnObjects: true }).map((item, idx) => (
                    <p key={idx} className="text-sm text-gray-600">{item}</p>
                  ))}
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-semibold text-gray-900">
                    {t("terms.sections.3.services.title")}
                  </p>
                  {t("terms.sections.3.services.items", { returnObjects: true }).map((item, idx) => (
                    <p key={idx} className="text-sm text-gray-600">{item}</p>
                  ))}
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-semibold text-gray-900">
                    {t("terms.sections.3.mileage.title")}
                  </p>
                  {t("terms.sections.3.mileage.items", { returnObjects: true }).map((item, idx) => (
                    <p key={idx} className="text-sm text-gray-600">{item}</p>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 - Platform Commission */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                4
              </span>
              {t("terms.sections.4.title")}
            </h2>
            <div className="ml-11 space-y-4">
              <div className="bg-gradient-to-r from-primary-50 to-blue-50 border-l-4 border-primary-500 p-4 rounded-r-lg">
                <p className="text-sm font-semibold text-primary-900 mb-2">
                  {t("terms.sections.4.agencyPrefix")}
                </p>
                <p 
                  className="text-sm text-primary-800 leading-relaxed" 
                  dangerouslySetInnerHTML={{ __html: t("terms.sections.4.agencyDesc").replace(/<str>/g, '<strong>').replace(/<\/str>/g, '</strong>') }}
                />
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {t("terms.sections.4.howItWorks.title")}
                  </h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    {t("terms.sections.4.howItWorks.items", { returnObjects: true }).map((item, idx) => (
                      <p key={idx} dangerouslySetInnerHTML={{ __html: item.replace(/<str>/g, '<strong>').replace(/<\/str>/g, '</strong>') }} />
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {t("terms.sections.4.example.title")}
                  </h4>
                  <div className="text-sm text-gray-700 space-y-1 bg-white rounded p-3">
                    <div className="flex justify-between font-mono">
                      <span>{t("terms.sections.4.example.totalPaid")}</span>
                      <span className="font-semibold">{t("terms.sections.4.example.totalPaidVal")}</span>
                    </div>
                    <div className="flex justify-between font-mono text-red-600">
                      <span>{t("terms.sections.4.example.commission")}</span>
                      <span className="font-semibold">{t("terms.sections.4.example.commissionVal")}</span>
                    </div>
                    <div className="border-t border-gray-300 my-2"></div>
                    <div className="flex justify-between font-mono text-green-600">
                      <span>{t("terms.sections.4.example.agencyAmount")}</span>
                      <span className="font-bold text-lg">{t("terms.sections.4.example.agencyAmountVal")}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    {t("terms.sections.4.included.title")}
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1 ml-4">
                    {t("terms.sections.4.included.items", { returnObjects: true }).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="text-sm text-gray-600 italic mt-4">
                {t("terms.sections.4.note")}
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                5
              </span>
              {t("terms.sections.5.title")}
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700 leading-relaxed">
                {t("terms.sections.5.content")}
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                6
              </span>
              {t("terms.sections.6.title")}
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700 leading-relaxed">
                {t("terms.sections.6.intro")}
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {t("terms.sections.6.items", { returnObjects: true }).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                7
              </span>
              {t("terms.sections.7.title")}
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700 leading-relaxed">
                {t("terms.sections.7.intro")}
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {t("terms.sections.7.items", { returnObjects: true }).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                8
              </span>
              {t("terms.sections.8.title")}
            </h2>
            <p className="text-gray-700 leading-relaxed ml-11">
              {t("terms.sections.8.content")}
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                9
              </span>
              {t("terms.sections.9.title")}
            </h2>
            <p className="text-gray-700 leading-relaxed ml-11">
              {t("terms.sections.9.content")}
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                10
              </span>
              {t("terms.sections.10.title")}
            </h2>
            <p className="text-gray-700 leading-relaxed ml-11">
              {t("terms.sections.10.content")}
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                11
              </span>
              {t("terms.sections.11.title")}
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700 leading-relaxed">
                {t("terms.sections.11.intro")}
              </p>
              <div className="bg-primary-50/50 rounded-2xl p-6 space-y-2">
                <p className="text-gray-700">
                  <span className="font-semibold">{t("terms.sections.11.email")}</span>{" "}
                  {t("terms.sections.11.emailValue")}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">{t("terms.sections.11.phone")}</span> {t("terms.sections.11.phoneValue")}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">{t("terms.sections.11.address")}</span> {t("terms.sections.11.addressValue")}
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
            {t("privacy.title")}
          </Link>
          <span className="text-gray-300">•</span>
          <Link
            to="/"
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            {t("common.backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
