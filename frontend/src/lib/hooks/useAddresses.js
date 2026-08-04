'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { getAddresses } from '@/services/addressService';

export default function useAddresses() {
   const [addresses, setAddresses] = useState([]);
   const [search, setSearch] = useState('');
   const [page, setPage] = useState(1);

   const [hasSavedAddresses, setHasSavedAddresses] = useState(false);

   const [hasMore, setHasMore] = useState(false);

   const [loading, setLoading] = useState(true);
   const [searching, setSearching] = useState(false);
   const [loadingMore, setLoadingMore] = useState(false);

   const [error, setError] = useState('');

   const loadingMoreRef = useRef(false);

   const fetchAddresses = useCallback(async () => {
      try {
         setLoading(true);
         setError('');

         const result = await getAddresses('', 1);

         setAddresses(result.addresses);
         setHasSavedAddresses(result.addresses.length > 0);

         setSearch('');
         setPage(result.pagination?.current_page ?? 1);

         setHasMore(result.pagination?.has_more_pages ?? false);
      } catch (error) {
         const message = error.response?.data?.message || 'Unable to fetch your saved addresses.';

         setError(message);
      } finally {
         setLoading(false);
      }
   }, []);

   const searchAddresses = useCallback(async (searchValue) => {
      const normalizedSearch = searchValue.trim();

      try {
         setSearching(true);
         setError('');

         const result = await getAddresses(normalizedSearch, 1);

         setAddresses(result.addresses);

         setSearch(normalizedSearch);
         setPage(result.pagination?.current_page ?? 1);

         setHasMore(result.pagination?.has_more_pages ?? false);
      } catch (error) {
         const message = error.response?.data?.message || 'Unable to search your saved addresses.';

         setError(message);
      } finally {
         setSearching(false);
      }
   }, []);

   const loadMoreAddresses = useCallback(async () => {
      if (loadingMoreRef.current || !hasMore || searching) {
         return;
      }

      loadingMoreRef.current = true;
      setLoadingMore(true);
      setError('');

      try {
         const nextPage = page + 1;

         const result = await getAddresses(search, nextPage);

         setAddresses((currentAddresses) => {
            const uniqueNewAddresses = result.addresses.filter(
               (newAddress) => !currentAddresses.some((currentAddress) => currentAddress.id === newAddress.id),
            );

            return [...currentAddresses, ...uniqueNewAddresses];
         });

         setPage(result.pagination?.current_page ?? nextPage);

         setHasMore(result.pagination?.has_more_pages ?? false);
      } catch (error) {
         const message = error.response?.data?.message || 'Unable to load more addresses.';

         setError(message);
      } finally {
         loadingMoreRef.current = false;
         setLoadingMore(false);
      }
   }, [page, search, hasMore, searching]);

   useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchAddresses();
   }, [fetchAddresses]);

   return {
      addresses,
      hasSavedAddresses,
      hasMore,

      loading,
      searching,
      loadingMore,
      error,

      fetchAddresses,
      searchAddresses,
      loadMoreAddresses,
   };
}
