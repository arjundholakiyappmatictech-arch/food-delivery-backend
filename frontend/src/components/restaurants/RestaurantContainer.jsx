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
               Try again
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
            className="
               my-[20px]
               grid
               grid-cols-3
               gap-x-[20px]
               gap-y-[35px]

               max-[1000px]:grid-cols-3
               max-[1000px]:gap-x-[15px]

               max-[800px]:grid-cols-2
               max-[800px]:gap-x-[15px]

               max-[560px]:grid-cols-2
               max-[560px]:gap-x-[10px]
               max-[560px]:gap-y-[25px]

               max-[610px]:my-[5px]
            "
         >
            {restaurantsList.map((restaurant) => (
               <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
         </div>
      </>
   );
}
