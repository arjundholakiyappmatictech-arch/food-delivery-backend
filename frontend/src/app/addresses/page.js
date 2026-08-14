'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';

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
      <main className="flex min-h-[calc(100vh-75px)] w-full items-center justify-center bg-[#FAFAFA] px-4 py-8 sm:px-6 sm:py-12 md:px-8">
         <div className="w-full max-w-lg rounded-2xl border border-[#E9E9E9] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-8 md:p-10">
            {/* Header */}
            <header className="mb-6 text-center">
               <h1 className="text-2xl font-bold tracking-tight text-[#02060C] sm:text-3xl">
                  {hasSavedAddresses ? 'Choose delivery location' : 'Set delivery location'}
               </h1>

               <p className="mt-2 text-sm text-[#595959]">
                  {hasSavedAddresses
                     ? 'Select a saved address or use your current location.'
                     : 'Detect your location or add an address to explore restaurants.'}
               </p>
            </header>

            <div className="space-y-5">
               {/* Current Location Button */}
               <CurrentLocationButton disabled={loading} onLocationDetected={handleLocationDetected} />

               {/* Divider */}
               <div className="relative flex items-center justify-center">
                  <div className="w-full border-t border-[#E9E9E9]" />
                  <span className="absolute bg-white px-3 text-xs font-semibold uppercase tracking-wider text-[#A6A6A6]">
                     {hasSavedAddresses ? 'Or choose from saved' : 'Or add manually'}
                  </span>
               </div>

               {/* Saved Addresses Section */}
               {hasSavedAddresses && (
                  <div className="space-y-3">
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

               {/* Add Address Button */}
               <Link
                  href={loading ? '#' : '/addresses/add'}
                  aria-disabled={loading}
                  onClick={(event) => {
                     if (loading) {
                        event.preventDefault();
                     }
                  }}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl border border-[#E56A77] bg-white py-3 px-4 text-sm font-semibold text-[#E56A77] transition-colors duration-150 hover:bg-[#FFF4F5] focus:outline-none focus:ring-2 focus:ring-[#E56A77]/30 ${
                     loading ? 'pointer-events-none cursor-not-allowed opacity-50' : 'cursor-pointer'
                  }`}
               >
                  <Plus className="size-4" />
                  <span>{hasSavedAddresses ? 'Add another address' : 'Add new address'}</span>
               </Link>

               {/* Error message */}
               {error && (
                  <div
                     role="alert"
                     aria-live="polite"
                     className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs font-medium text-red-600"
                  >
                     {error}
                  </div>
               )}
            </div>
         </div>
      </main>
   );
}
