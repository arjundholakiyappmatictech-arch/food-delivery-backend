'use client';

import { useRef, useState } from 'react';
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
         <div className="flex flex-col items-center justify-center py-6 text-center">
            <svg
               className="size-5 animate-spin text-[#E56A77]"
               xmlns="http://www.w3.org/2000/svg"
               fill="none"
               viewBox="0 0 24 24"
               aria-hidden="true"
            >
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
               <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
               />
            </svg>
            <p className="mt-2 text-xs font-medium text-[#595959]">Searching addresses...</p>
         </div>
      );
   }

   if (addresses.length === 0) {
      return (
         <div className="rounded-xl border border-dashed border-[#E9E9E9] bg-white py-6 text-center">
            <p className="text-xs font-medium text-[#595959]">No saved addresses match your search.</p>
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
         className="max-h-56 space-y-2.5 overflow-y-auto pr-1"
      >
         {addresses.map((address) => (
            <SavedAddressItem
               key={address.id}
               address={address}
               disabled={locationLoading}
               onSelect={onSelectAddress}
            />
         ))}

         {/* Loader marker */}
         {hasMore && (
            <div ref={loaderRef} className="flex min-h-10 items-center justify-center py-2">
               {loadingMore && (
                  <div className="flex items-center gap-1.5 text-xs text-[#595959]">
                     <svg
                        className="size-3.5 animate-spin text-[#E56A77]"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                     >
                        <circle
                           className="opacity-25"
                           cx="12"
                           cy="12"
                           r="10"
                           stroke="currentColor"
                           strokeWidth="4"
                        />
                        <path
                           className="opacity-75"
                           fill="currentColor"
                           d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                     </svg>
                     <span>Loading more...</span>
                  </div>
               )}
            </div>
         )}
      </div>
   );
}
