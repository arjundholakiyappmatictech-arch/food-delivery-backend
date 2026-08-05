'use client';

import { LocateFixed } from 'lucide-react';
import { Button, Spinner } from 'flowbite-react';

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
      <div className="space-y-2">
         <Button
            type="button"
            disabled={isLoading}
            onClick={handleClick}
            className="w-full rounded-xl bg-orange-600 enabled:hover:bg-orange-700 focus:ring-orange-300"
         >
            {isLoading ? (
               <>
                  <Spinner size="sm" aria-label="Detecting location" className="mr-2" />
                  Detecting location...
               </>
            ) : (
               <>
                  <LocateFixed className="mr-2 size-4" />
                  Use current location
               </>
            )}
         </Button>

         {error && (
            <p role="alert" className="text-center text-sm text-red-600">
               {error}
            </p>
         )}
      </div>
   );
}
