'use client';

import { DOWN_ARROW_SVG, UP_ARROW_SVG } from '@/assets/icons';

import MenuItemCard from './MenuItemCard';

export default function CategoryAccordion({ category, restaurant, index, activeIndex, setActiveIndex }) {
   const isOpen = activeIndex === index;

   const handleClick = () => {
      if (isOpen) {
         setActiveIndex(null);
      } else {
         setActiveIndex(index);
      }
   };

   return (
      <div className="mb-[30px] shadow-[0px_3px_3px_#EBEBEB] max-[820px]:mb-[20px]">
         <div
            onClick={handleClick}
            className="flex cursor-pointer justify-between p-[15px] text-[20px] font-[650] max-[600px]:text-[17px]"
         >
            <span>
               {category.name} ({category.menu_items.length})
            </span>

            {isOpen ? UP_ARROW_SVG : DOWN_ARROW_SVG}
         </div>

         {isOpen && (
            <div className="menu-items">
               {category.menu_items.length ? (
                  category.menu_items.map((item, index) => (
                     <MenuItemCard
                        key={item.id}
                        item={item}
                        restaurant={restaurant}
                        isLast={index === category.menu_items.length - 1}
                     />
                  ))
               ) : (
                  <div className="px-5 pb-5 text-sm text-gray-500">No items available.</div>
               )}
            </div>
         )}
      </div>
   );
}
