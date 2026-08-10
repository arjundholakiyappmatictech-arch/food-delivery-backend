'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import useCartStore from '@/lib/store/cartStore';
import useOrder from '@/lib/hooks/useOrder';

import CheckoutOrder from './CheckoutOrder';
import CheckoutBill from './CheckoutBill';

import { LOCATION_SVG } from '@/assets/icons';
import useSelectedLocation from '@/lib/hooks/useSelectedLocation';

export default function CheckoutDetails() {
   const router = useRouter();

   const cartItems = useCartStore((state) => state.cartItems);

   const { selectedLocation } = useSelectedLocation();

   const { placeOrder, loading, error } = useOrder();

   const [deliveryInstructions, setDeliveryInstructions] = useState('');

   const totalItems = cartItems.reduce((total, cartItem) => {
      return total + cartItem.quantity;
   }, 0);

   const itemTotal = cartItems.reduce((total, cartItem) => {
      return total + Number(cartItem.menu_item.price) * cartItem.quantity;
   }, 0);

   const deliveryFee = 40;

   const totalPrice = itemTotal + deliveryFee;

   const handlePlaceOrder = async () => {
      if (!selectedLocation?.addressId) {
         return;
      }

      const orderData = {
         address_id: selectedLocation.addressId,
         delivery_instructions: deliveryInstructions.trim() || null,
      };

      try {
         const response = await placeOrder(orderData);

         if (!response) {
            return;
         }

         const order = response.data;

         router.push(`/payment/${order.id}`);
      } catch {
         // Error is already handled by useOrder.
      }
   };

   return (
      <main className="mx-auto mt-2 box-border w-full max-w-[1800px] px-[40px] max-[1200px]:px-[30px] max-[800px]:px-[20px] max-[560px]:px-[10px]">
         <div className="w-full max-w-[1400px] mx-auto">
            <h1 className="my-[25px] text-[28px] font-[600] text-[#02060C] max-[600px]:text-[24px] text-center">
               Checkout
            </h1>

            <div className="grid w-full grid-cols-[minmax(0,1fr)_320px] items-start gap-[30px] max-[1000px]:grid-cols-[minmax(0,1fr)_280px] max-[1000px]:gap-[20px] max-[800px]:grid-cols-1 max-[800px]:gap-[25px]">
               {/* LEFT */}
               <section className="flex min-w-0 w-full flex-col gap-[25px]">
                  {/* Delivery Address */}
                  <section className="w-full ">
                     <h2 className="mb-[10px] text-[20px] font-[600] text-[#02060C]">Delivery Address</h2>

                     <div className="flex w-full min-w-0 items-center gap-[12px] rounded-[0.1cm] border-2 border-[#E9E9E9] px-[16px] py-[14px]">
                        <div className="flex h-[36px] w-[38px] shrink-0 items-center justify-center">
                           <span className="text-[#E56A77]">{LOCATION_SVG}</span>
                        </div>

                        <div className="min-w-0">
                           <h3 className="text-[16px] font-[600] capitalize leading-[20px] text-[#02060C]">
                              {selectedLocation?.title}
                           </h3>

                           <p className="mt-[3px] break-words text-[14px] leading-[19px] text-[#02060CB3]">
                              {selectedLocation?.address}
                           </p>
                        </div>
                     </div>
                  </section>

                  <CheckoutOrder cartItems={cartItems} />

                  {/* Delivery Instructions */}
                  <section className="w-full">
                     <h2 className="mb-[12px] text-[20px] font-[600] text-[#02060C]">Delivery Instructions</h2>

                     <textarea
                        value={deliveryInstructions}
                        onChange={(event) => setDeliveryInstructions(event.target.value)}
                        placeholder="Add instructions for delivery..."
                        className="box-border min-h-[100px] w-full resize-none rounded-[0.1cm] border-2 border-[#E9E9E9] p-[12px] text-[15px] outline-none focus:border-[#E56A77]"
                     />
                  </section>
               </section>

               {/* RIGHT */}
               <aside className="flex min-w-0 w-full flex-col gap-[25px]">
                  <section className="w-full min-w-0 rounded-[0.1cm] border-2 border-[#E9E9E9] p-[20px]">
                     <h2 className="mb-[15px] text-[20px] font-[600] text-[#02060C]">Order Summary</h2>

                     {cartItems.map((cartItem) => {
                        const item = cartItem.menu_item;
                        const currentItemTotal = Number(item.price) * cartItem.quantity;

                        return (
                           <div key={cartItem.id} className="flex min-w-0 justify-between gap-[10px] py-[8px]">
                              <div className="min-w-0 flex-1">
                                 <p className="truncate text-[14px] font-[500] text-[#02060C]">{item.name}</p>

                                 <p className="text-[13px] text-[#02060CB3]">
                                    ₹{item.price} × {cartItem.quantity}
                                 </p>
                              </div>

                              <span className="shrink-0 text-[14px] font-[600] text-[#02060C]">
                                 ₹{currentItemTotal.toFixed(2)}
                              </span>
                           </div>
                        );
                     })}
                  </section>

                  <CheckoutBill
                     totalItems={totalItems}
                     itemTotal={itemTotal}
                     deliveryFee={deliveryFee}
                     totalPrice={totalPrice}
                     loading={loading}
                     error={error}
                     onPlaceOrder={handlePlaceOrder}
                  />
               </aside>
            </div>
         </div>
      </main>
   );
}
