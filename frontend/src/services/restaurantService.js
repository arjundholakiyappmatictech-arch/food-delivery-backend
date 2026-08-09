import api from '@/lib/api/api';

export default async function getNearbyRestaurants({
   addressId,
   query = '',
   latitude = null,
   longitude = null,
   menuId = null,
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

   if (menuId) {
      params.menu_id = Number(menuId);
   }

   if (sortBy) {
      params.sort_by = sortBy;
   }

   if (openNow) {
      params.open_now = 1;
   }

   /* await new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, 2000);

      signal?.addEventListener('abort', () => {
         clearTimeout(timeout);
         reject(new DOMException('Aborted', 'AbortError'));
      });
   }); */

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
