'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { CART_SVG, HOME_SVG, SHOPPING_BAG_SVG } from '@/assets/icons';
import { UserProfile } from './UserProfile';

export default function Header() {
   const pathname = usePathname();

   let cartCount = 0;

   const navItemStyles =
      'text-[20px] font-[500] mx-[30px] my-auto max-[900px]:text-[16px] max-[900px]:mx-[15px] max-[480px]:mx-[10px] max-[425px]:mx-[5px]';

   const getActiveClass = (href) => {
      const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

      return isActive ? 'text-[#E56A77]' : 'text-[#595959] md:hover:text-[#E56A77] transition';
   };

   return (
      <div className="header fixed top-0 left-0 right-0 h-[75px] bg-[#FFF] z-50 flex justify-between shadow-[0_15px_40px_-20px_#282C3F26] max-[610px]:h-[60px]">
         {/* Logo */}

         <div className="app-logo w-2/15 flex h-full">
            <div className="mx-auto">
               <Link href="/">
                  <img src="/assets/tb.png" alt="logo" className="h-full object-contain" draggable="false" />
               </Link>
            </div>
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

                     <div className="relative h-[27px] w-[27px] min-[610px]:hidden">
                        {SHOPPING_BAG_SVG}

                        <h1 className="absolute text-[13px] left-[7px] top-[7px]">{cartCount}</h1>
                     </div>
                  </Link>
               </li>
            </ul>
         </div>

         {/* User */}

         <div className="login-btn w-2/15 flex justify-center items-center">
            <UserProfile />
         </div>
      </div>
   );
}
