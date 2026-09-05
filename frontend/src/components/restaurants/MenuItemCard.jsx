'use client';

import useCartStore from '@/lib/store/cartStore';
import { useState } from 'react';
import ReplaceCartDialog from '../cart/ReplaceCartDialog';
import { toast } from 'react-hot-toast';
import { parseApiError } from '@/utils/apiError';

export default function MenuItemCard({ item, restaurant, isLast = false, restaurantClosed = false }) {
   const { cartItems, addItem, increaseQuantity, decreaseQuantity, clearCart } = useCartStore();

   const [showReplaceDialog, setShowReplaceDialog] = useState(false);
   const [pendingItem, setPendingItem] = useState(null);

   const cartItem = cartItems.find((cart) => cart.menu_item.id === item.id);

   const quantity = cartItem?.quantity ?? 0;

   const addToCartBtnStyles =
      'absolute left-[18px] bottom-[-3px] flex w-[120px] rounded-[0.2cm] bg-[#FFF] text-[20px] font-[700] tracking-[-0.5px] text-[#1BA672] shadow-[0px_5px_10px_#E9E9E9] max-[600px]:left-[2vw] max-[600px]:bottom-[-2.5vw] max-[600px]:w-[24vw] max-[600px]:text-[15px] max-[500px]:bottom-[-3.5vw]';

   const handleAddToCart = async () => {
      try {
         await addItem({
            restaurantId: restaurant.id,
            menuItemId: item.id,
         });
      } catch (error) {
         const apiError = parseApiError(error);

         // Prompt user before discarding existing items from a different restaurant
         if (apiError.status === 409 && apiError.message === 'Your cart contains items from another restaurant.') {
            setPendingItem({
               restaurantId: restaurant.id,
               menuItemId: item.id,
            });

            setShowReplaceDialog(true);

            return;
         }

         toast.error(apiError.message ?? 'Unable to add item to cart.');
      }
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
      <div className="menu-item-card">
         <div className="flex h-[150px] justify-between max-[600px]:h-[105px]">
            <div className="ml-[20px] flex w-[550px] flex-col justify-center max-[760px]:ml-[5px] max-[760px]:w-[70vw] max-[600px]:w-[65vw]">
               <h3 className="text-[20px] font-[700] leading-[1.3] text-[#02060CBF] max-[600px]:text-[17px]">
                  {item.name}
               </h3>

               <h4 className="mt-[8px] text-[17px] font-[600] text-[#02060CEB] max-[600px]:mt-[7px] max-[600px]:text-[15px]">
                  ₹{item.price}
               </h4>

               <span
                  className={`mt-[10px] inline-block text-[14px] font-[500] max-[600px]:mt-[8px] max-[600px]:text-[12px] ${
                     restaurantClosed
                        ? 'grayscale brightness-90'
                        : item.availability
                          ? 'text-[#1BA672]'
                          : 'text-red-500'
                  }`}
               >
                  {item.availability ? 'Available' : 'Not Available'}
               </span>
            </div>

            <div className="relative mr-[20px] flex flex-col max-[760px]:mr-[5px] max-[600px]:my-auto">
               <div className="h-[135px] w-[156px] max-[600px]:h-[100px] max-[600px]:w-[28vw]">
                  <img
                     src={item.image_url || '/assets/pizza.jpg'}
                     alt={item.name}
                     className={`h-full w-full overflow-hidden rounded-[0.3cm] object-cover ${restaurantClosed ? 'grayscale brightness-90' : ''}`}
                     draggable={false}
                  />
               </div>

               {restaurantClosed ? (
                  <div
                     className={`${addToCartBtnStyles} !text-[14px] cursor-not-allowed justify-center whitespace-nowrap bg-[#F2F2F2] py-[7px] font-[600] text-[#999] shadow-none max-[600px]:!text-[9px]`}
                  >
                     Restaurant Closed
                  </div>
               ) : !item.availability ? (
                  <div
                     className={`${addToCartBtnStyles} cursor-not-allowed justify-center bg-[#F2F2F2] py-[7px] text-[14px] text-[#999] shadow-none max-[600px]:text-[12px]`}
                  >
                     Unavailable
                  </div>
               ) : quantity === 0 ? (
                  <button
                     type="button"
                     onClick={handleAddToCart}
                     className={`${addToCartBtnStyles} cursor-pointer justify-center py-[7px] transition hover:bg-[#D9DADB]`}
                  >
                     ADD
                  </button>
               ) : (
                  <div className={`${addToCartBtnStyles} justify-between`}>
                     <button
                        type="button"
                        onClick={() => decreaseQuantity(cartItem)}
                        className="cursor-pointer rounded-l-[0.2cm] px-[15px] py-[7px] hover:bg-[#D9DADB] max-[600px]:px-[3vw]"
                     >
                        −
                     </button>

                     <div className="py-[7px]">
                        <span>{quantity}</span>
                     </div>

                     <button
                        type="button"
                        onClick={() => increaseQuantity(cartItem)}
                        className="cursor-pointer rounded-r-[0.2cm] px-[15px] py-[7px] hover:bg-[#D9DADB] max-[600px]:px-[3vw]"
                     >
                        +
                     </button>
                  </div>
               )}
            </div>
         </div>

         <ReplaceCartDialog
            open={showReplaceDialog}
            onClose={() => {
               setShowReplaceDialog(false);
               setPendingItem(null);
            }}
            onReplace={handleReplaceCart}
         />

         {!isLast && <hr className="border-1 border-[#E9E9E9] w-[97%] mx-[auto] mt-[30px] mb-[20px]" />}
      </div>
   );
}
