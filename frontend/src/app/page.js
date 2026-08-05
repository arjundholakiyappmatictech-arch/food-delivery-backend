'use client';

import { Button } from 'flowbite-react';
import { LocationDialog } from '@/components/location/LocationDialog';

import useAuthGuard from '@/lib/hooks/useAuth';
import useAddresses from '@/lib/hooks/useAddresses';
import useSelectedLocation from '@/lib/hooks/useSelectedLocation';

import { formatSavedAddress } from '@/lib/location';

export default function HomePage() {
   useAuthGuard();

   const {
      addresses,
      hasSavedAddresses,
      hasMore: hasMoreAddresses,

      loading: addressesLoading,
      searching: addressesSearching,
      loadingMore: addressesLoadingMore,
      error: addressesError,

      fetchAddresses,
      searchAddresses,
      loadMoreAddresses,
   } = useAddresses();

   const {
      selectedLocation,
      loading: locationLoading,
      initialized: locationInitialized,
      error: locationError,
      selectLocation,
      clearSelectedLocation,
   } = useSelectedLocation();

   const handleSelectAddress = async (address) => {
      const location = formatSavedAddress(address);

      await selectLocation(location);
   };

   const showLocationDialog = locationInitialized && !addressesLoading && !addressesError && selectedLocation === null;

   if (!locationInitialized || addressesLoading) {
      return (
         <main className="mx-auto max-w-7xl px-4 py-10">
            <p className="text-sm text-gray-500">Loading your saved addresses...</p>
         </main>
      );
   }

   if (addressesError && addresses.length === 0) {
      return (
         <main className="flex min-h-[60vh] items-center justify-center px-4">
            <div className="space-y-4 text-center">
               <p className="text-sm text-red-600">{addressesError}</p>

               <Button type="button" color="light" onClick={fetchAddresses} className="mx-auto border border-gray-300">
                  Try again
               </Button>
            </div>
         </main>
      );
   }

   return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
         <LocationDialog
            open={showLocationDialog}
            addresses={addresses}
            hasSavedAddresses={hasSavedAddresses}
            addressesSearching={addressesSearching}
            addressesLoadingMore={addressesLoadingMore}
            hasMoreAddresses={hasMoreAddresses}
            loading={locationLoading}
            error={locationError || addressesError}
            onSearch={searchAddresses}
            onLoadMoreAddresses={loadMoreAddresses}
            onSelectAddress={handleSelectAddress}
            onLocationDetected={selectLocation}
         />

         {selectedLocation && (
            <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
               <p className="font-medium text-gray-900">Nearby restaurants fetched successfully.</p>

               <p className="mt-2 text-sm capitalize text-gray-500">Selected location: {selectedLocation.title}</p>

               <Button
                  type="button"
                  color="light"
                  onClick={clearSelectedLocation}
                  className="mt-4 border border-gray-300"
               >
                  Change location
               </Button>
            </section>
         )}
      </main>
   );
}
