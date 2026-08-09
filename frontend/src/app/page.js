'use client';
import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import Search from '@/components/common/Search';
import RestaurantContainer from '@/components/restaurants/RestaurantContainer';

import useAuthGuard from '@/lib/hooks/useAuth';
import useRestaurants from '@/lib/hooks/useRestaurants';
import useSelectedLocation from '@/lib/hooks/useSelectedLocation';

import FilterButton from '@/components/restaurants/FilterButton';
import ExploreMenu from '@/components/restaurants/ExploreMenu';
import HomePageSkeleton from '@/components/skeletons/HomePageSkeleton';

export default function HomePage() {
   useAuthGuard();
   const router = useRouter();

   const { selectedLocation, initialized: locationInitialized } = useSelectedLocation();

   const defaultFilters = {
      searchText: '',
      sortBy: '',
      openNow: false,
      menuId: null,
   };

   const [restaurantFilters, setRestaurantFilters] = useState(defaultFilters);

   const { restaurants, menus, loading, loadingMore, searching, hasMore, error, retry, loadMore } = useRestaurants(
      selectedLocation,
      restaurantFilters,
   );

   useEffect(() => {
      if (locationInitialized && selectedLocation === null) {
         router.replace('/addresses');
      }
   }, [locationInitialized, selectedLocation, router]);

   /*
    * Initial page loading.
    *
    * Show the complete skeleton when:
    *
    * 1. Location has not been initialized yet
    * 2. The user has no selected location and is being redirected
    * 3. We have a selected location and the first restaurant
    *    request is still loading
    */
   const initialLoading =
      !locationInitialized || selectedLocation === null || (selectedLocation && loading && restaurants.length === 0);

   if (initialLoading) {
      return <HomePageSkeleton />;
   }

   return (
      <main
         className="
               mx-auto
               mt-2
               w-full
               max-w-[1800px]
               px-[40px]

               max-[1200px]:px-[30px]
               max-[800px]:px-[20px]
               max-[560px]:px-[10px]
            "
      >
         {/* Search */}
         <Search
            selectedLocation={selectedLocation}
            restaurantFilters={restaurantFilters}
            setRestaurantFilters={setRestaurantFilters}
         />

         {/* Explore Menu */}
         <ExploreMenu
            menus={menus}
            selectedMenuId={restaurantFilters.menuId}
            setSelectedMenuId={(menuId) => {
               setRestaurantFilters((prev) => ({
                  ...prev,
                  menuId: prev.menuId === menuId ? null : menuId,
               }));
            }}
         />

         {/* Filters */}
         <div className="my-5 flex flex-wrap items-center justify-center gap-2">
            <FilterButton
               filterId="sortBy"
               defaultFilters={defaultFilters}
               restaurantFilters={restaurantFilters}
               setRestaurantFilters={setRestaurantFilters}
            />

            <FilterButton
               filterId="nearest"
               defaultFilters={defaultFilters}
               restaurantFilters={restaurantFilters}
               setRestaurantFilters={setRestaurantFilters}
            />

            <FilterButton
               filterId="openNow"
               defaultFilters={defaultFilters}
               restaurantFilters={restaurantFilters}
               setRestaurantFilters={setRestaurantFilters}
            />

            <FilterButton
               filterId="aToZ"
               defaultFilters={defaultFilters}
               restaurantFilters={restaurantFilters}
               setRestaurantFilters={setRestaurantFilters}
            />

            <FilterButton
               filterId="zToA"
               defaultFilters={defaultFilters}
               restaurantFilters={restaurantFilters}
               setRestaurantFilters={setRestaurantFilters}
            />
         </div>

         {/* Restaurants */}
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
