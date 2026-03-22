export const formatDate = (
  value,
  locale = "fr-FR",
  options = { day: "2-digit", month: "2-digit", year: "numeric" },
) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(locale, options);
};

export const formatDateTime = (
  value,
  locale = "fr-FR",
  options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString(locale, options);
};

export const formatPrice = (amount, currencyLabel = "DT", locale = "fr-FR") => {
  const numericValue = Number(amount ?? 0);
  return `${numericValue.toLocaleString(locale)} ${currencyLabel}`;
};

export const formatNumber = (value, locale = "fr-FR") => {
  const numericValue = Number(value ?? 0);
  return numericValue.toLocaleString(locale);
};
