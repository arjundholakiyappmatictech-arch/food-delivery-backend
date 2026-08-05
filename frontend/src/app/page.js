'use client';

import { Button } from 'flowbite-react';
import { LocationDialog } from '@/components/location/LocationDialog';

import useAuthGuard from '@/lib/hooks/useAuth';
import useAddresses from '@/lib/hooks/useAddresses';
import useSelectedLocation from '@/lib/hooks/useSelectedLocation';

import { formatSavedAddress } from '@/lib/location';
import { Header } from '@/components/layout/Header';
import RestaurantContainer from '@/components/restaurants/RestaurantContainer';
import Search from '@/components/Search';
import useRestaurants from '@/lib/hooks/useRestaurants';
import { useState } from 'react';

export default function HomePage() {
   useAuthGuard();

   const [searchText, setSearchText] = useState('');

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

   const {
      restaurants,
      loading: restaurantsLoading,
      searching: restaurantsSearching,
      error: restaurantsError,
      retry: retryRestaurants,
   } = useRestaurants(selectedLocation, searchText);

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
         {!showLocationDialog && selectedLocation && (
            <>
               <Header />

               <div className="h-[75px] max-[610px]:h-[60px]" />
            </>
         )}
         <Search searchText={searchText} setSearchText={setSearchText} />

         <RestaurantContainer
            restaurantsList={restaurants}
            loading={restaurantsLoading}
            searching={restaurantsSearching}
            error={restaurantsError}
            onRetry={retryRestaurants}
         />

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
      </main>
   );
}
