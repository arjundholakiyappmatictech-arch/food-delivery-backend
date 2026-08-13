import api from '@/lib/api/api';

export const createReview = async (orderId, data, signal) => {
   const response = await api.post(`/orders/${orderId}/reviews`, data, { signal });

   return response.data;
};
