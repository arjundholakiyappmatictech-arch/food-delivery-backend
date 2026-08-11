import api from '@/lib/api/api';

export const makePayment = async (orderId, paymentMethod) => {
   const response = await api.post(`/orders/${orderId}/payment`, {
      payment_method: paymentMethod,
   });

   return response.data;
};
