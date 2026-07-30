'use client';

import { LoaderCircle, LocateFixed } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useCurrentLocation } from '@/lib/hooks/useCurrentLocation';

export function CurrentLocationButton({ onLocationDetected, disabled = false }) {
   const { getCurrentLocation, loading, error } = useCurrentLocation();

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
            size="lg"
            disabled={loading || disabled}
            onClick={handleClick}
            className="h-11 w-full rounded-xl bg-orange-600 text-white hover:bg-orange-700"
         >
            {loading || disabled ? (
               <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Detecting location...
               </>
            ) : (
               <>
                  <LocateFixed className="size-4" />
                  Use current location
               </>
            )}
         </Button>

         {error && (
            <p role="alert" className="text-center text-sm text-destructive">
               {error}
            </p>
         )}
      </div>
   );
}
