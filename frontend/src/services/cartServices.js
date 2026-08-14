import api from '@/lib/api/api';

export async function getCart() {
   const response = await api.get('/cart');

   return response.data;
}

export async function addToCart(data, signal) {
   const response = await api.post('/carts/store', data, { signal });

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
