'use client';

import Link from 'next/link';
import { MapPin, MapPinned } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { cn } from '@/lib/utils';

import { AddressSearch } from './AdddressSearch';
import { CurrentLocationButton } from './CurrentLocationButton';
import { SavedAddressList } from './SavedAddressList';

export function LocationDialog({
   open,
   addresses,
   hasSavedAddresses,

   addressesSearching = false,
   addressesLoadingMore = false,
   hasMoreAddresses = false,

   onSearch,
   onLoadMoreAddresses,
   onSelectAddress,
   onLocationDetected,

   loading = false,
   error = '',
}) {
   return (
      <Dialog open={open} disablePointerDismissal>
         <DialogContent
            showCloseButton={false}
            className="w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-3xl border-0 p-0 shadow-xl"
         >
            <div className="bg-orange-50 px-6 py-7">
               <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-white ring-8 ring-orange-100">
                  <MapPin className="size-9 text-orange-600" />
               </div>
            </div>

            <div className="space-y-6 px-6 pb-7 sm:px-8">
               <DialogHeader className="space-y-2 text-center">
                  <DialogTitle className="text-xl font-semibold">
                     {hasSavedAddresses ? 'Choose delivery location' : 'Enable location access'}
                  </DialogTitle>

                  <DialogDescription className="leading-6">
                     {hasSavedAddresses
                        ? 'Select a saved address or use your current location.'
                        : 'Allow location access to find restaurants delivering near you.'}
                  </DialogDescription>
               </DialogHeader>

               <CurrentLocationButton disabled={loading} onLocationDetected={onLocationDetected} />

               {hasSavedAddresses && (
                  <div className="space-y-3">
                     <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-border" />

                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                           Saved addresses
                        </p>

                        <div className="h-px flex-1 bg-border" />
                     </div>

                     <AddressSearch onSearch={onSearch} />

                     <SavedAddressList
                        addresses={addresses}
                        searching={addressesSearching}
                        loadingMore={addressesLoadingMore}
                        hasMore={hasMoreAddresses}
                        locationLoading={loading}
                        onLoadMore={onLoadMoreAddresses}
                        onSelectAddress={onSelectAddress}
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
                  className={cn(
                     buttonVariants({
                        variant: 'outline',
                        size: 'lg',
                     }),
                     'h-11 w-full rounded-xl',
                     loading && 'pointer-events-none opacity-50',
                  )}
               >
                  <MapPinned className="size-4" />

                  {hasSavedAddresses ? 'Add another address' : 'Add address manually'}
               </Link>

               {error && (
                  <div
                     role="alert"
                     aria-live="polite"
                     className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3"
                  >
                     <p className="text-center text-sm text-destructive">{error}</p>
                  </div>
               )}
            </div>
         </DialogContent>
      </Dialog>
   );
}
