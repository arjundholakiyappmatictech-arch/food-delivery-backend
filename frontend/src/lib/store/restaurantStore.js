import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useRestaurantStore = create(
   persist(
      (set) => ({
         selectedRestaurant: null,
         hasHydrated: false,

         setHasHydrated: (value) =>
            set({
               hasHydrated: value,
            }),

         setSelectedRestaurant: (restaurant) =>
            set({
               selectedRestaurant: {
                  id: restaurant.id,
                  name: restaurant.name,
                  image_url: restaurant.image_url || '/assets/default-restaurant.jpg',
                  address: restaurant.address,
                  status: restaurant.status,
                  distance: restaurant.distance,
               },
            }),

         clearSelectedRestaurant: () =>
            set({
               selectedRestaurant: null,
            }),
      }),
      {
         name: 'selected-restaurant',

         onRehydrateStorage: () => (state) => {
            state?.setHasHydrated(true);
         },
      },
   ),
);

export default useRestaurantStore;
