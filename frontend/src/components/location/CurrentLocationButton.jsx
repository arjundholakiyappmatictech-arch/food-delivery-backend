'use client';

import { LocateFixed } from 'lucide-react';
import { useCurrentLocation } from '@/lib/hooks/useCurrentLocation';

export function CurrentLocationButton({ onLocationDetected, disabled = false }) {
   const { getCurrentLocation, loading, error } = useCurrentLocation();

   const isLoading = loading || disabled;

   const handleClick = async () => {
      try {
         const location = await getCurrentLocation();

         await onLocationDetected(location);
      } catch {
         // The hook or parent component displays the error.
      }
   };

   return (
      <div className="space-y-1">
         <button
            type="button"
            disabled={isLoading}
            onClick={handleClick}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#D95765] py-3 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#C74655] active:bg-[#C84E5B] focus:outline-none focus:ring-2 focus:ring-[#E56A77]/40 disabled:cursor-not-allowed disabled:opacity-60"
         >
            {isLoading ? (
               <>
                  <svg
                     className="size-4 animate-spin text-white"
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
                  <span>Detecting location...</span>
               </>
            ) : (
               <>
                  <LocateFixed className="size-4 shrink-0" />
                  <span>Use current location</span>
               </>
            )}
         </button>

         {error && (
            <p role="alert" className="text-center text-xs font-medium text-red-600">
               {error}
            </p>
         )}
      </div>
   );
}
