'use client';

import { useCallback, useEffect, useState } from 'react';

import { getNearbyRestaurants } from '@/services/restaurantService';

const STORAGE_KEY = 'selectedLocation';

export default function useSelectedLocation() {
   const [selectedLocation, setSelectedLocation] = useState(null);

   const [loading, setLoading] = useState(false);
   const [initialized, setInitialized] = useState(false);

   const [error, setError] = useState('');

   const selectLocation = useCallback(async (location) => {
      try {
         setLoading(true);
         setError('');

         await getNearbyRestaurants(location);

         localStorage.setItem(STORAGE_KEY, JSON.stringify(location));

         setSelectedLocation(location);

         return true;
      } catch (error) {
         const message = error.response?.data?.message || 'Unable to fetch nearby restaurants.';

         setError(message);

         return false;
      } finally {
         setLoading(false);
      }
   }, []);

   const clearSelectedLocation = useCallback(() => {
      localStorage.removeItem(STORAGE_KEY);

      setSelectedLocation(null);
      setError('');
   }, []);

   useEffect(() => {
      const restoreSelectedLocation = async () => {
         const storedLocation = localStorage.getItem(STORAGE_KEY);

         if (!storedLocation) {
            setInitialized(true);

            return;
         }

         try {
            const location = JSON.parse(storedLocation);

            await getNearbyRestaurants(location);

            setSelectedLocation(location);
         } catch (error) {
            localStorage.removeItem(STORAGE_KEY);

            const message = error.response?.data?.message || 'Your saved location is no longer available.';

            setError(message);
         } finally {
            setInitialized(true);
         }
      };

      restoreSelectedLocation();
   }, []);

   return {
      selectedLocation,
      loading,
      initialized,
      error,
      selectLocation,
      clearSelectedLocation,
   };
}
