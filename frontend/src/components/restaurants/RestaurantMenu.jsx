'use client';

import { useState } from 'react';

import CategoryAccordion from './CategoryAccordion';
import ReplaceCartDialog from '../cart/ReplaceCartDialog';
import useCartStore from '@/lib/store/cartStore';

export default function RestaurantMenu({ menus, restaurant }) {
   const [activeIndex, setActiveIndex] = useState(0);
   const [showReplaceDialog, setShowReplaceDialog] = useState(false);
   const [pendingItem, setPendingItem] = useState(null);

   const clearCart = useCartStore((state) => state.clearCart);
   const addItem = useCartStore((state) => state.addItem);

   const handleCartConflict = (item) => {
      setPendingItem(item);
      setShowReplaceDialog(true);
   };

   const handleReplaceCart = async () => {
      if (!pendingItem) {
         return;
      }

      try {
         await clearCart();

         await addItem({
            restaurantId: pendingItem.restaurantId,
            menuItemId: pendingItem.menuItemId,
         });

         setShowReplaceDialog(false);
         setPendingItem(null);
      } catch (error) {
         console.error('Unable to replace cart:', error);
      }
   };

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
               onCartConflict={handleCartConflict}
            />
         ))}

         <ReplaceCartDialog
            open={showReplaceDialog}
            onClose={() => {
               setShowReplaceDialog(false);
               setPendingItem(null);
            }}
            onReplace={handleReplaceCart}
         />
      </div>
   );
}
