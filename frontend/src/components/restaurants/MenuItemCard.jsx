/* eslint-disable @next/next/no-img-element */
'use client';

import useCartStore from '@/lib/store/cartStore';

export default function MenuItemCard({ item, isLast }) {
   const { cartItems, addItem, increaseQuantity, decreaseQuantity } = useCartStore();

   const cartItem = cartItems.find((cart) => cart.menu_item.id === item.id);

   const quantity = cartItem?.quantity ?? 0;

   const addToCartBtnStyles =
      'absolute bottom-[-10px] left-1/2 flex w-[110px] -translate-x-1/2 rounded-[0.2cm] bg-white text-[18px] font-[700] text-[#1BA672] shadow-[0px_4px_10px_#E9E9E9]';

   return (
      <div className="menu-item-card py-4 px-5">
         <div className="flex items-center justify-between">
            {/* Left */}

            <div className="flex-1 pr-4">
               <h3 className="text-[17px] font-[700] text-[#02060CBF]">{item.name}</h3>

               <h4 className="mt-1 text-[15px] font-[600]">₹{item.price}</h4>

               <span
                  className={`mt-2 inline-block rounded-full px-2 py-1 text-[11px] font-semibold ${
                     item.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
               >
                  {item.availability ? 'Available' : 'Not Available'}
               </span>
            </div>

            {/* Right */}

            <div className="relative">
               <img
                  src={item.image_url || '/assets/pizza.jpg'}
                  alt={item.name}
                  className="h-[110px] w-[120px] rounded-[0.3cm] object-cover"
                  draggable={false}
               />

               {!item.availability ? (
                  <div
                     className={`${addToCartBtnStyles} cursor-not-allowed justify-center bg-gray-200 py-2 text-[14px] text-gray-500 shadow-none`}
                  >
                     Unavailable
                  </div>
               ) : quantity === 0 ? (
                  <button
                     onClick={() => addItem(item.id)}
                     className={`${addToCartBtnStyles} justify-center py-2 transition hover:bg-[#D9DADB]`}
                  >
                     ADD
                  </button>
               ) : (
                  <div className={`${addToCartBtnStyles} justify-between`}>
                     <button onClick={() => decreaseQuantity(cartItem)} className="px-4 py-2 hover:bg-[#D9DADB]">
                        −
                     </button>

                     <span className="py-2">{quantity}</span>

                     <button onClick={() => increaseQuantity(cartItem)} className="px-4 py-2 hover:bg-[#D9DADB]">
                        +
                     </button>
                  </div>
               )}
            </div>
         </div>

         {!isLast ? <hr className="mx-auto mt-5 w-[97%] border-[#E9E9E9]" /> : <div className="h-4" />}
      </div>
   );
}
