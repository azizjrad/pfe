export const unwrapApiData = (response) => {
  const payload = response?.data ?? {};
  return payload.data ?? payload;
};

export const normalizeApiResponse = (response) => {
  const payload = response?.data ?? {};
  const data = payload.data ?? payload;

  return {
    ...payload,
    success: payload.success ?? true,
    message: payload.message ?? null,
    data,
  };
};
