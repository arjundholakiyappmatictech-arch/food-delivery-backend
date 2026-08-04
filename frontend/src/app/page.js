'use client';

import { Button } from '@/components/ui/button';
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
            <p className="text-sm text-muted-foreground">Loading your saved addresses...</p>
         </main>
      );
   }

   if (addressesError && addresses.length === 0) {
      return (
         <main className="flex min-h-[60vh] items-center justify-center px-4">
            <div className="space-y-4 text-center">
               <p className="text-sm text-destructive">{addressesError}</p>

               <Button type="button" variant="outline" onClick={fetchAddresses}>
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
            <section className="rounded-2xl border bg-card p-6">
               <p className="font-medium text-foreground">Nearby restaurants fetched successfully.</p>

               <p className="mt-2 text-sm capitalize text-muted-foreground">
                  Selected location: {selectedLocation.title}
               </p>

               <Button type="button" variant="outline" onClick={clearSelectedLocation} className="mt-4">
                  Change location
               </Button>
            </section>
         )}
      </main>
   );
}
