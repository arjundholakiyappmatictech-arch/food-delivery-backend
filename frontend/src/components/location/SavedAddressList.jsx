'use client';

import { useRef, useState } from 'react';
import { LoaderCircle } from 'lucide-react';

import useInfiniteScroll from '@/lib/hooks/useInfiniteScroll';

import { SavedAddressItem } from './SavedAddressItem';

export function SavedAddressList({
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
         <div className="py-8 text-center">
            <LoaderCircle className="mx-auto size-5 animate-spin text-muted-foreground" />

            <p className="mt-2 text-sm text-muted-foreground">Searching addresses...</p>
         </div>
      );
   }

   if (addresses.length === 0) {
      return (
         <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">No saved addresses match your search.</p>
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
         className="max-h-52.5 overflow-y-auto pr-1"
      >
         <div className="space-y-4">
            {addresses.map((address) => (
               <SavedAddressItem
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                     <LoaderCircle className="size-4 animate-spin" />
                     Loading more addresses...
                  </div>
               )}
            </div>
         )}

         {!hasMore && addresses.length > 2 && (
            <p className="py-4 text-center text-xs text-muted-foreground">No more addresses.</p>
         )}
      </div>
   );
}
