import { useQuery } from '@tanstack/react-query';

import { getAddresses } from '@/services/addressService';

export default function useAddress(addressId) {
   const addressQuery = useQuery({
      queryKey: ['address', addressId],

      queryFn: async () => {
         const response = await getAddresses('', 1);

         const address = response?.addresses?.find((item) => String(item.id) === String(addressId));

         if (!address) {
            throw new Error('Address not found.');
         }

         return address;
      },

      enabled: Boolean(addressId),
   });

   return {
      address: addressQuery.data ?? null,
      loading: addressQuery.isLoading,
      error: addressQuery.error?.message ?? '',
   };
}
