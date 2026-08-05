/* eslint-disable react-hooks/preserve-manual-memoization */
'use client';

import { useCallback, useEffect, useState } from 'react';

import { getNearbyRestaurants } from '@/services/restaurantService';
import { useDebounce } from './useDebounce';

export default function useRestaurants(selectedLocation, searchText) {
   const [restaurants, setRestaurants] = useState([]);
   const [loading, setLoading] = useState(false);
   const [searching, setSearching] = useState(false);
   const [error, setError] = useState('');

   const debouncedSearch = useDebounce(searchText, 500);

   const fetchRestaurants = useCallback(
      async (signal) => {
         if (!selectedLocation?.addressId) {
            setRestaurants([]);
            return;
         }

         try {
            setError('');

            if (debouncedSearch.trim()) {
               setSearching(true);
            } else {
               setLoading(true);
            }

            const data = await getNearbyRestaurants({
               addressId: selectedLocation.addressId,
               query: debouncedSearch,
               signal,
            });

            setRestaurants(data ?? []);
         } catch (error) {
            if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
               return;
            }

            console.error('Restaurant API error:', error);

            setRestaurants([]);

            setError(error.response?.data?.message || 'Unable to fetch nearby restaurants.');
         } finally {
            setLoading(false);
            setSearching(false);
         }
      },
      [selectedLocation?.addressId, debouncedSearch],
   );

   useEffect(() => {
      if (!selectedLocation?.addressId) {
         // eslint-disable-next-line react-hooks/set-state-in-effect
         setRestaurants([]);
         return;
      }

      const controller = new AbortController();

      fetchRestaurants(controller.signal);

      return () => {
         controller.abort();
      };
   }, [fetchRestaurants]);

   const retry = useCallback(() => {
      fetchRestaurants();
   }, [fetchRestaurants]);

   return {
      restaurants,
      loading,
      searching,
      error,
      retry,
   };
}
