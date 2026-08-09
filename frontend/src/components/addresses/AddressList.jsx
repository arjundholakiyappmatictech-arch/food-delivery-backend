'use client';

import { useRef, useState } from 'react';
import { Spinner } from 'flowbite-react';

import useInfiniteScroll from '@/lib/hooks/useInfiniteScroll';

import AddressCard from './AddressCard';

export default function AddressList({
   addresses,
   searching,
   loadingMore,
   hasMore,
   locationLoading,
   onLoadMore,
   onSelectAddress,
}) {
   const scrollContainerRef = useRef(null);
   const [hasScrolled, setHasScrolled] = useState(false);

   const loaderRef = useInfiniteScroll({
      onLoadMore,
      hasMore: hasMore && hasScrolled,
      loading: searching || loadingMore,
      rootRef: scrollContainerRef,
   });

   if (searching) {
      return (
         <div className="rounded-2xl border border-[#e4e7ec] bg-white py-8 text-center">
            <Spinner size="sm" aria-label="Searching addresses" />
            <p className="mt-3 text-sm font-medium text-[#667085]">Searching addresses...</p>
         </div>
      );
   }

   if (addresses.length === 0) {
      return (
         <div className="rounded-2xl border border-dashed border-[#d9dee7] bg-white px-5 py-8 text-center">
            <p className="text-sm font-medium text-[#667085]">No saved addresses match your search.</p>
         </div>
      );
   }

   return (
      <div
         ref={scrollContainerRef}
         onScroll={(event) => {
            if (event.currentTarget.scrollTop > 0) {
               setHasScrolled(true);
            }
         }}
         className="max-h-[330px] overflow-y-auto pr-1"
      >
         <div className="space-y-4">
            {addresses.map((address) => (
               <AddressCard
                  key={address.id}
                  address={address}
                  disabled={locationLoading}
                  onSelect={onSelectAddress}
               />
            ))}
         </div>

         {hasMore && (
            <div ref={loaderRef} className="flex min-h-12 items-center justify-center">
               {loadingMore && (
                  <div className="flex items-center gap-2 text-sm font-medium text-[#667085]">
                     <Spinner size="sm" aria-label="Loading more addresses" />
                     Loading more addresses...
                  </div>
               )}
            </div>
         )}

         {!hasMore && addresses.length > 2 && (
            <p className="py-4 text-center text-xs font-semibold text-[#98a2b3]">No more addresses.</p>
         )}
      </div>
   );
}
