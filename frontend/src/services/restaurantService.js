import api from '@/lib/api/api';

export async function getNearbyRestaurants(location) {
   const params =
      location.type === 'saved_address'
         ? {
              address_id: location.addressId,
           }
         : {
              latitude: location.latitude,
              longitude: location.longitude,
           };

   const response = await api.get('/restaurants/nearby', {
      params,
   });

   return response.data;
}
