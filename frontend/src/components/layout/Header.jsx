/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { CART_SVG, HOME_SVG, SHOPPING_BAG_SVG, INFO_SVG } from '@/assets/icons';
import useCartStore from '@/lib/store/cartStore';
import { useEffect } from 'react';
import UserProfile from './UserProfile';

export default function Header() {
   const pathname = usePathname();

   const cartItems = useCartStore((state) => state.cartItems);
   const fetchCart = useCartStore((state) => state.fetchCart);

   useEffect(() => {
      const token = localStorage.getItem('access_token');

      if (!token) {
         return;
      }

      fetchCart();
   }, [fetchCart]);

   const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

   const navItemStyles =
      'text-[20px] font-[500] mx-[30px] my-auto max-[900px]:text-[16px] max-[900px]:mx-[15px] max-[480px]:mx-[10px] max-[425px]:mx-[5px]';

   const getActiveClass = (href) => {
      const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

      return isActive ? 'text-[#E56A77]' : 'text-[#595959] md:hover:text-[#E56A77] transition';
   };

   return (
      <div className="header fixed top-0 left-0 right-0 h-[75px] bg-[#FFF] z-50 flex justify-between shadow-[0_15px_40px_-20px_#282C3F26] max-[610px]:h-[60px]">
         {/* Logo */}
         <div className="mx-auto flex h-full w-full max-w-[1800px] items-center px-[60px] max-[1200px]:px-[40px] max-[800px]:px-[25px] max-[560px]:px-[15px]">
            <div className="app-logo flex w-2/15 shrink-0 items-center justify-start">
               <Link href="/" className="flex items-center">
                  <img
                     src="/assets/logo.png"
                     alt="Tomato"
                     className="h-[70px] w-auto object-contain transition-transform duration-200 max-[610px]:h-[55px]"
                     draggable={false}
                  />
               </Link>
            </div>

            {/* Navigation */}

            <div className="nav-items w-11/15 flex justify-center items-center">
               <ul className="flex">
                  <li className={navItemStyles}>
                     <Link href="/" className={getActiveClass('/')}>
                        <div className="flex">
                           <div className="w-[25px] h-[26px] max-[900px]:w-[20px] max-[900px]:h-[22px] max-[610px]:hidden">
                              {HOME_SVG}
                           </div>
                           &nbsp;
                           <h1>Home</h1>
                        </div>
                     </Link>
                  </li>

                  <li className={navItemStyles}>
                     <Link href="/about" className={getActiveClass('/about')}>
                        <div className="flex">
                           <div className="w-[25px] h-[28px] max-[900px]:w-[20px] max-[900px]:h-[23px] max-[610px]:hidden">
                              {INFO_SVG}
                           </div>
                           &nbsp;
                           <h1>About Us</h1>
                        </div>
                     </Link>
                  </li>

                  <li className={navItemStyles}>
                     <Link href="/cart" className={getActiveClass('/cart')}>
                        <div className="flex max-[610px]:hidden">
                           <div className="relative w-[30px] h-[30px] max-[900px]:w-[25px] max-[900px]:h-[25px]">
                              {CART_SVG}

                              <h1 className="absolute text-[12px] left-[9px] top-[5px] max-[900px]:text-[10px] max-[900px]:left-[7px] max-[900px]:top-[4px]">
                                 {cartCount}
                              </h1>
                           </div>
                           &nbsp;
                           <h1 className="my-auto">Cart</h1>
                        </div>
                     </Link>
                  </li>
               </ul>
            </div>

            {/* User */}

            <div className="login-btn flex w-2/15 shrink-0 items-center justify-end">
               <UserProfile />
            </div>
         </div>
      </div>
   );
}
