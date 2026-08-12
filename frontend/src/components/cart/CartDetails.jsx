'use client';

import { useRouter } from 'next/navigation';

import useCartStore from '@/lib/store/cartStore';
import MenuItemCard from '../restaurants/MenuItemCard';
import { CHECKOUT_ICON } from '@/assets/icons';

export default function CartDetails() {
   const router = useRouter();

   const cartItems = useCartStore((state) => state.cartItems);
   const clearCart = useCartStore((state) => state.clearCart);

   const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

   const itemSubtotal = cartItems.reduce((total, item) => total + Number(item.menu_item.price) * item.quantity, 0);

   const deliveryFee = 40;

   const total = itemSubtotal + deliveryFee;

   const handleCheckout = () => {
      router.push('/checkout');
   };

   if (cartItems.length === 0) {
      return (
         <main className="flex h-[75vh] items-center justify-center">
            <div className="flex flex-col items-center text-center">
               <h1 className="pb-[10px] text-[30px] font-[600] text-[#02060CCC] max-[600px]:text-[20px]">
                  Your cart is empty
               </h1>

               <h2 className="text-[20px] font-[500] text-[#02060C] max-[600px]:text-[15px]">
                  Looks like you haven&apos;t made your choice yet...
               </h2>
            </div>
         </main>
      );
   }

   const billRowStyles = 'flex justify-between text-[18px] font-[500] text-[#02060CB3] max-[600px]:text-[15px]';

   return (
      <main className="mt-[20px] flex justify-evenly max-[1000px]:mt-[10px] max-[1000px]:flex-col max-[1000px]:items-center">
         {/* Cart */}
         <section className="w-[800px] max-[820px]:w-[98%]">
            {/* Header */}
            <div className="relative mb-[25px] flex justify-center">
               <h1 className="text-[30px] font-[500] max-[600px]:text-[20px]">Cart</h1>

               <button
                  type="button"
                  onClick={clearCart}
                  className="
                     absolute
                     right-[5%]
                     cursor-pointer
                     rounded-[0.1cm]
                     border
                     border-[#E9E9E9]
                     bg-[#FFF]
                     p-[10px]
                     text-[20px]
                     font-[500]
                     transition
                     hover:bg-[#F2F2F2]
                     max-[600px]:p-[5px]
                     max-[600px]:text-[15px]
                  "
               >
                  Clear Cart
               </button>
            </div>

            {/* Cart Items */}
            <div className="cart-items">
               {cartItems.map((cartItem, index) => (
                  <MenuItemCard
                     key={cartItem.id}
                     item={cartItem.menu_item}
                     restaurant={cartItem.restaurant}
                     isLast={index === cartItems.length - 1}
                  />
               ))}
            </div>
         </section>

         {/* Bill */}
         <section
            className="
               w-[300px]
               min-[1000px]:mr-[20px]
               max-[1000px]:mt-[20px]
               max-[1000px]:w-[760px]
               max-[820px]:w-[95%]
            "
         >
            <h1 className="mb-[10px] text-[20px] font-[600] text-[#02060C]">Bill Details</h1>

            {/* Item Total */}
            <div className={`${billRowStyles} mb-[5px]`}>
               <span>Items</span>
               <span>{totalItems}</span>
            </div>

            {/* Item Total */}
            <div className={`${billRowStyles} mb-[5px]`}>
               <span>Item Subtotal</span>

               <span>₹{itemSubtotal.toFixed(2)}</span>
            </div>

            <hr className="my-[30px] w-full border-[#E5E6E6] max-[600px]:my-[15px]" />

            {/* Delivery Fee */}
            <div className={billRowStyles}>
               <span>Delivery Fee</span>

               <span>₹{deliveryFee.toFixed(2)}</span>
            </div>

            <hr className="my-[30px] w-full border-[#02060C] max-[600px]:my-[15px]" />

            {/* Total */}
            <div className="flex justify-between text-[18px] font-[700] text-[#02060C]">
               <span>To Pay</span>

               <span>₹{total.toFixed(2)}</span>
            </div>
            <button
               className="my-[30px] flex w-full cursor-pointer items-center justify-center rounded-[0.1cm] bg-[#E56A77] py-[10px] text-white transition-colors duration-200 md:hover:bg-[#D95765]"
               onClick={handleCheckout}
            >
               <span className="text-[20px] font-[500] max-[600px]:text-[15px]">CHECKOUT</span>

               <span className="ml-[5px] flex h-[30px] w-[30px] items-center justify-center max-[600px]:h-[20px] max-[600px]:w-[20px]">
                  {CHECKOUT_ICON}
               </span>
            </button>
         </section>
      </main>
   );
}
