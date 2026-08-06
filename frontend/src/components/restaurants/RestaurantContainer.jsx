'use client';

import RestaurantCard from './RestaurantCard';

export default function RestaurantContainer({ restaurantsList, loading, searching, error, onRetry }) {
   if (loading) {
      return <p className="py-10 text-center text-gray-500">Loading nearby restaurants...</p>;
   }

   if (error) {
      return (
         <div className="py-10 text-center">
            <p className="text-red-600">{error}</p>

            <button type="button" onClick={onRetry} className="mt-3 rounded border px-4 py-2">
               Try Again
            </button>
         </div>
      );
   }

   if (!restaurantsList?.length) {
      return <p className="py-10 text-center text-gray-500">No restaurants found nearby.</p>;
   }

   return (
      <>
         {searching && <p className="text-center text-sm text-gray-500">Searching...</p>}

         <div
            className="restaurant-container my-[20px]
      grid
      grid-cols-4
      gap-[20px]

      max-[1100px]:grid-cols-3
      max-[800px]:grid-cols-2
      max-[560px]:grid-cols-2
      max-[610px]:my-[5px]"
         >
            {restaurantsList.map((restaurant) => (
               <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
         </div>
      </>
   );
}
