import { toast } from 'react-hot-toast';
import { useCallback, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createAddress, deleteAddress, getAddresses, updateAddress } from '@/services/addressService';

import { parseApiError } from '@/utils/apiError';

export default function useAddresses() {
   const queryClient = useQueryClient();

   const [search, setSearch] = useState('');
   const [deletingAddress, setDeletingAddress] = useState(null);

   // common errors
   const handleAddressMutationError = (error, action) => {
      if (error.status === 422) {
         return;
      }

      if (error.status === 409) {
         toast.error(error.message ?? 'This address already exists.');
         return;
      }

      if (error.status === 403) {
         toast.error(error.message ?? `You are not allowed to ${action} this address.`);
         return;
      }

      if (error.isNetworkError) {
         toast.error('Unable to connect to the server. Please check your connection.');
         return;
      }

      toast.error(error.message ?? `Unable to ${action} address. Please try again.`);
   };

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

   const createMutation = useMutation({
      mutationFn: async (data) => {
         try {
            return await createAddress(data);
         } catch (error) {
            throw parseApiError(error);
         }
      },

      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: ['addresses'],
         });

         toast.success('Address added successfully.');
      },

      onError: (error) => {
         handleAddressMutationError(error, 'update');
      },
   });

   const updateMutation = useMutation({
      mutationFn: async ({ addressId, data }) => {
         try {
            return await updateAddress(addressId, data);
         } catch (error) {
            throw parseApiError(error);
         }
      },

      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: ['addresses'],
         });

         toast.success('Address updated successfully.');
      },

      onError: (error) => {
         handleAddressMutationError(error, 'update');
      },
   });

   const addresses = addressesQuery.data?.pages.flatMap((page) => page?.addresses ?? []) ?? [];

   const hasSavedAddresses = addresses.length > 0 || search !== '';

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
      search,
      loading: addressesQuery.isLoading,
      searching: addressesQuery.isFetching && !addressesQuery.isFetchingNextPage && search !== '',
      loadingMore: addressesQuery.isFetchingNextPage,
      hasMore: Boolean(addressesQuery.hasNextPage),
      error: apiError?.message ?? '',
      searchAddresses,
      loadMoreAddresses,

      createAddress: createMutation.mutateAsync,
      isCreating: createMutation.isPending,

      updateAddress: updateMutation.mutateAsync,
      isUpdating: updateMutation.isPending,

      deletingAddress,
      setDeletingAddress,
      isDeleting: deleteMutation.isPending,
      deleteAddressItem,

      retry: addressesQuery.refetch,
   };
}
