'use client';

import { useState } from 'react';

function getErrorMessage(error) {
   switch (error.code) {
      case 1:
         return 'Location permission was denied.';

      case 2:
         return 'Your current location is unavailable.';

      case 3:
         return 'Location detection took too long.';

      default:
         return 'Unable to detect your current location.';
   }
}

export function useCurrentLocation() {
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   const getCurrentLocation = () => {
      return new Promise((resolve, reject) => {
         setError('');

         if (!navigator.geolocation) {
            const message = 'Geolocation is not supported by your browser.';

            setError(message);
            reject(new Error(message));

            return;
         }

         setLoading(true);

         navigator.geolocation.getCurrentPosition(
            (position) => {
               const location = {
                  type: 'current_location',
                  title: 'Current location',
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
               };

               setLoading(false);
               resolve(location);
            },

            (locationError) => {
               const message = getErrorMessage(locationError);

               setLoading(false);
               setError(message);
               reject(new Error(message));
            },

            {
               enableHighAccuracy: true,
               timeout: 10000,
               maximumAge: 300000,
            },
         );
      });
   };

   return {
      getCurrentLocation,
      loading,
      error,
   };
}
