'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function ConditionalHeader() {
   const pathname = usePathname();

   const hideOn = ['/login', '/register', '/addresses/select', '/addresses/add'];
   const isEditAddress = pathname.startsWith('/addresses/') && pathname.endsWith('/edit');

   if (hideOn.includes(pathname) || isEditAddress) {
      return null;
   }

   return (
      <>
         <Header />
         <div className="h-[75px] max-[610px]:h-[60px]" />
      </>
   );
}
