/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { SEARCH_ICON_URL, LOCATION_SVG } from '@/assets/icons';
import { ChevronDown } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Search({ restaurantFilters, setRestaurantFilters, selectedLocation, restaurants = [] }) {
   const router = useRouter();
   const pathname = usePathname();
   const searchParams = useSearchParams();

   /* component to url */
   console.log('step 10', pathname, searchParams); // read pathname + search values

   const [suggestionIndex, setSuggestionIndex] = useState(0);

   const menuNames = Array.from(
      new Set(
         restaurants
            .flatMap((restaurant) => restaurant?.menus ?? [])
            .map((menu) => menu?.name?.trim())
            .filter(Boolean),
      ),
   );

   useEffect(() => {
      setSuggestionIndex(0);
   }, [menuNames.length]);

   useEffect(() => {
      if (menuNames.length <= 1) {
         return;
      }

      const interval = setInterval(() => {
         setSuggestionIndex((prev) => (prev + 1) % menuNames.length);
      }, 3000);

      return () => clearInterval(interval);
   }, [menuNames.length]);

   const animatedName = menuNames[suggestionIndex] || 'food';

   const displayName = animatedName.length > 22 ? `${animatedName.slice(0, 22)}...` : animatedName;

   const handleSearchSubmit = () => {
      const params = new URLSearchParams(searchParams.toString());
      console.log('step 13', params); // convert readable url into writable

      const search = restaurantFilters.searchText.trim();
      console.log('step 14', search); // extract text from restaurant filter

      if (search) {
         params.set('search', search);
      } else {
         params.delete('search');
      }

      const query = params.toString();
      console.log('step 15', query);

      /* step 16 pass through the route and repeat the same process */
      router.push(query ? `${pathname}?${query}` : pathname);
   };

   const clearSearch = () => {
      setRestaurantFilters((prev) => ({
         ...prev,
         searchText: '',
      }));

      const params = new URLSearchParams(searchParams.toString());
      params.delete('search');

      const query = params.toString();

      router.push(query ? `${pathname}?${query}` : pathname);
   };

   return (
      <div className="mx-auto my-[30px] flex w-[600px] justify-between rounded-[0.1cm] border border-[#BEBFC5] max-[610px]:my-[15px] max-[610px]:w-full">
         {/* Selected Location */}
         <div
            className="flex min-w-0 shrink-0 cursor-pointer items-center gap-1.5 px-[10px] transition-opacity hover:opacity-85 max-[500px]:px-[6px]"
            onClick={() => router.push('/addresses/select')}
         >
            <span className="flex size-5 shrink-0 items-center justify-center text-[#E56A77] max-[500px]:size-[18px]">
               {LOCATION_SVG}
            </span>

            <span className="min-w-0 max-w-[260px] truncate text-[16px] font-[500] text-[#5F5F5F] max-[610px]:max-w-[150px] max-[610px]:text-[14px] max-[480px]:max-w-[115px] max-[380px]:max-w-[90px] max-[340px]:max-w-[75px]">
               <span className="capitalize font-[600] text-[#333]">{selectedLocation?.title}</span>

               {selectedLocation?.address && (
                  <>
                     <span className="mx-1 text-[#A6A6A6]">/</span>
                     <span>{selectedLocation.address}</span>
                  </>
               )}
            </span>

            <ChevronDown className="size-4 shrink-0 text-[#595959] max-[500px]:size-3.5" />
         </div>

         {/* Divider */}
         <div className="mx-[8px] mt-0.5 h-[30px] w-px shrink-0 bg-[#D9D9D9] max-[500px]:mx-[4px]" />

         {/* Search */}
         <div className="group relative  flex min-w-0 flex-1 items-center overflow-hidden">
            {!restaurantFilters.searchText && (
               <>
                  {/* Animated Placeholder */}
                  <div className="pointer-events-none absolute inset-0 flex items-center overflow-hidden group-focus-within:hidden">
                     <span
                        key={animatedName}
                        className="animate-search-placeholder   truncate text-[18px] font-[400] text-[#A6A6A6] max-[610px]:text-[15px] max-[410px]:text-[13.5px] max-[360px]:text-[12.5px]"
                     >
                        Search for&nbsp; &quot;{displayName}&quot;
                     </span>
                  </div>

                  {/* Static Placeholder */}
                  <span className="pointer-events-none absolute left-[10px] hidden text-[18px] font-[400] text-[#A6A6A6] group-focus-within:block max-[610px]:text-[15px] max-[500px]:left-[5px] max-[410px]:text-[13.5px] max-[360px]:text-[12.5px]">
                     Restaurant name or dish..
                  </span>
               </>
            )}

            {/* step 6 gets value of from the props */}
            <input
               className="relative z-10 w-full min-w-0 border-none bg-transparent py-[5px] pl-[10px] pr-[45px] text-[18px] font-[500] outline-none placeholder:text-transparent max-[610px]:text-[15px] max-[500px]:pl-[5px] max-[410px]:text-[13.5px] max-[360px]:text-[12.5px]"
               type="text"
               enterKeyHint="search"
               value={restaurantFilters.searchText || ''}
               /* step 11 also change this value when user types */
               onChange={(e) =>
                  setRestaurantFilters((prev) => ({
                     ...prev,
                     searchText: e.target.value,
                  }))
               }
               /* step 12 handleSearchSubmit call */
               onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                     handleSearchSubmit();
                  }
               }}
            />

            {/* Search / Clear Action */}
            {restaurantFilters.searchText ? (
               <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-2 z-20 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-[16px] text-[#777] transition-colors hover:bg-[#F5F5F5] hover:text-[#D95765] max-[500px]:right-1"
               >
                  ✕
               </button>
            ) : (
               <img
                  src={SEARCH_ICON_URL}
                  alt="Search"
                  className="absolute right-2 z-20 size-[18px] shrink-0 max-[500px]:right-1 max-[500px]:size-5"
                  draggable={false}
               />
            )}
         </div>
      </div>
   );
}
