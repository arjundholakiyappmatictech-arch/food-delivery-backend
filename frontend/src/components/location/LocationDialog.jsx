'use client';

import Link from 'next/link';
import { MapPin, MapPinned } from 'lucide-react';
import { Modal, ModalBody } from 'flowbite-react';

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
      <Modal
         show={open}
         onClose={() => {}}
         dismissible={false}
         popup
         size="md"
         className="
            overflow-hidden
            [&>div]:h-auto
            [&>div]:overflow-hidden
            [&>div>div]:max-h-none
            [&>div>div]:overflow-hidden
            [&>div>div]:rounded-3xl
         "
      >
         <ModalBody className="overflow-hidden p-0">
            <div className="overflow-hidden">
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

                  <CurrentLocationButton disabled={loading} onLocationDetected={onLocationDetected} />

                  {hasSavedAddresses && (
                     <div className="space-y-3">
                        <div className="flex items-center gap-3">
                           <div className="h-px flex-1 bg-gray-200" />

                           <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">Saved addresses</p>

                           <div className="h-px flex-1 bg-gray-200" />
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
         </ModalBody>
      </Modal>
   );
}
