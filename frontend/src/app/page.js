'use client';

import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { LocationDialog } from '@/components/location/LocationDialog';
import { getAddresses } from '@/services/addressService';
import { getNearbyRestaurants } from '@/services/restaurantService';
import useAuthGuard from '@/lib/hooks/useAuth';

export default function HomePage() {
   useAuthGuard();
   const [addresses, setAddresses] = useState([]);
   const [selectedLocation, setSelectedLocation] = useState(null);
   const [addressesLoading, setAddressesLoading] = useState(true);
   const [locationLoading, setLocationLoading] = useState(false);
   const [addressesError, setAddressesError] = useState('');
   const [locationError, setLocationError] = useState('');
   const [successMessage, setSuccessMessage] = useState('');

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchAddresses();
   }, [fetchAddresses]);

   const fetchNearbyAndSelectLocation = async (location) => {
      try {
         setLocationLoading(true);
         setLocationError('');
         setSuccessMessage('');

         await getNearbyRestaurants(location);

         setSelectedLocation(location);
         setSuccessMessage('Nearby restaurants fetched successfully.');
      } catch (error) {
         const message = error.response?.data?.message || 'Unable to fetch nearby restaurants.';

         setLocationError(message);
      } finally {
         setLocationLoading(false);
      }
   };

   const handleCurrentLocation = async (location) => {
      await fetchNearbyAndSelectLocation(location);
   };

   const handleSelectAddress = async (address) => {
      const location = {
         type: 'saved_address',
         addressId: address.id,
         title: address.label,
         address: [address.address_line, address.city, address.state, address.pincode].filter(Boolean).join(', '),
      };

      await fetchNearbyAndSelectLocation(location);
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
            onSelectAddress={handleSelectAddress}
            onLocationDetected={handleCurrentLocation}
         />

         {successMessage && (
            <div className="rounded-2xl border bg-card p-6">
               <p className="font-medium text-foreground">{successMessage}</p>

               {selectedLocation && (
                  <p className="mt-2 text-sm text-muted-foreground">Selected location: {selectedLocation.title}</p>
               )}
            </div>
         )}
      </main>
   );
}
