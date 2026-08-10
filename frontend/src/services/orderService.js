import api from '@/lib/api/api';

export async function createOrder(data, signal) {
   const response = await api.post('/orders/store', data, {
      signal,
   });

   return response.data;
}
