import api from '@/lib/api/api';

export const makePayment = async (orderId, paymentMethod, signal) => {
   const response = await api.post(
      `/orders/${orderId}/payment`,
      {
         payment_method: paymentMethod,
      },
      {
         signal,
      },
   );

   return response.data;
};

export const verifyPayment = async (orderId, paymentData, signal) => {
   const response = await api.post(`/orders/${orderId}/payment/verify`, paymentData, {
      signal,
   });

   return response.data;
};
