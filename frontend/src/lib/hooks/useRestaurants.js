/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from './useDebounce';
import getNearbyRestaurants from '@/services/restaurantService';

export default function useRestaurants(selectedLocation, searchText) {
   const [restaurants, setRestaurants] = useState([]);

   const [page, setPage] = useState(1);

   const [loading, setLoading] = useState(false);
   const [loadingMore, setLoadingMore] = useState(false);

   const [searching, setSearching] = useState(false);

   const [hasMore, setHasMore] = useState(true);

   const [error, setError] = useState('');

   const debouncedSearch = useDebounce(searchText, 500);

   const fetchRestaurants = useCallback(
      async (signal, currentPage = 1) => {
         if (!selectedLocation?.addressId) {
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
               query: debouncedSearch,
               page: currentPage,
               signal,
            });

            const items = response.data ?? [];

            if (currentPage === 1) {
               setRestaurants(items);
            } else {
               setRestaurants((prev) => [...prev, ...items]);
            }

            setHasMore(response.current_page < response.last_page);
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
      [selectedLocation?.addressId, debouncedSearch],
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
   }, [page]);

   const loadMore = useCallback(() => {
      console.log('load more');

      if (loadingMore || !hasMore) {
         return;
      }

      setPage((prev) => prev + 1);
   }, [loadingMore, hasMore]);

   const retry = useCallback(() => {
      setPage(1);

      fetchRestaurants(undefined, 1);
   }, [fetchRestaurants]);

   return {
      restaurants,
      loading,
      loadingMore,
      searching,
      hasMore,
      error,
      retry,
      loadMore,
   };
}
