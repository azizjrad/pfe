import React, { useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * DashboardSidebar Component
 * Responsive sidebar with desktop horizontal tabs and mobile slide-out drawer
 * Used across all dashboard roles (super_admin, agency_admin, client)
 */
export default function DashboardSidebar({
  tabs,
  activeTab,
  onTabChange,
  getIcon,
  children,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-br from-white/90 to-white/50 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-2xl overflow-hidden">
      {/* Mobile Hamburger Button */}
      <div className="lg:hidden flex items-center justify-between border-b border-white/40 bg-white/30 px-4 py-3">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-white/40 transition-colors"
        >
          <svg
            className="w-6 h-6 text-gray-700"
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
        </button>
        <span className="text-sm font-semibold text-gray-700">
          {tabs.find((t) => t.id === activeTab)?.label || "Dashboard"}
        </span>
        <div className="w-10"></div>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden lg:block border-b border-white/40 bg-white/30">
        <nav className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 px-6 py-5 text-sm font-semibold transition-all duration-300 relative ${
                activeTab === tab.id
                  ? "text-primary-700 bg-white/60"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/30"
              }`}
            >
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-full" />
              )}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-[100]"
            onClick={() => setIsSidebarOpen(false)}
          ></div>

          <div className="lg:hidden fixed left-0 top-0 bottom-0 w-72 z-[110] animate-slideInLeft">
            <div className="h-full bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-2xl border-r border-white/60 shadow-2xl rounded-r-3xl flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-white/40">
                <h3 className="text-lg font-bold text-gray-900">{t("common.menu")}</h3>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/60 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-700"
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

              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onTabChange(tab.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-white/60"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {getIcon(tab.icon)}
                    </svg>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </>
      )}

      {/* Tab Content */}
      <div className="p-8">{children}</div>

      <style>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
