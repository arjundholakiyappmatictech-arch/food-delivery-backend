'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import CheckoutAddress from './CheckoutAddress';
import CheckoutOrder from './CheckoutOrder';
import CheckoutInstructions from './CheckoutInstructions';
import CheckoutBill from './CheckoutBill';
import useOrder from '@/lib/hooks/useOrder';
import useCartStore from '@/lib/store/cartStore';
import useSelectedLocation from '@/lib/hooks/useSelectedLocation';

export default function CheckoutDetails() {
   const router = useRouter();

   const cartItems = useCartStore((state) => state.cartItems);
   const fetchCart = useCartStore((state) => state.fetchCart);

   const [cartLoading, setCartLoading] = useState(true);

   const { selectedLocation } = useSelectedLocation();

   const { placeOrder, loading, error } = useOrder();

   const [deliveryInstructions, setDeliveryInstructions] = useState('');

   // Fetch the cart when checkout loads.
   useEffect(() => {
      const loadCart = async () => {
         try {
            await fetchCart();
         } finally {
            setCartLoading(false);
         }
      };

      loadCart();
   }, [fetchCart]);

   // Redirect only AFTER the cart request has finished.
   useEffect(() => {
      if (cartLoading) {
         return;
      }

      if (cartItems.length === 0) {
         router.replace('/cart');
      }
   }, [cartLoading, cartItems.length, router]);

   const totalItems = cartItems.reduce((total, cartItem) => total + cartItem.quantity, 0);

   const itemTotal = cartItems.reduce(
      (total, cartItem) => total + Number(cartItem.menu_item.price) * cartItem.quantity,
      0,
   );

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

   // Don't render checkout while checking the backend cart.
   if (cartLoading) {
      return (
         <main className="mx-auto mt-2 flex min-h-[60vh] w-full max-w-[1800px] items-center justify-center px-[40px] max-[1200px]:px-[30px] max-[800px]:px-[20px] max-[560px]:px-[10px]">
            <p className="text-[15px] text-[#747474]">Loading checkout...</p>
         </main>
      );
   }

   // Cart is empty. Redirect effect will handle navigation.
   if (cartItems.length === 0) {
      return null;
   }

   return (
      <main className="mx-auto mt-2 box-border w-full max-w-[1800px] px-[40px] max-[1200px]:px-[30px] max-[800px]:px-[20px] max-[560px]:px-[10px]">
         <div className="mx-auto w-full max-w-[1400px]">
            <h1 className="my-[25px] text-center text-[28px] font-[600] text-[#02060C] max-[600px]:text-[24px]">
               Checkout
            </h1>

            <div className="grid w-full grid-cols-[minmax(0,1fr)_320px] items-start gap-[30px] max-[1000px]:grid-cols-[minmax(0,1fr)_280px] max-[1000px]:gap-[20px] max-[800px]:grid-cols-1 max-[800px]:gap-[25px]">
               {/* LEFT */}
               <section className="flex w-full min-w-0 flex-col gap-[25px]">
                  <CheckoutAddress selectedLocation={selectedLocation} />

                  <CheckoutOrder cartItems={cartItems} />

                  <CheckoutInstructions value={deliveryInstructions} onChange={setDeliveryInstructions} />
               </section>

               {/* RIGHT */}
               <aside className="w-full min-w-0">
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
