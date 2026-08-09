'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function ConditionalHeader() {
   const pathname = usePathname();

   const hideOn = ['/login', '/register', '/addresses', '/addresses/add'];

   if (hideOn.includes(pathname)) {
      return null;
   }

   return (
      <>
         <Header />
         <div className="h-[75px] max-[610px]:h-[60px]" />
      </>
   );
}
