import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import getNearbyRestaurants from '@/services/restaurantService';
import { parseApiError } from '@/utils/apiError';

function hasValidLocation(location) {
   return Boolean(location?.addressId || (location?.latitude != null && location?.longitude != null));
}

function extractMenus(items) {
   return Array.from(
      new Map(
         items
            .flatMap((restaurant) => restaurant?.menus ?? [])
            .filter((menu) => menu?.name)
            .map((menu) => [menu.name.toLowerCase(), menu]),
      ).values(),
   );
}

export default function useRestaurants(
   selectedLocation,
   restaurantFilters,
   submittedSearch = '',
   submittedCategory = '',
) {
   const { sortBy = '', openNow = false } = restaurantFilters;

   const searchQuery = submittedSearch.trim();
   const categoryQuery = submittedCategory.trim();

   const locationReady = hasValidLocation(selectedLocation);

   const restaurantsQuery = useInfiniteQuery({
      queryKey: [
         'restaurants',
         {
            addressId: selectedLocation?.addressId,
            latitude: selectedLocation?.latitude,
            longitude: selectedLocation?.longitude,
            search: searchQuery,
            category: categoryQuery,
            sortBy,
            openNow,
         },
      ],

      queryFn: ({ pageParam = 1 }) =>
         getNearbyRestaurants({
            addressId: selectedLocation?.addressId,
            latitude: selectedLocation?.latitude,
            longitude: selectedLocation?.longitude,
            query: searchQuery,
            menuName: categoryQuery,
            sortBy,
            openNow,
            page: pageParam,
         }),

      initialPageParam: 1,

      getNextPageParam: (lastPage) => {
         if (!lastPage?.pagination?.has_more_pages) {
            return undefined;
         }

         return (lastPage.pagination.current_page ?? 1) + 1;
      },

      enabled: locationReady,
   });

   const restaurants = Array.from(
      new Map(
         (restaurantsQuery.data?.pages ?? [])
            .flatMap((page) => page?.data ?? [])
            .map((restaurant) => [restaurant.id, restaurant]),
      ).values(),
   );

   const menusQuery = useQuery({
      queryKey: [
         'restaurant-menus',
         {
            addressId: selectedLocation?.addressId,
            latitude: selectedLocation?.latitude,
            longitude: selectedLocation?.longitude,
         },
      ],

      queryFn: async () => {
         const response = await getNearbyRestaurants({
            addressId: selectedLocation?.addressId,
            latitude: selectedLocation?.latitude,
            longitude: selectedLocation?.longitude,
            query: '',
            menuName: '',
            sortBy: '',
            openNow: false,
            page: 1,
         });

         return extractMenus(response?.data ?? []);
      },

      enabled: locationReady,
   });

   const restaurantError = restaurantsQuery.error ? parseApiError(restaurantsQuery.error) : null;
   const menuError = menusQuery.error ? parseApiError(menusQuery.error) : null;

   return {
      restaurants,
      menus: menusQuery.data ?? [],
      loading: restaurantsQuery.isLoading || menusQuery.isLoading,
      searching: restaurantsQuery.isFetching && !restaurantsQuery.isFetchingNextPage,
      loadingMore: restaurantsQuery.isFetchingNextPage,
      hasMore: Boolean(restaurantsQuery.hasNextPage),
      error: restaurantError?.message ?? menuError?.message ?? '',
      loadMore: restaurantsQuery.fetchNextPage,
      retry: () => {
         restaurantsQuery.refetch();
         menusQuery.refetch();
      },
      fetching: restaurantsQuery.isFetching,
      isError: restaurantsQuery.isError || menusQuery.isError,
   };
}
