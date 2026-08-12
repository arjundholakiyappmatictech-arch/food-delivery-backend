'use client';

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import useCartStore from '@/lib/store/cartStore';

export default function FloatingCart() {
   const router = useRouter();
   const pathname = usePathname();

   const cartItems = useCartStore((state) => state.cartItems);

   const isCheckoutPage = pathname.startsWith('/checkout');

   const totalItems = useMemo(() => {
      return cartItems.reduce((total, item) => total + item.quantity, 0);
   }, [cartItems]);

   // Don't show FloatingCart on checkout
   if (isCheckoutPage || cartItems.length === 0) {
      return null;
   }

   const handleContinue = () => {
      router.push('/checkout');
   };

   return (
      <div className="fixed bottom-5 left-1/2 z-[100] w-[min(680px,calc(100%-30px))] -translate-x-1/2">
         <div className="flex items-center gap-4 rounded-2xl border border-[#E9E9E9] bg-white px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            {/* Item Images */}
            <div className="flex shrink-0 items-center">
               {cartItems.slice(0, 3).map((cartItem, index) => (
                  <img
                     key={cartItem.id}
                     src={cartItem.menu_item.image_url || '/assets/pizza.jpg'}
                     alt={cartItem.menu_item.name}
                     className={`h-11 w-11 rounded-full border-2 border-white object-cover ${
                        index !== 0 ? '-ml-3' : ''
                     }`}
                  />
               ))}

               {cartItems.length > 3 && (
                  <div className="-ml-3 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-[#F8F8F8] text-xs font-semibold text-[#3D4152]">
                     +{cartItems.length - 3}
                  </div>
               )}
            </div>

            {/* Cart Information */}
            <div className="min-w-0 flex-1">
               <p className="text-[15px] font-semibold text-[#02060C]">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
               </p>

               <div className="mt-0.5 flex max-w-full gap-2 overflow-hidden whitespace-nowrap text-[13px] text-[#747474]">
                  {cartItems.map((cartItem, index) => (
                     <span key={cartItem.id} className="shrink-0">
                        {cartItem.menu_item.name} × {cartItem.quantity}
                        {index !== cartItems.length - 1 && ' ·'}
                     </span>
                  ))}
               </div>
            </div>

            {/* Continue */}
            <button
               type="button"
               onClick={handleContinue}
               className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-[#E56A77] px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#D95765] active:scale-[0.98]"
            >
               Continue
               <span className="text-[17px]">→</span>
            </button>
         </div>
      </div>
   );
}
