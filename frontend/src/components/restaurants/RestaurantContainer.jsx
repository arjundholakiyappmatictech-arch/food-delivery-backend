'use client';

import useInfiniteScroll from '@/lib/hooks/useInfiniteScroll';
import RestaurantCard from './RestaurantCard';
import RestaurantSkeleton from '../skeletons/RestaurantSkeleton';

export default function RestaurantContainer({
   restaurantsList,
   loading,
   loadingMore,
   hasMore,
   loadMore,
   searching,
   error,
   onRetry,
}) {
   const loaderRef = useInfiniteScroll({
      hasMore,
      loading: loadingMore,
      onLoadMore: loadMore,
   });

   if (loading) {
      return (
         <div
            className="
               restaurant-container
               my-[20px]
               grid
               grid-cols-[repeat(auto-fill,minmax(250px,1fr))]
               gap-[20px]

               max-[1000px]:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]
               max-[1000px]:gap-[15px]

               max-[800px]:grid-cols-[repeat(auto-fill,minmax(32vw,1fr))]
               max-[800px]:gap-[1vw]

               max-[610px]:my-[5px]

               max-[560px]:grid-cols-[repeat(auto-fill,minmax(47vw,1fr))]
               max-[560px]:gap-[2vw]
            "
         >
            {Array.from({ length: 8 }).map((_, index) => (
               <RestaurantSkeleton key={index} />
            ))}
         </div>
      );
   }

   if (error) {
      return (
         <div className="flex flex-col items-center justify-center py-10">
            <p className="text-[#595959]">{error}</p>

            <button
               type="button"
               onClick={onRetry}
               className="mt-3 cursor-pointer rounded border border-[#D9DADB] px-4 py-2 transition hover:bg-[#F5F5F5]"
            >
               Try Again
            </button>
         </div>
      );
   }

   if (!restaurantsList?.length) {
      return <div className="flex justify-center py-10 text-[#595959]">No restaurants found nearby.</div>;
   }

   return (
      <>
         {searching && <div className="mb-3 text-center text-sm text-[#747474]">Searching...</div>}

         <div
            className="
               restaurant-container
               my-[20px]
               grid
               grid-cols-[repeat(auto-fill,minmax(250px,1fr))]
               gap-[20px]

               max-[1000px]:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]
               max-[1000px]:gap-[15px]

               max-[800px]:grid-cols-[repeat(auto-fill,minmax(32vw,1fr))]
               max-[800px]:gap-[1vw]

               max-[610px]:my-[5px]

               max-[560px]:grid-cols-[repeat(auto-fill,minmax(47vw,1fr))]
               max-[560px]:gap-[2vw]
            "
         >
            {restaurantsList.map((restaurant, index) => (
               <div
                  key={restaurant.id}
                  className="restaurant-card-animation"
                  style={{
                     animationDelay: `${(index % 5) * 120}ms`,
                  }}
               >
                  <RestaurantCard restaurant={restaurant} />
               </div>
         ))}

            {/* Only show these during pagination */}
            {loadingMore &&
               Array.from({ length: 5 }).map((_, index) => <RestaurantSkeleton key={`skeleton-${index}`} />)}
         </div>

         {hasMore && (
            <div ref={loaderRef} className="flex h-16 w-full items-center justify-center">
               {loadingMore && <p className="text-sm text-gray-500">Loading...</p>}
            </div>
         )}
      </>
   );
}
