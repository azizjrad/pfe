export const getUserFacingErrorMessage = (error, fallbackMessage) => {
  if (import.meta.env.PROD) {
    return fallbackMessage;
  }

  return error?.response?.data?.message || fallbackMessage;
};
