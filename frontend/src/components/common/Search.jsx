'use client';

import { SEARCH_ICON_URL } from '@/assets/icons';

export default function Search({ restaurantFilters, setRestaurantFilters }) {
   return (
      <div className="search-bar w-[400px] flex justify-between mx-auto my-[30px] border border-[#BEBFC5] rounded-[0.1cm] max-[610px]:my-[15px] max-[410px]:w-[99%]">
         <input
            className="py-[5px] pl-[10px] text-[18px] font-[500] outline-none border-none placeholder:font-[400] placeholder:text-[#A6A6A6] w-full"
            type="text"
            value={restaurantFilters.searchText}
            onChange={(e) =>
               setRestaurantFilters((prev) => ({
                  ...prev,
                  searchText: e.target.value,
               }))
            }
            placeholder="Search for restaurants"
         />

         {restaurantFilters.searchText === '' ? (
            <img src={SEARCH_ICON_URL} alt="search" className="my-auto mx-[10px] h-[25px] w-[25px]" draggable={false} />
         ) : (
            <button
               type="button"
               className="my-auto mx-[10px] cursor-pointer text-[20px]"
               onClick={() =>
                  setRestaurantFilters((prev) => ({
                     ...prev,
                     searchText: '',
                  }))
               }
            >
               ✖
            </button>
         )}
      </div>
   );
}
