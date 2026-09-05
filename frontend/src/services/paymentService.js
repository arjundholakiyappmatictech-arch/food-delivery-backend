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
