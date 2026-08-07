/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState } from 'react';

export default function FilterButton({ filterId, defaultFilters, restaurantFilters, setRestaurantFilters }) {
   const [active, setActive] = useState(false);

   useEffect(() => {
      if (filterId === 'sortBy') {
         setActive(restaurantFilters.sortBy !== '');
      } else if (filterId === 'nearest') {
         setActive(restaurantFilters.sortBy === 'nearest');
      } else if (filterId === 'openNow') {
         setActive(restaurantFilters.openNow);
      } else if (filterId === 'aToZ') {
         setActive(restaurantFilters.sortBy === 'a-z');
      } else if (filterId === 'zToA') {
         setActive(restaurantFilters.sortBy === 'z-a');
      }
   }, [restaurantFilters, defaultFilters, filterId]);

   const buttonClass = `
      min-w-[100px]
      px-[16px]
      py-[7px]
      text-[14px]
      font-[450]
      border
      rounded-[0.6cm]
      cursor-pointer
      transition
      ${active ? 'bg-[#F0F0F5] border-[#3D4046]' : 'bg-white border-[#D9DADB]'}
      max-[610px]:text-[12px]
      max-[610px]:px-[8px]
      max-[610px]:py-[4px]
   `;

   if (filterId === 'sortBy') {
      return (
         <div className="inline-block">
            <select
               className={`${buttonClass} py-[7px] outline-none max-[610px]:py-[5px]`}
               value={restaurantFilters.sortBy}
               onChange={(e) =>
                  setRestaurantFilters({
                     ...restaurantFilters,
                     sortBy: e.target.value,
                  })
               }
            >
               <option value="">Sort By</option>
               <option value="nearest">Nearest</option>
               <option value="a-z">A-Z</option>
               <option value="z-a">Z-A</option>
            </select>
         </div>
      );
   }

   const handleClick = () => {
      switch (filterId) {
         case 'nearest':
            setRestaurantFilters({
               ...restaurantFilters,
               sortBy: restaurantFilters.sortBy === 'nearest' ? '' : 'nearest',
            });
            break;

         case 'openNow':
            setRestaurantFilters({
               ...restaurantFilters,
               openNow: !restaurantFilters.openNow,
            });
            break;

         case 'aToZ':
            setRestaurantFilters({
               ...restaurantFilters,
               sortBy: restaurantFilters.sortBy === 'a-z' ? '' : 'a-z',
            });
            break;

         case 'zToA':
            setRestaurantFilters({
               ...restaurantFilters,
               sortBy: restaurantFilters.sortBy === 'z-a' ? '' : 'z-a',
            });
            break;
      }
   };

   return (
      <div className="ml-[10px] flex items-center">
         <button className={`${buttonClass} flex items-center justify-center gap-1`} onClick={handleClick}>
            {filterId === 'nearest'
               ? 'Nearest ⚡'
               : filterId === 'openNow'
                 ? 'Open Now 🟢'
                 : filterId === 'aToZ'
                   ? 'A-Z'
                   : 'Z-A'}

            {active && <span className="text-[#A6A6A6]">✖</span>}
         </button>
      </div>
   );
}
