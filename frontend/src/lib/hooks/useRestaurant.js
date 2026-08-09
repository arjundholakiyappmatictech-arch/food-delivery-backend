/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useCallback, useEffect, useState } from 'react';

import { getRestaurantMenus } from '@/services/restaurantService';

export default function useRestaurant(restaurantId) {
   const [menus, setMenus] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');

   const fetchMenus = useCallback(
      async (signal) => {
         const token = localStorage.getItem('access_token');

         // Don't make authenticated request without token
         if (!restaurantId || !token) {
            setLoading(false);
            return;
         }

         try {
            setLoading(true);
            setError('');

            const data = await getRestaurantMenus({
               restaurantId,
               signal,
            });

            setMenus(data ?? []);
         } catch (error) {
            if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
               return;
            }

            console.error(error);

            setMenus([]);

            setError(error.response?.data?.message ?? 'Unable to fetch restaurant menus.');
         } finally {
            setLoading(false);
         }
      },
      [restaurantId],
   );

   useEffect(() => {
      const controller = new AbortController();

      fetchMenus(controller.signal);

      return () => controller.abort();
   }, [fetchMenus]);

   return {
      menus,
      loading,
      error,
   };
}
