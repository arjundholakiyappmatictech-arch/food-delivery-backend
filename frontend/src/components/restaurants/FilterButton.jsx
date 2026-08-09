'use client';

import { FILTER_ICON } from '@/assets/icons';

export default function FilterButton({ filterId, restaurantFilters, setRestaurantFilters }) {
   const isAnyFilterActive = restaurantFilters.sortBy !== '' || restaurantFilters.openNow === true;

   const isCurrentFilterActive =
      filterId === 'sortBy'
         ? restaurantFilters.sortBy !== ''
         : filterId === 'nearest'
           ? restaurantFilters.sortBy === 'nearest'
           : filterId === 'openNow'
             ? restaurantFilters.openNow
             : filterId === 'aToZ'
               ? restaurantFilters.sortBy === 'a-z'
               : restaurantFilters.sortBy === 'z-a';

   const buttonClass = `
      min-w-[100px]
      rounded-[0.6cm]
      border
      px-[16px]
      py-[7px]
      text-[14px]
      font-[450]
      cursor-pointer
      transition

      ${isCurrentFilterActive ? 'border-[#3D4046] bg-[#F0F0F5]' : 'border-[#D9DADB] bg-white'}

      max-[610px]:px-[8px]
      max-[610px]:py-[4px]
      max-[610px]:text-[12px]
   `;

   const handleClick = () => {
      switch (filterId) {
         case 'nearest':
            setRestaurantFilters((prev) => ({
               ...prev,
               sortBy: prev.sortBy === 'nearest' ? '' : 'nearest',
            }));
            break;

         case 'openNow':
            setRestaurantFilters((prev) => ({
               ...prev,
               openNow: !prev.openNow,
            }));
            break;

         case 'aToZ':
            setRestaurantFilters((prev) => ({
               ...prev,
               sortBy: prev.sortBy === 'a-z' ? '' : 'a-z',
            }));
            break;

         case 'zToA':
            setRestaurantFilters((prev) => ({
               ...prev,
               sortBy: prev.sortBy === 'z-a' ? '' : 'z-a',
            }));
            break;
      }
   };

   const clearAllFilters = () => {
      setRestaurantFilters((prev) => ({
         ...prev,
         sortBy: '',
         openNow: false,
         menuId: null,
      }));
   };

   /*
    * Sort By
    */
   if (filterId === 'sortBy') {
      return (
         <div className="flex items-center gap-2">
            {/* Clear ALL filters icon */}
            {isAnyFilterActive && (
               <button
                  type="button"
                  onClick={clearAllFilters}
                  aria-label="Clear all filters"
                  className="
                     flex
                     h-[30px]
                     w-[30px]
                     cursor-pointer
                     items-center
                     justify-center
                     p-0
                     text-[#E56A77]
                     transition
                     hover:scale-110
                  "
               >
                  <span className="h-[22px] w-[22px]">{FILTER_ICON}</span>
               </button>
            )}

            <select
               className={`${buttonClass} outline-none`}
               value={restaurantFilters.sortBy}
               onChange={(e) =>
                  setRestaurantFilters((prev) => ({
                     ...prev,
                     sortBy: e.target.value,
                  }))
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

   return (
      <button type="button" className={`${buttonClass} flex items-center justify-center gap-1`} onClick={handleClick}>
         {filterId === 'nearest'
            ? 'Nearest ⚡'
            : filterId === 'openNow'
              ? 'Open Now 🟢'
              : filterId === 'aToZ'
                ? 'A-Z'
                : 'Z-A'}

         {/* Keep the cross */}
         {isCurrentFilterActive && <span className="text-[#A6A6A6]">✖</span>}
      </button>
   );
}
