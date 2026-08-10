import api from '@/lib/api/api';

export async function getCart(signal) {
   const response = await api.get('/cart', {
      signal,
   });

   return response.data;
}

export async function addToCart(data) {
   const response = await api.post('/carts/store', data);

   return response.data;
}

export async function updateCart(cartId, data) {
   const response = await api.put(`/carts/${cartId}/update`, data);

   return response.data;
}

export async function removeFromCart(cartId) {
   await api.delete(`/carts/${cartId}/destroy`);
}

export const clearCart = async (signal) => {
   const response = await api.delete('/cart', {
      signal,
   });

   return response.data;
};
