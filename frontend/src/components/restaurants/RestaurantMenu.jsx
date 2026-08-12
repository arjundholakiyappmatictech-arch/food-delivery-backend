'use client';

import { useState } from 'react';

import CategoryAccordion from './CategoryAccordion';

export default function RestaurantMenu({ menus, restaurant }) {
   const [activeIndex, setActiveIndex] = useState(0);

   return (
      <div className="category-items">
         {menus.map((menu, index) => (
            <CategoryAccordion
               key={menu.id}
               category={menu}
               restaurant={restaurant}
               index={index}
               activeIndex={activeIndex}
               setActiveIndex={setActiveIndex}
            />
         ))}
      </div>
   );
}
