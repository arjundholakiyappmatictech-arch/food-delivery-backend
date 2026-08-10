import api from '@/lib/api/api';

export default async function getNearbyRestaurants({
   addressId,
   query = '',
   latitude = null,
   longitude = null,
   menuName = null,
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

   if (latitude != null && longitude != null) {
      params.latitude = latitude;
      params.longitude = longitude;
   }

   if (query.trim()) {
      params.q = query.trim();
   }

   if (menuName) {
      params.menu_name = menuName;
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
