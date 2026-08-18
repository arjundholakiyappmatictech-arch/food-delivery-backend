import SearchSkeleton from './SearchSkeleton';
import ExploreMenuSkeleton from './ExploreMenuSkeleton';
import FilterSkeleton from './FilterSkeleton';
import RestaurantSkeleton from './RestaurantSkeleton';

export default function HomePageSkeleton() {
   return (
      <main className="mx-auto -mt-15 w-full max-w-[1800px] px-[40px] max-[1200px]:px-[30px] max-[800px]:px-[20px] max-[560px]:px-[10px]">
         <SearchSkeleton />

         <ExploreMenuSkeleton />

         <div className="my-5">
            <FilterSkeleton />
         </div>

         <div className="my-[20px] grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-[20px] max-[1000px]:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] max-[1000px]:gap-[15px] max-[800px]:grid-cols-[repeat(auto-fill,minmax(32vw,1fr))] max-[800px]:gap-[1vw] max-[610px]:my-[5px] max-[560px]:grid-cols-2 max-[560px]:gap-[10px] max-[380px]:gap-[8px]">
            {Array.from({ length: 8 }).map((_, index) => (
               <RestaurantSkeleton key={index} />
            ))}
         </div>
      </main>
   );
}
