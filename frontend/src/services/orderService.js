import api from '@/lib/api/api';

export async function createOrder(data, signal) {
   const response = await api.post('/orders/store', data, {
      signal,
   });

   return response.data;
}

export async function getOrder(orderId, signal) {
   const response = await api.get(`/orders/${orderId}`, {
      signal,
   });

   return response.data;
}

export async function generateInvoice(orderId, signal) {
   const response = await api.get(`/orders/${orderId}/invoice`, {
      signal,
   });

   return response.data;
}

export const getOrders = async () => {
   const response = await api.get('/orders');

   return response.data;
};
