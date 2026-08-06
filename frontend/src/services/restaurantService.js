import api from '@/lib/api/api';

export default async function getNearbyRestaurants({ addressId, query = '', page = 1, signal }) {
   const params = {
      address_id: addressId,
      include: 'menus.menuItems',
      page,
   };

   if (query.trim()) {
      params.q = query.trim();
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
