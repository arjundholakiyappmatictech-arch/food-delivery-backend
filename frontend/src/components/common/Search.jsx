'use client';

import { SEARCH_ICON_URL, LOCATION_SVG } from '@/assets/icons';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function Search({ restaurantFilters, setRestaurantFilters, selectedLocation }) {
   const router = useRouter();
   const pathname = usePathname();
   const searchParams = useSearchParams();

   // search logic
   const handleSearchSubmit = () => {
      const params = new URLSearchParams(searchParams.toString());

      const search = restaurantFilters.searchText.trim();

      if (search) {
         params.set('search', search);
      } else {
         params.delete('search');
      }

      const query = params.toString();

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
      <div className="w-150 flex justify-between mx-auto my-[30px] border-1 border-[#BEBFC5] rounded-[0.1cm] max-[610px]:my-[15px] max-[410px]:w-[99%]">
         {/* Selected Location */}
         <div className="flex shrink-0 items-center gap-2 px-[10px]">
            {/* Location Icon */}
            <span className="h-[22px] w-[22px] shrink-0 text-[#E56A77]">{LOCATION_SVG}</span>

            {/* Selected Location */}
            <span className="max-w-[280px] truncate text-[18px] font-[500] text-[#5F5F5F]">
               <span className="capitalize font-[600] text-[#333]">{selectedLocation?.title}</span>
               <span className="mx-1 text-[#A6A6A6]">/</span>
               <span>{selectedLocation?.address}</span>
            </span>
         </div>

         {/* Divider */}
         <div className="mx-[8px] mt-0.5 h-[30px] w-[1px] shrink-0 bg-[#D9D9D9]" />

         {/* Search */}
         <div className="flex min-w-0 flex-1 items-center">
            <input
               className="w-full border-none py-[5px] pl-[10px] text-[18px] font-[500] outline-none placeholder:font-[400] placeholder:text-[#A6A6A6]"
               type="text"
               value={restaurantFilters.searchText}
               onChange={(e) =>
                  setRestaurantFilters((prev) => ({
                     ...prev,
                     searchText: e.target.value,
                  }))
               }
               onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                     handleSearchSubmit();
                  }
               }}
               placeholder="Search for restaurants"
            />

            {restaurantFilters.searchText === '' ? (
               <img
                  src={SEARCH_ICON_URL}
                  alt="search"
                  className="my-auto mx-[10px] h-[25px] w-[25px]"
                  draggable={false}
               />
            ) : (
               <button type="button" className="my-auto mx-[10px] cursor-pointer text-[20px]" onClick={clearSearch}>
                  ✖
               </button>
            )}
         </div>
      </div>
   );
}
