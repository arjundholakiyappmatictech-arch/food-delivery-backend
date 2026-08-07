'use client';

import useCartStore from '@/lib/store/cartStore';
import MenuItemCard from '../restaurants/MenuItemCard';

export default function CartPage() {
   const cartItems = useCartStore((state) => state.cartItems);

   if (cartItems.length === 0) {
      return (
         <div className="flex h-[75vh] items-center justify-center">
            <h1 className="text-3xl font-semibold text-gray-500">Your cart is empty</h1>
         </div>
      );
   }

   return (
      <main className="mx-auto mt-6 flex max-w-7xl justify-between gap-8 px-6 max-[1000px]:flex-col">
         <section className="flex-1 rounded-xl bg-white">
            <div className="relative flex justify-center mb-[25px]">
               <h1 className="text-[30px] font-[500] max-[600px]:text-[20px]">Cart</h1>
               <button className="absolute right-[5%] p-[10px] text-[20px] font-[500] bg-[#FFF] border-1 border-[#E9E9E9] rounded-[0.1cm] cursor-pointer md:hover:bg-[#F2F2F2] md:hover:border-none max-[600px]:text-[15px] max-[600px]:p-[5px]">
                  Clear Cart
               </button>
            </div>

            {cartItems.map((cartItem, index) => (
               <MenuItemCard key={cartItem.id} item={cartItem.menu_item} isLast={index === cartItems.length - 1} />
            ))}
         </section>
      </main>
   );
}
