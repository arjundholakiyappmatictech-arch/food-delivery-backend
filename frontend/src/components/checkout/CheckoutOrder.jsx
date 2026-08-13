'use client';

import { useRouter } from 'next/navigation';

import useCartStore from '@/lib/store/cartStore';

export default function CheckoutOrder({ cartItems }) {
   const router = useRouter();

   const increaseQuantity = useCartStore((state) => state.increaseQuantity);

   const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
   const restaurantId = cartItems[0]?.restaurant_id;

   return (
      <section className="min-w-0">
         <h2 className="mb-[12px] text-[20px] font-[600] text-[#02060C]">Your Order</h2>

         <div className="w-full min-w-0 overflow-hidden rounded-[0.1cm] border-2 border-[#E9E9E9] px-[20px]">
            {cartItems.map((cartItem, index) => {
               const item = cartItem.menu_item;

               const itemTotal = Number(item.price) * cartItem.quantity;

               return (
                  <div key={cartItem.id}>
                     <div className="flex min-w-0 items-center justify-between gap-[15px] py-[15px]">
                        {/* Item */}
                        <div className="flex min-w-0 flex-1 items-center gap-[15px]">
                           <img
                              src={item.image_url || '/assets/pizza.jpg'}
                              alt={item.name}
                              className="h-[80px] w-[90px] shrink-0 rounded-[0.2cm] object-cover"
                              draggable={false}
                           />

                           <div className="min-w-0">
                              <h3 className="truncate text-[16px] font-[600] text-[#02060C]">{item.name}</h3>

                              <p className="mt-[4px] text-[14px] text-[#02060CB3]">₹{Number(item.price).toFixed(2)}</p>

                              <p className="mt-[3px] text-[14px] font-[600] text-[#02060C]">₹{itemTotal.toFixed(2)}</p>
                           </div>
                        </div>

                        {/* Quantity */}
                        <div className="flex shrink-0 items-center overflow-hidden rounded-[0.15cm] border border-[#E9E9E9] bg-white">
                           <button
                              type="button"
                              onClick={() => decreaseQuantity(cartItem)}
                              className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center text-[18px] text-[#1BA672] hover:bg-[#F8F8F8]"
                           >
                              −
                           </button>

                           <span className="flex h-[34px] min-w-[36px] items-center justify-center border-x border-[#E9E9E9] text-[14px] font-[600] text-[#02060C]">
                              {cartItem.quantity}
                           </span>

                           <button
                              type="button"
                              onClick={() => increaseQuantity(cartItem)}
                              className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center text-[18px] text-[#1BA672] hover:bg-[#F8F8F8]"
                           >
                              +
                           </button>
                        </div>
                     </div>

                     {index !== cartItems.length - 1 && <hr className="border-[#E9E9E9]" />}
                  </div>
               );
            })}

            <button
               type="button"
               onClick={() => router.push(`/restaurants/${restaurantId}`)}
               className="my-[15px] cursor-pointer text-[15px] font-[600] text-[#E56A77] hover:text-[#D95765]"
            >
               + Add More Items
            </button>
         </div>
      </section>
   );
}
