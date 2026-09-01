'use client';

import { useQuery } from '@tanstack/react-query';
import { getRestaurantMenus } from '@/services/restaurantService';
import { parseApiError } from '@/utils/apiError';

export default function useRestaurant(restaurantId) {
   const restaurantQuery = useQuery({
      queryKey: ['restaurant-menus', restaurantId],

      queryFn: ({ signal }) =>
         getRestaurantMenus({
            restaurantId,
            signal,
         }),

      enabled: Boolean(restaurantId),
   });

   const apiError = restaurantQuery.error ? parseApiError(restaurantQuery.error) : null;

   return {
      menus: restaurantQuery.data ?? [],
      loading: restaurantQuery.isLoading,
      error: apiError?.message ?? '',
   };
}
