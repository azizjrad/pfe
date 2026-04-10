import React from "react";
import { useTranslation } from "react-i18next";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}) => {
  const { t } = useTranslation();

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Calculate range of items being shown
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 border-t border-white/50 pt-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-white/70 bg-white/55 px-4 py-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
        {/* Items info */}
        <div className="text-sm text-slate-700">
          {t("pagination.showing")}{" "}
          <span className="font-semibold text-slate-900">{startItem}</span>{" "}
          {t("pagination.to")}{" "}
          <span className="font-semibold text-slate-900">{endItem}</span>{" "}
          {t("pagination.of")}{" "}
          <span className="font-semibold text-slate-900">{totalItems}</span>{" "}
          {totalItems > 1 ? t("pagination.results") : t("pagination.result")}
        </div>

        {/* Pagination controls */}
        <div className="inline-flex items-center gap-1">
          {/* Previous button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`h-11 rounded-xl px-4 font-medium transition-all duration-200 flex items-center gap-2 ${
              currentPage === 1
                ? "cursor-not-allowed bg-transparent text-slate-400"
                : "bg-white text-slate-700 shadow-sm hover:bg-slate-50"
            }`}
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="hidden sm:inline">{t("pagination.previous")}</span>
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((pageNum, index) => {
              if (pageNum === "...") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-slate-500"
                  >
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`h-11 min-w-[42px] rounded-xl px-3 font-semibold transition-all duration-200 ${
                    currentPage === pageNum
                      ? "bg-primary-600 text-white shadow"
                      : "bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`h-11 rounded-xl px-4 font-medium transition-all duration-200 flex items-center gap-2 ${
              currentPage === totalPages
                ? "cursor-not-allowed bg-transparent text-slate-400"
                : "bg-white text-slate-700 shadow-sm hover:bg-slate-50"
            }`}
          >
            <span className="hidden sm:inline">{t("pagination.next")}</span>
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
