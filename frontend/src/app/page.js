/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { LocationDialog } from '@/components/location/LocationDialog';
import { getAddresses } from '@/services/addressService';
import { getNearbyRestaurants } from '@/services/restaurantService';
import useAuthGuard from '@/lib/hooks/useAuth';

function formatSavedAddress(address) {
   return {
      type: 'saved_address',
      addressId: address.id,
      title: address.label,
      address: [address.address_line, address.city, address.state, address.pincode].filter(Boolean).join(', '),
   };
}

export default function HomePage() {
   useAuthGuard();
   const [addresses, setAddresses] = useState([]);
   const [selectedLocation, setSelectedLocation] = useState(null);

   const [addressesLoading, setAddressesLoading] = useState(true);
   const [locationLoading, setLocationLoading] = useState(false);
   const [addressesSearching, setAddressesSearching] = useState(false);

   const [addressesError, setAddressesError] = useState('');
   const [locationError, setLocationError] = useState('');

   const fetchAddresses = useCallback(async () => {
      try {
         setAddressesLoading(true);
         setAddressesError('');

         const data = await getAddresses();

         setAddresses(data);
      } catch (error) {
         const message = error.response?.data?.message || 'Unable to fetch your saved addresses.';

         setAddressesError(message);
      } finally {
         setAddressesLoading(false);
      }
   }, []);

   useEffect(() => {
      fetchAddresses();
   }, [fetchAddresses]);

   const searchAddresses = useCallback(async (search) => {
      try {
         setAddressesSearching(true);
         setAddressesError('');

         const data = await getAddresses(search);

         setAddresses(data);
      } catch (error) {
         const message = error.response?.data?.message || 'Unable to search your saved addresses.';

         setAddressesError(message);
      } finally {
         setAddressesSearching(false);
      }
   }, []);

   const selectLocation = async (location) => {
      try {
         setLocationLoading(true);
         setLocationError('');

         await getNearbyRestaurants(location);

         setSelectedLocation(location);
      } catch (error) {
         const message = error.response?.data?.message || 'Unable to fetch nearby restaurants.';

         setLocationError(message);
      } finally {
         setLocationLoading(false);
      }
   };

   const handleSelectAddress = async (address) => {
      const location = formatSavedAddress(address);

      await selectLocation(location);
   };

   const showLocationDialog = !addressesLoading && !addressesError && selectedLocation === null;

   if (addressesLoading) {
      return (
         <main className="mx-auto max-w-7xl px-4 py-10">
            <p className="text-sm text-muted-foreground">Loading your saved addresses...</p>
         </main>
      );
   }

   if (addressesError) {
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
            loading={locationLoading}
            error={locationError}
            onSearch={searchAddresses}
            onSelectAddress={handleSelectAddress}
            onLocationDetected={selectLocation}
         />

         {selectedLocation && (
            <div className="rounded-2xl border bg-card p-6">
               <p className="font-medium text-foreground">Nearby restaurants fetched successfully.</p>

               <p className="mt-2 text-sm capitalize text-muted-foreground">
                  Selected location: {selectedLocation.title}
               </p>
            </div>
         )}
      </main>
   );
}
