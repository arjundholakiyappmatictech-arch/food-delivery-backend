'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, MapPinned } from 'lucide-react';

import useAuthGuard from '@/lib/hooks/useAuth';
import useAddresses from '@/lib/hooks/useAddresses';
import useSelectedLocation from '@/lib/hooks/useSelectedLocation';
import { formatSavedAddress } from '@/lib/location';

import { AddressSearch } from '@/components/location/AdddressSearch';
import { CurrentLocationButton } from '@/components/location/CurrentLocationButton';
import { SavedAddressList } from '@/components/location/SavedAddressList';

export default function AddressesPage() {
   useAuthGuard();

   const router = useRouter();

   const { addresses, hasSavedAddresses, hasMore, searching, loadingMore, searchAddresses, loadMoreAddresses } =
      useAddresses();

   const { selectLocation, loading, error } = useSelectedLocation();

   const handleSelectAddress = async (address) => {
      const location = formatSavedAddress(address);

      const success = await selectLocation(location);

      if (success) {
         router.replace('/');
      }
   };

   const handleLocationDetected = async (location) => {
      const success = await selectLocation(location);

      if (success) {
         router.replace('/');
      }
   };

   return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
         <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl">
            {/* Header banner — same as LocationDialog */}
            <div className="bg-orange-50 px-6 py-7">
               <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-white ring-8 ring-orange-100">
                  <MapPin className="size-9 text-orange-600" />
               </div>
            </div>

            <div className="space-y-6 px-6 pt-6 pb-7 sm:px-8">
               <header className="space-y-2 text-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                     {hasSavedAddresses ? 'Choose delivery location' : 'Enable location access'}
                  </h2>

                  <p className="text-sm leading-6 text-gray-500">
                     {hasSavedAddresses
                        ? 'Select a saved address or use your current location.'
                        : 'Allow location access to find restaurants delivering near you.'}
                  </p>
               </header>

               <CurrentLocationButton disabled={loading} onLocationDetected={handleLocationDetected} />

               {hasSavedAddresses && (
                  <div className="space-y-3">
                     <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-gray-200" />

                        <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">Saved addresses</p>

                        <div className="h-px flex-1 bg-gray-200" />
                     </div>

                     <AddressSearch onSearch={searchAddresses} />

                     <SavedAddressList
                        addresses={addresses}
                        searching={searching}
                        loadingMore={loadingMore}
                        hasMore={hasMore}
                        locationLoading={loading}
                        onLoadMore={loadMoreAddresses}
                        onSelectAddress={handleSelectAddress}
                     />
                  </div>
               )}

               <Link
                  href={loading ? '#' : '/addresses/add'}
                  aria-disabled={loading}
                  onClick={(event) => {
                     if (loading) {
                        event.preventDefault();
                     }
                  }}
                  className={[
                     'flex h-11 w-full items-center justify-center gap-2 rounded-xl',
                     'border border-gray-300 bg-white px-5 text-sm font-medium text-gray-900',
                     'transition-colors hover:bg-orange-50 focus:ring-4 focus:ring-orange-100 focus:outline-none',
                     loading ? 'pointer-events-none cursor-not-allowed opacity-50' : '',
                  ].join(' ')}
               >
                  <MapPinned className="size-4" />

                  {hasSavedAddresses ? 'Add another address' : 'Add address manually'}
               </Link>

               {error && (
                  <div
                     role="alert"
                     aria-live="polite"
                     className="rounded-xl border border-red-200 bg-red-50 px-4 py-3"
                  >
                     <p className="text-center text-sm text-red-600">{error}</p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}
