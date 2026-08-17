import axios from 'axios';

const api = axios.create({
   baseURL: process.env.NEXT_PUBLIC_API_URL,
   headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
   },
});

api.interceptors.request.use(
   (config) => {
      const token = localStorage.getItem('access_token');

      if (token) {
         config.headers.Authorization = `Bearer ${token}`;
      }

      if (typeof window !== 'undefined' && !navigator.onLine) {
         const error = new Error('No internet connection. Please check your connection and try again.');

         error.isNetworkOffline = true;

         return Promise.reject(error);
      }

      return config;
   },
   (error) => Promise.reject(error),
);

export default api;
