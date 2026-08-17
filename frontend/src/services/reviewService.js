import api from '@/lib/api/api';

export const getReviews = async (page = 1, signal) => {
   const response = await api.get('/reviews', {
      params: { page },
      signal,
   });

   console.log(response);


   return response.data;
};

export const createReview = async (orderId, data, signal) => {
   const response = await api.post(`/orders/${orderId}/reviews`, data, { signal });

   return response.data;
};

export const deleteReview = async (reviewId, signal) => {
   const response = await api.delete(`/reviews/${reviewId}/destroy`, { signal });

   return response.data;
};
