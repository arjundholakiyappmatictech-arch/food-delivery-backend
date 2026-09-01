'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import Search from '@/components/common/Search';
import RestaurantContainer from '@/components/restaurants/RestaurantContainer';
import FilterButton from '@/components/restaurants/FilterButton';
import ExploreMenu from '@/components/restaurants/ExploreMenu';
import HomePageSkeleton from '@/components/skeletons/HomePageSkeleton';

import useAuthGuard from '@/lib/hooks/useAuth';
import useRestaurants from '@/lib/hooks/useRestaurants';
import useLocationStore from '@/lib/store/locationStore';

function HomePageContent() {
   useAuthGuard();

   const router = useRouter();
   const searchParams = useSearchParams();

   const submittedSearch = searchParams.get('search') || '';
   const submittedCategory = searchParams.get('category') || '';
   const submittedSort = searchParams.get('sort') || '';
   const submittedOpenNow = searchParams.get('openNow') === 'true';

   const selectedLocation = useLocationStore((state) => state.selectedLocation);
   const locationInitialized = useLocationStore((state) => state.hasHydrated);

   const [restaurantFilters, setRestaurantFilters] = useState({
      searchText: submittedSearch,
      sortBy: submittedSort,
      openNow: submittedOpenNow,
      menuName: submittedCategory || null,
   });

   useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRestaurantFilters({
         searchText: submittedSearch,
         sortBy: submittedSort,
         openNow: submittedOpenNow,
         menuName: submittedCategory || null,
      });
   }, [submittedSearch, submittedCategory, submittedSort, submittedOpenNow]);

   const { restaurants, menus, loading, loadingMore, searching, hasMore, error, retry, loadMore } = useRestaurants(
      selectedLocation,
      restaurantFilters,
      submittedSearch,
      submittedCategory,
   );

   useEffect(() => {
      if (locationInitialized && selectedLocation === null) {
         router.replace('/addresses/select');
      }
   }, [locationInitialized, selectedLocation, router]);

   const initialLoading =
      !locationInitialized || selectedLocation === null || (selectedLocation && loading && restaurants.length === 0);

   if (initialLoading) {
      return <HomePageSkeleton />;
   }

   return (
      <main className="mx-auto mt-2 w-full max-w-[1800px] px-[60px] max-[1200px]:px-[40px] max-[800px]:px-[25px] max-[560px]:px-[15px] max-[380px]:px-[10px]">
         <Search
            selectedLocation={selectedLocation}
            restaurantFilters={restaurantFilters}
            setRestaurantFilters={setRestaurantFilters}
            restaurants={restaurants}
         />

         <ExploreMenu
            menus={menus}
            selectedMenuName={restaurantFilters.menuName}
            setSelectedMenuName={(menuName) => {
               setRestaurantFilters((prev) => ({
                  ...prev,
                  menuName,
               }));
            }}
         />

         <div className="my-5 flex flex-wrap items-center justify-center gap-2">
            {['sortBy', 'nearest', 'openNow', 'aToZ', 'zToA'].map((filterId) => (
               <FilterButton
                  key={filterId}
                  filterId={filterId}
                  restaurantFilters={restaurantFilters}
                  setRestaurantFilters={setRestaurantFilters}
               />
            ))}
         </div>

         <RestaurantContainer
            restaurantsList={restaurants}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            loadMore={loadMore}
            searching={searching}
            error={error}
            onRetry={retry}
         />
      </main>
   );
}

export default function HomePage() {
   return (
      <Suspense fallback={<HomePageSkeleton />}>
         <HomePageContent />
      </Suspense>
   );
}
