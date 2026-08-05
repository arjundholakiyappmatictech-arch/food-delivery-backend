'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { CART_SVG, HOME_SVG, SHOPPING_BAG_SVG } from '@/assets/icons';

import { UserProfile } from './UserProfile';

export function Header() {
   const pathname = usePathname();

   const getLinkClassName = (path) => {
      const isActive = path === '/' ? pathname === '/' : pathname.startsWith(path);

      return isActive ? 'text-[#E56A77]' : 'text-[#595959] transition-colors hover:text-[#E56A77]';
   };

   return (
      <header className="fixed inset-x-0 top-0 z-50 h-[75px] bg-white shadow-[0_15px_40px_-20px_#282C3F26] max-[610px]:h-[60px]">
         <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" aria-label="Go to homepage" className="flex h-full items-center">
               <Image
                  src="/assets/tb.png"
                  alt="Tomato"
                  width={150}
                  height={70}
                  priority
                  className="h-[65px] w-auto object-contain max-[610px]:h-[50px]"
               />
            </Link>

            <nav aria-label="Main navigation">
               <ul className="flex items-center gap-8 max-[610px]:gap-5">
                  <li>
                     <Link
                        href="/"
                        className={`flex items-center gap-2 text-[18px] font-medium max-[900px]:text-[16px] ${getLinkClassName('/')}`}
                     >
                        <span className="h-[25px] w-[25px] max-[610px]:hidden">{HOME_SVG}</span>

                        <span>Home</span>
                     </Link>
                  </li>

                  <li>
                     <Link
                        href="/cart"
                        className={`flex items-center gap-2 text-[18px] font-medium max-[900px]:text-[16px] ${getLinkClassName('/cart')}`}
                     >
                        <span className="flex items-center gap-2 max-[610px]:hidden">
                           <span className="relative h-[30px] w-[30px]">
                              {CART_SVG}

                              <span className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 text-[11px] font-medium">
                                 0
                              </span>
                           </span>

                           <span>Cart</span>
                        </span>

                        <span className="relative hidden h-[27px] w-[27px] max-[610px]:block">
                           {SHOPPING_BAG_SVG}

                           <span className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 text-[11px] font-medium">
                              0
                           </span>
                        </span>
                     </Link>
                  </li>
               </ul>
            </nav>

            <UserProfile />
         </div>
      </header>
   );
}
