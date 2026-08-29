// Normalize Axios errors, offline rejections, and aborted requests into uniform UI error states
export const parseApiError = (error) => {
   const isCancelled = error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED';

   const isOffline = error?.isNetworkOffline === true;

   const isNetworkError = !error?.response && !isCancelled && !isOffline;

   return {
      status: error?.response?.status ?? null,

      message:
         error?.response?.data?.message ??
         (isOffline
            ? 'No internet connection. Please check your connection and try again.'
            : isNetworkError
              ? 'Unable to connect to the server. Please try again.'
              : 'Something went wrong. Please try again.'),

      errors: error?.response?.data?.errors ?? {},

      isNetworkError,
      isOffline,
      isCancelled,
   };
};
