'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useLocationStore = create(
   persist(
      (set) => ({
         selectedLocation: null,
         hasHydrated: false,

         selectLocation: (location) => {
            if (!location?.addressId && (location?.latitude == null || location?.longitude == null)) {
               return false;
            }

            set({
               selectedLocation: location,
            });

            return true;
         },

         clearSelectedLocation: () => {
            set({
               selectedLocation: null,
            });
         },
         setHasHydrated: (value) => {
            set({
               hasHydrated: value,
            });
         },
      }),
      {
         name: 'selectedLocation',

         onRehydrateStorage: () => (state) => {
            state?.setHasHydrated(true);
         },
      },
   ),
);

export default useLocationStore;