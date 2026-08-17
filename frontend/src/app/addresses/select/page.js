'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, MapPin, Loader2 } from 'lucide-react';

import useAuthGuard from '@/lib/hooks/useAuth';
import useAddresses from '@/lib/hooks/useAddresses';
import useSelectedLocation from '@/lib/hooks/useSelectedLocation';
import { formatSavedAddress } from '@/lib/location';

import { AddressSearch } from '@/components/location/AddressSearch';
import { CurrentLocationButton } from '@/components/location/CurrentLocationButton';
import AddressSkeleton from '@/components/skeletons/AddressSkeleton';
import SelectAddressItem from '@/components/addresses/SelectAddressItem';

export default function SelectAddressPage() {
   useAuthGuard();

   const router = useRouter();

   const { addresses, hasSavedAddresses, loading, searching, hasMore, searchAddresses, loadMoreAddresses } =
      useAddresses();

   const { selectLocation, loading: locationLoading, error: locationError } = useSelectedLocation();

   const handleSelectLocation = async (location) => {
      const success = await selectLocation(location);

      if (success) {
         router.replace('/');
      }
   };

   return (
      <main className="flex min-h-screen min-h-dvh w-full items-center justify-center bg-[#FAFAFA] px-4 py-6 sm:px-6">
         <div className="w-full max-w-[500px] rounded-2xl border border-[#E9E9E9] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-6">
            {/* Header */}
            <header className="mb-3.5 text-center">
               <h1 className="text-xl font-bold tracking-tight text-[#02060C] sm:text-2xl">Select Address</h1>
               <p className="mt-0.5 text-xs text-[#595959]">
                  {hasSavedAddresses
                     ? 'Select a delivery address to explore restaurants near you.'
                     : 'Add a delivery address to start exploring restaurants.'}
               </p>
            </header>

            <div className="space-y-3">
               {/* Location Error alert */}
               {locationError && (
                  <div
                     role="alert"
                     aria-live="polite"
                     className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-center text-xs font-medium text-red-600"
                  >
                     {locationError}
                  </div>
               )}

               {/* Initial Loading Skeleton */}
               {loading && addresses.length === 0 ? (
                  <AddressSkeleton count={3} />
               ) : hasSavedAddresses ? (
                  <>
                     {/* Search Bar */}
                     <AddressSearch onSearch={searchAddresses} />

                     {/* Saved Addresses List */}
                     <div className="max-h-60 space-y-2 overflow-y-auto scrollbar-hide">
                        {searching ? (
                           <div className="flex flex-col items-center justify-center py-4 text-center">
                              <Loader2 className="size-4 animate-spin text-[#E56A77]" />
                              <p className="mt-1 text-xs font-medium text-[#595959]">Searching addresses...</p>
                           </div>
                        ) : addresses.length === 0 ? (
                           <div className="rounded-xl border border-dashed border-[#E9E9E9] bg-[#FAFAFA] py-4 text-center">
                              <p className="text-xs font-medium text-[#595959]">No saved addresses match your search.</p>
                           </div>
                        ) : (
                           addresses.map((address) => (
                              <SelectAddressItem
                                 key={address.id}
                                 address={address}
                                 disabled={locationLoading}
                                 onSelect={(addr) => handleSelectLocation(formatSavedAddress(addr))}
                              />
                           ))
                        )}

                        {hasMore && (
                           <div className="pt-1 text-center">
                              <button
                                 type="button"
                                 onClick={loadMoreAddresses}
                                 className="cursor-pointer text-xs font-semibold text-[#E56A77] hover:underline"
                              >
                                 Load more addresses
                              </button>
                           </div>
                        )}
                     </div>

                     {/* Current Location Option */}
                     <CurrentLocationButton disabled={locationLoading} onLocationDetected={handleSelectLocation} />

                     {/* Add New Address Button */}
                     <Link
                        href="/addresses/add?from=select"
                        className="flex h-9.5 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#E56A77] bg-white px-4 text-xs font-semibold text-[#E56A77] transition-colors duration-150 hover:bg-[#FFF4F5] focus:outline-none focus:ring-2 focus:ring-[#E56A77]/30 sm:text-sm"
                     >
                        <Plus className="size-3.5" />
                        <span>Add New Address</span>
                     </Link>
                  </>
               ) : (
                  /* Empty State */
                  <div className="space-y-3.5 py-2 text-center">
                     <div className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-[#FFF4F5] text-[#E56A77]">
                        <MapPin className="size-5.5" />
                     </div>

                     <div className="space-y-1">
                        <h2 className="text-sm font-bold text-[#02060C] sm:text-base">No delivery address saved</h2>
                        <p className="text-xs leading-relaxed text-[#595959]">
                           You need a delivery address to explore restaurants and place orders. Add your address to get started.
                        </p>
                     </div>

                     <div className="space-y-2.5 pt-1">
                        <Link
                           href="/addresses/add?from=select"
                           className="flex h-9.5 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#E56A77] px-4 text-xs font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-[#D95765] active:bg-[#C84E5B] focus:outline-none focus:ring-2 focus:ring-[#E56A77]/40 sm:text-sm"
                        >
                           <Plus className="size-3.5" />
                           <span>Add New Address</span>
                        </Link>

                        <CurrentLocationButton disabled={locationLoading} onLocationDetected={handleSelectLocation} />
                     </div>
                  </div>
               )}
            </div>
         </div>
      </main>
   );
}
