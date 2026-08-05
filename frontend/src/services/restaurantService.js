import api from '@/lib/api/api';

export async function getNearbyRestaurants({ addressId, query = '', signal }) {
   const params = {
      address_id: addressId,
   };

   if (query.trim()) {
      params.q = query.trim();
   }

   const response = await api.get('/restaurants/nearby', {
      params,
      signal,
   });

   return response.data.data;
}
