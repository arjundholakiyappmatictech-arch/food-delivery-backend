'use client';

import { useCallback, useEffect, useState } from 'react';

import getNearbyRestaurants from '@/services/restaurantService';
import { useDebounce } from './useDebounce';

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
               addressId: selectedLocation?.addressId,
               latitude: selectedLocation?.latitude,
               longitude: selectedLocation?.longitude,
               query: debouncedSearch,
               menuName: restaurantFilters.menuName,
               sortBy: restaurantFilters.sortBy,
               openNow: restaurantFilters.openNow,
               page: currentPage,
               signal,
            });

            const items = response.data ?? [];

            /*
             * Build Explore categories only from an
             * unfiltered first-page request.
             */
            if (currentPage === 1 && !restaurantFilters.menuName && !debouncedSearch.trim()) {
               const uniqueMenus = Array.from(
                  new Map(
                     items
                        .flatMap((restaurant) => restaurant.menus ?? [])
                        .map((menu) => [menu.name.toLowerCase(), menu]),
                  ).values(),
               );

               setMenus(uniqueMenus);
            }

            /*
             * Replace restaurants on first page.
             */
            if (currentPage === 1) {
               setRestaurants(items);
            } else {
               /*
                * Append only restaurants that aren't
                * already loaded.
                */
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
         restaurantFilters.menuName,
         restaurantFilters.sortBy,
         restaurantFilters.openNow,
      ],
   );

   /*
    * Fetch first page whenever location or filters change.
    */
   useEffect(() => {
      setPage(1);

      const controller = new AbortController();

      fetchRestaurants(controller.signal, 1);

      return () => controller.abort();
   }, [fetchRestaurants]);

   /*
    * Fetch subsequent pages.
    */
   useEffect(() => {
      if (page === 1) {
         return;
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchRestaurants(undefined, page);
   }, [page, fetchRestaurants]);

   /*
    * Load next page.
    */
   const loadMore = useCallback(() => {
      if (loadingMore || !hasMore) {
         return;
      }

      setPage((prevPage) => prevPage + 1);
   }, [loadingMore, hasMore]);

   /*
    * Retry first page.
    */
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
