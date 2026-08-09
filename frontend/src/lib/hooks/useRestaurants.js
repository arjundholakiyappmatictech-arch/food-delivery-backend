/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from './useDebounce';
import getNearbyRestaurants from '@/services/restaurantService';

export default function useRestaurants(selectedLocation, restaurantFilters) {
   const [restaurants, setRestaurants] = useState([]);

   const [page, setPage] = useState(1);
   const [menus, setMenus] = useState([]);

   const [loading, setLoading] = useState(false);
   const [loadingMore, setLoadingMore] = useState(false);

   const [searching, setSearching] = useState(false);

   const [hasMore, setHasMore] = useState(true);

   const [error, setError] = useState('');

   const debouncedSearch = useDebounce(restaurantFilters.searchText, 500);

   const fetchRestaurants = useCallback(
      async (signal, currentPage = 1) => {
         const hasAddressId = Boolean(selectedLocation?.addressId);
         const hasCoordinates = selectedLocation?.latitude != null && selectedLocation?.longitude != null;

         if (!hasAddressId && !hasCoordinates) {
            setRestaurants([]);
            return;
         }

         try {
            setError('');

            if (currentPage === 1) {
               if (debouncedSearch.trim()) {
                  setSearching(true);
               } else {
                  setLoading(true);
               }
            } else {
               setLoadingMore(true);
            }

            const response = await getNearbyRestaurants({
               addressId: selectedLocation.addressId,
               latitude: selectedLocation.latitude,
               longitude: selectedLocation.longitude,
               query: debouncedSearch,
               menuId: restaurantFilters.menuId,
               sortBy: restaurantFilters.sortBy,
               openNow: restaurantFilters.openNow,
               page: currentPage,
               signal,
            });

            const items = response.data ?? [];

            // logic for independent circle
            if (currentPage === 1 && !restaurantFilters.menuId && !restaurantFilters.searchText.trim()) {
               const uniqueMenus = items
                  .flatMap((restaurant) => restaurant.menus ?? [])
                  .filter((menu, index, self) => index === self.findIndex((item) => item.id === menu.id));

               setMenus(uniqueMenus);
            }

            if (currentPage === 1) {
               setRestaurants(items);
            } else {
               setRestaurants((prev) => {
                  const existingIds = new Set(prev.map((restaurant) => restaurant.id));

                  const newItems = items.filter((restaurant) => !existingIds.has(restaurant.id));

                  return [...prev, ...newItems];
               });
            }

            setHasMore(response.pagination?.has_more_pages ?? false);
         } catch (error) {
            if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
               return;
            }

            setError(error.response?.data?.message ?? 'Unable to fetch restaurants.');

            if (currentPage === 1) {
               setRestaurants([]);
            }
         } finally {
            setLoading(false);
            setSearching(false);
            setLoadingMore(false);
         }
      },
      [
         selectedLocation?.addressId,
         selectedLocation?.latitude,
         selectedLocation?.longitude,
         debouncedSearch,
         restaurantFilters.menuId,
         restaurantFilters.sortBy,
         restaurantFilters.openNow,
      ],
   );

   useEffect(() => {
      setPage(1);

      const controller = new AbortController();

      fetchRestaurants(controller.signal, 1);

      return () => controller.abort();
   }, [fetchRestaurants]);

   useEffect(() => {
      if (page === 1) return;

      fetchRestaurants(undefined, page);
   }, [page, fetchRestaurants]);

   const loadMore = useCallback(() => {
      if (loadingMore || !hasMore) {
         return;
      }

      setPage((prevPage) => prevPage + 1);
   }, [loadingMore, hasMore]);

   const retry = useCallback(() => {
      setPage(1);

      fetchRestaurants(undefined, 1);
   }, [fetchRestaurants]);

   return {
      restaurants,
      menus,
      loading,
      loadingMore,
      searching,
      hasMore,
      error,
      retry,
      loadMore,
   };
}
