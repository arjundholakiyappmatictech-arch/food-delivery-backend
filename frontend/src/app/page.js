'use client';

import { useState } from 'react';

import { Button } from 'flowbite-react';

import Search from '@/components/common/Search';
import RestaurantContainer from '@/components/restaurants/RestaurantContainer';
import { LocationDialog } from '@/components/location/LocationDialog';

import useAuthGuard from '@/lib/hooks/useAuth';
import useAddresses from '@/lib/hooks/useAddresses';
import useRestaurants from '@/lib/hooks/useRestaurants';
import useSelectedLocation from '@/lib/hooks/useSelectedLocation';

import { formatSavedAddress } from '@/lib/location';
import Header from '@/components/layout/Header';

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
   } = useSelectedLocation();

   const { restaurants, loading, loadingMore, searching, hasMore, error, retry, loadMore } = useRestaurants(
      selectedLocation,
      searchText,
   );

   const handleSelectAddress = async (address) => {
      const location = formatSavedAddress(address);
      await selectLocation(location);
   };

   const showLocationDialog = locationInitialized && !addressesLoading && !addressesError && selectedLocation === null;

   if (!locationInitialized || addressesLoading) {
      return (
         <main className="flex min-h-screen items-center justify-center">
            <p className="text-gray-500">Loading your saved addresses...</p>
         </main>
      );
   }

   if (addressesError && addresses.length === 0) {
      return (
         <main className="flex min-h-[60vh] items-center justify-center">
            <div className="space-y-4 text-center">
               <p className="text-red-600">{addressesError}</p>

               <Button type="button" color="light" onClick={fetchAddresses}>
                  Try Again
               </Button>
            </div>
         </main>
      );
   }

   return (
      <>
         {!showLocationDialog && selectedLocation && (
            <>
               <Header />
               <div className="h-[75px] max-[610px]:h-[60px]" />
            </>
         )}

         <main className="w-full px-[25px] max-[800px]:px-[15px] max-[560px]:px-[8px]">
            <Search searchText={searchText} setSearchText={setSearchText} />

            <RestaurantContainer
               restaurantsList={restaurants}
               loading={loading}
               loadingMore={loadingMore}
               hasMore={hasMore}
               loadMore={loadMore}
               searching={searching}
               error={error}
               onRetry={retry}
            />
         </main>

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
      </>
   );
}
