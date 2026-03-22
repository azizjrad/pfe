import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const PrivacyPolicy = () => {
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
            {t("privacy.title")}
          </h1>
        </div>

        {/* Main content */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12 space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                1
              </span>
              {t("privacy.sections.1.title")}
            </h2>
            <p className="text-gray-700 leading-relaxed ml-11">
              {t("privacy.sections.1.content")}
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                2
              </span>
              {t("privacy.sections.2.title")}
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700 leading-relaxed">
                {t("privacy.sections.2.intro")}
              </p>
              <div className="space-y-4">
                <div className="bg-primary-50/30 rounded-2xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {t("privacy.sections.2.id.title")}
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {t("privacy.sections.2.id.items", { returnObjects: true }).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-primary-50/30 rounded-2xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {t("privacy.sections.2.driving.title")}
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {t("privacy.sections.2.driving.items", { returnObjects: true }).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-primary-50/30 rounded-2xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {t("privacy.sections.2.payment.title")}
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {t("privacy.sections.2.payment.items", { returnObjects: true }).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-primary-50/30 rounded-2xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {t("privacy.sections.2.nav.title")}
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {t("privacy.sections.2.nav.items", { returnObjects: true }).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
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
              {t("privacy.sections.3.title")}
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700 leading-relaxed">
                {t("privacy.sections.3.intro")}
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {t("privacy.sections.3.items", { returnObjects: true }).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                4
              </span>
              {t("privacy.sections.4.title")}
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700 leading-relaxed">
                {t("privacy.sections.4.intro")}
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {t("privacy.sections.4.items", { returnObjects: true }).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                5
              </span>
              {t("privacy.sections.5.title")}
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700 leading-relaxed">
                {t("privacy.sections.5.intro")}
              </p>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-semibold text-gray-900">
                    {t("privacy.sections.5.essential.title")}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    {t("privacy.sections.5.essential.desc")}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-semibold text-gray-900">
                    {t("privacy.sections.5.performance.title")}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    {t("privacy.sections.5.performance.desc")}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-semibold text-gray-900">
                    {t("privacy.sections.5.marketing.title")}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    {t("privacy.sections.5.marketing.desc")}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed mt-3">
                {t("privacy.sections.5.outro")}
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                6
              </span>
              {t("privacy.sections.6.title")}
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700 leading-relaxed">
                {t("privacy.sections.6.intro")}
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {t("privacy.sections.6.items", { returnObjects: true }).map((item, idx) => (
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
              {t("privacy.sections.7.title")}
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700 leading-relaxed">
                {t("privacy.sections.7.intro")}
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-primary-50 to-primary-100/30 rounded-xl p-4">
                  <p className="font-semibold text-gray-900 mb-1">
                    {t("privacy.sections.7.access.title")}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {t("privacy.sections.7.access.desc")}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-primary-50 to-primary-100/30 rounded-xl p-4">
                  <p className="font-semibold text-gray-900 mb-1">
                    {t("privacy.sections.7.rectification.title")}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {t("privacy.sections.7.rectification.desc")}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-primary-50 to-primary-100/30 rounded-xl p-4">
                  <p className="font-semibold text-gray-900 mb-1">
                    {t("privacy.sections.7.erasure.title")}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {t("privacy.sections.7.erasure.desc")}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-primary-50 to-primary-100/30 rounded-xl p-4">
                  <p className="font-semibold text-gray-900 mb-1">
                    {t("privacy.sections.7.portability.title")}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {t("privacy.sections.7.portability.desc")}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-primary-50 to-primary-100/30 rounded-xl p-4">
                  <p className="font-semibold text-gray-900 mb-1">
                    {t("privacy.sections.7.objection.title")}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {t("privacy.sections.7.objection.desc")}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-primary-50 to-primary-100/30 rounded-xl p-4">
                  <p className="font-semibold text-gray-900 mb-1">
                    {t("privacy.sections.7.restriction.title")}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {t("privacy.sections.7.restriction.desc")}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed mt-4">
                {t("privacy.sections.7.outro")}
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
              {t("privacy.sections.8.title")}
            </h2>
            <p className="text-gray-700 leading-relaxed ml-11">
              {t("privacy.sections.8.content")}
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                9
              </span>
              {t("privacy.sections.9.title")}
            </h2>
            <p className="text-gray-700 leading-relaxed ml-11">
              {t("privacy.sections.9.content")}
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                10
              </span>
              {t("privacy.sections.10.title")}
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700 leading-relaxed">
                {t("privacy.sections.10.intro")}
              </p>
              <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-2xl p-6 space-y-3">
                <p className="text-gray-700">
                  <span className="font-semibold">{t("privacy.sections.10.email")}</span>{" "}
                  <a
                    href="mailto:privacy@elitedrive.com"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    privacy@elitedrive.com
                  </a>
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">{t("privacy.sections.10.phone")}</span> +216 XX XXX XXX
                </p>
                <p className="text-gray-700" style={{ whiteSpace: "pre-line" }}>
                  <span className="font-semibold">{t("privacy.sections.10.address")}</span> {t("privacy.sections.10.addressValue")}
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
            {t("footer.termsOfService")}
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

export default PrivacyPolicy;
