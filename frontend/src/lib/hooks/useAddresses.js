import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { deleteAddress, getAddresses } from '@/services/addressService';
import { parseApiError } from '@/utils/apiError';

export default function useAddresses() {
   const queryClient = useQueryClient();

   const [search, setSearch] = useState('');
   const [deletingAddress, setDeletingAddress] = useState(null);

   const addressesQuery = useInfiniteQuery({
      queryKey: ['addresses', { search }],

      queryFn: ({ pageParam = 1 }) => {
         return getAddresses(search, pageParam);
      },

      initialPageParam: 1,

      getNextPageParam: (lastPage) => {
         if (!lastPage?.pagination?.has_more_pages) {
            return undefined;
         }

         return (lastPage.pagination.current_page ?? 1) + 1;
      },
   });

   const deleteMutation = useMutation({
      mutationFn: (addressId) => deleteAddress(addressId),

      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: ['addresses'],
         });

         toast.success('Address deleted successfully.');
         setDeletingAddress(null);
      },

      onError: (error) => {
         const apiError = parseApiError(error);

         toast.error(apiError.message ?? 'Unable to delete address. Please try again.');
      },
   });

   const addresses = addressesQuery.data?.pages.flatMap((page) => page?.addresses ?? []) ?? [];

   const hasSavedAddresses = addresses.length > 0;

   const searchAddresses = useCallback((searchValue) => {
      setSearch(searchValue.trim());
   }, []);

   const loadMoreAddresses = useCallback(() => {
      if (!addressesQuery.hasNextPage || addressesQuery.isFetchingNextPage) {
         return;
      }

      addressesQuery.fetchNextPage();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [addressesQuery.hasNextPage, addressesQuery.isFetchingNextPage, addressesQuery.fetchNextPage]);

   const deleteAddressItem = useCallback(() => {
      if (!deletingAddress || deleteMutation.isPending) {
         return;
      }

      deleteMutation.mutate(deletingAddress.id);
   }, [deletingAddress, deleteMutation]);

   const apiError = addressesQuery.error ? parseApiError(addressesQuery.error) : null;

   return {
      addresses,
      hasSavedAddresses,
      loading: addressesQuery.isLoading,
      searching: addressesQuery.isFetching && !addressesQuery.isFetchingNextPage && search !== '',
      loadingMore: addressesQuery.isFetchingNextPage,
      hasMore: Boolean(addressesQuery.hasNextPage),
      error: apiError?.message ?? '',
      searchAddresses,
      loadMoreAddresses,
      deletingAddress,
      setDeletingAddress,
      isDeleting: deleteMutation.isPending,
      deleteAddressItem,
      retry: addressesQuery.refetch,
   };
}
