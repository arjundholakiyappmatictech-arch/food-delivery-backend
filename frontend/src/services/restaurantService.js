import api from '@/lib/api/api';

export default async function getNearbyRestaurants({
   addressId,
   query = '',
   sortBy = '',
   openNow = false,
   page = 1,
   signal,
}) {
   const params = {
      address_id: addressId,
      include: 'menus',
      page,
   };

   if (query.trim()) {
      params.q = query.trim();
   }

   if (sortBy) {
      params.sort_by = sortBy;
   }

   if (openNow) {
      params.open_now = 1;
   }

   const response = await api.get('/restaurants/nearby', {
      params,
      signal,
   });

   return response.data;
}

export async function getRestaurantMenus({ restaurantId, signal }) {
   const response = await api.get(`/restaurants/${restaurantId}/menus`, {
      signal,
   });

   return response.data.data;
}
