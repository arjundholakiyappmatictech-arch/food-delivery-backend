export const parseApiError = (error) => {
   return {
      status: error.response?.status ?? null,
      message: error.response?.data?.message ?? 'Something went wrong. Please try again.',
      errors: error.response?.data?.errors ?? {},
      isNetworkError: !error.response,
   };
};
