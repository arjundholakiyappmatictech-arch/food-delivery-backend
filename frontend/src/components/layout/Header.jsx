/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { CART_SVG, HOME_SVG, SHOPPING_BAG_SVG, INFO_SVG } from '@/assets/icons';
import useCartStore from '@/lib/store/cartStore';
import { useEffect, useState } from 'react';
import UserProfile from './UserProfile';

export default function Header() {
   const pathname = usePathname();

   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

   const navItemStyles = 'text-[20px] font-[500] mx-[30px] my-auto max-[900px]:text-[16px] max-[900px]:mx-[15px]';

   const getActiveClass = (href) => {
      const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

      return isActive ? 'text-[#E56A77]' : 'text-[#595959] transition md:hover:text-[#E56A77]';
   };

   const mobileNavItems = [
      {
         href: '/',
         label: 'Home',
         icon: HOME_SVG,
      },
      {
         href: '/about',
         label: 'About Us',
         icon: INFO_SVG,
      },
      {
         href: '/cart',
         label: 'Cart',
         icon: CART_SVG,
      },
   ];

   return (
      <header className="fixed top-0 left-0 right-0 z-50 h-[75px] bg-white shadow-[0_15px_40px_-20px_#282C3F26] max-[610px]:h-[60px]">
         <div className="mx-auto flex h-full w-full max-w-[1800px] items-center px-[60px] max-[1200px]:px-[40px] max-[800px]:px-[25px] max-[610px]:px-[15px]">
            {/* Logo */}
            <div className="flex shrink-0 items-center">
               <Link href="/" className="flex items-center">
                  <img
                     src="/assets/logo.png"
                     alt="Tomato"
                     className="h-[70px] w-auto object-contain transition-transform duration-200 max-[610px]:h-[55px]"
                     draggable={false}
                  />
               </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="flex flex-1 items-center justify-center max-[610px]:hidden">
               <ul className="flex">
                  <li className={navItemStyles}>
                     <Link href="/" className={getActiveClass('/')}>
                        <div className="flex items-center">
                           <div className="h-[26px] w-[25px]">{HOME_SVG}</div>
                           &nbsp;
                           <span>Home</span>
                        </div>
                     </Link>
                  </li>

                  <li className={navItemStyles}>
                     <Link href="/about" className={getActiveClass('/about')}>
                        <div className="flex items-center">
                           <div className="h-[28px] w-[25px]">{INFO_SVG}</div>
                           &nbsp;
                           <span>About Us</span>
                        </div>
                     </Link>
                  </li>

                  <li className={navItemStyles}>
                     <Link href="/cart" className={getActiveClass('/cart')}>
                        <div className="flex items-center">
                           <div className="relative h-[30px] w-[30px]">
                              {CART_SVG}

                              <span className="absolute top-[5px] left-[9px] text-[12px]">{cartCount}</span>
                           </div>
                           &nbsp;
                           <span>Cart</span>
                        </div>
                     </Link>
                  </li>
               </ul>
            </nav>

            {/* Right Side */}
            <div className="ml-auto flex shrink-0 items-center gap-3">
               <UserProfile />

               {/* Mobile Menu Button */}
               <button
                  type="button"
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  aria-label="Toggle navigation menu"
                  aria-expanded={mobileMenuOpen}
                  className="hidden size-9 cursor-pointer items-center justify-center rounded-lg text-[#595959] transition hover:bg-[#F5F5F5] max-[610px]:flex"
               >
                  {mobileMenuOpen ? <span className="text-xl">✕</span> : <span className="text-xl">☰</span>}
               </button>
            </div>
         </div>

         {/* Mobile Navigation */}
         {mobileMenuOpen && (
            <nav className="border-t border-[#E9E9E9] bg-white shadow-[0_10px_20px_rgba(0,0,0,0.06)] min-[611px]:hidden">
               <ul className="px-4 py-2">
                  {mobileNavItems.map((item) => {
                     const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

                     return (
                        <li key={item.href}>
                           <Link
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-[500] transition ${
                                 isActive ? 'bg-[#FFF3F4] text-[#E56A77]' : 'text-[#595959] hover:bg-[#F8F8F8]'
                              }`}
                           >
                              <span className="flex size-5 items-center justify-center">{item.icon}</span>

                              <span>{item.label}</span>

                              {item.href === '/cart' && cartCount > 0 && (
                                 <span className="ml-auto rounded-full bg-[#E56A77] px-2 py-0.5 text-[11px] font-semibold text-white">
                                    {cartCount}
                                 </span>
                              )}
                           </Link>
                        </li>
                     );
                  })}
               </ul>
            </nav>
         )}
      </header>
   );
}
