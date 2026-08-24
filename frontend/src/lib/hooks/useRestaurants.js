/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */
import getNearbyRestaurants from '@/services/restaurantService';
import { parseApiError } from '@/utils/apiError';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function useRestaurants(
   selectedLocation,
   restaurantFilters,
   submittedSearch = '',
   submittedCategory = '',
) {
   const [restaurants, setRestaurants] = useState([]);
   const [page, setPage] = useState(1);
   const [menus, setMenus] = useState([]);

   const [loading, setLoading] = useState(false);
   const [loadingMore, setLoadingMore] = useState(false);
   const [searching, setSearching] = useState(false);

   const [hasMore, setHasMore] = useState(true);
   const [error, setError] = useState('');

   const searchQuery = submittedSearch.trim();
   const categoryQuery = submittedCategory.trim();

   console.log('step 8', searchQuery); // read values from the sunmittedSearch

   /* const searchQuery = restaurantFilters.searchText;
   const categoryQuery = restaurantFilters.menuName; */

   // reads from submitted search and category

   /*
    * Extract unique menus/categories from restaurants.
    */
   const extractMenus = useCallback((items) => {
      return Array.from(
         new Map(
            items.flatMap((restaurant) => restaurant.menus ?? []).map((menu) => [menu.name.toLowerCase(), menu]),
         ).values(),
      );
   }, []);

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
               if (searchQuery) {
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

               // step 9 pass this value to the query params and call apis
               query: searchQuery,

               // Submitted category from URL
               menuName: categoryQuery,

               sortBy: restaurantFilters.sortBy,
               openNow: restaurantFilters.openNow,

               page: currentPage,
               signal,
            });

            const items = response.data ?? [];

            /*
             * When there is no search/category filter,
             * this response already contains the restaurants
             * and their menus, so use it to build Explore Menu.
             */
            if (currentPage === 1 && !searchQuery && !categoryQuery) {
               setMenus(extractMenus(items));
            }

            /*
             * First page replaces the current restaurants.
             */
            if (currentPage === 1) {
               setRestaurants(items);
            } else {
               /*
                * Additional pages are appended.
                */
               setRestaurants((prev) => {
                  const existingIds = new Set(prev.map((restaurant) => restaurant.id));
                  const newItems = items.filter((restaurant) => !existingIds.has(restaurant.id));

                  return [...prev, ...newItems];
               });
            }

            setHasMore(response.pagination?.has_more_pages ?? false);
         } catch (error) {
            /*
             * Ignore intentionally cancelled requests.
             */
            if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
               console.log('REQUEST CANCELLED');
               return;
            }

            if (currentPage === 1) {
               setRestaurants([]);
            }

            const apiError = parseApiError(error);

            setError(apiError.message ?? 'Unable to fetch restaurants.');

            toast.error(apiError.message ?? 'Unable to fetch restaurants.');
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
         restaurantFilters.sortBy,
         restaurantFilters.openNow,
         searchQuery,
         categoryQuery,
         extractMenus,
      ],
   );

   const fetchMenus = useCallback(
      async (signal) => {
         const hasAddressId = Boolean(selectedLocation?.addressId);

         const hasCoordinates = selectedLocation?.latitude != null && selectedLocation?.longitude != null;

         if (!hasAddressId && !hasCoordinates) {
            setMenus([]);
            return;
         }

         try {
            const response = await getNearbyRestaurants({
               addressId: selectedLocation?.addressId,
               latitude: selectedLocation?.latitude,
               longitude: selectedLocation?.longitude,

               // Intentionally unfiltered
               query: '',
               menuName: '',

               sortBy: '',
               openNow: false,

               page: 1,
               signal,
            });

            const items = response.data ?? [];

            setMenus(extractMenus(items));
         } catch (error) {
            /*
             * Ignore cancelled requests.
             */
            if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
               return;
            }

            console.error('FETCH MENUS ERROR:', error);
         }
      },
      [selectedLocation?.addressId, selectedLocation?.latitude, selectedLocation?.longitude, extractMenus],
   );

   useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPage(1);

      const controller = new AbortController();

      fetchRestaurants(controller.signal, 1);

      if (searchQuery || categoryQuery) {
         fetchMenus(controller.signal);
      }

      return () => {
         controller.abort();
      };
   }, [fetchRestaurants, fetchMenus, searchQuery, categoryQuery]);

   /*
    * Fetch additional pages.
    */
   useEffect(() => {
      if (page === 1) {
         return;
      }

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
    * Retry first-page request.
    */
   const retry = useCallback(() => {
      setPage(1);

      fetchRestaurants(undefined, 1);

      if (searchQuery || categoryQuery) {
         fetchMenus(undefined);
      }
   }, [fetchRestaurants, fetchMenus, searchQuery, categoryQuery]);

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
