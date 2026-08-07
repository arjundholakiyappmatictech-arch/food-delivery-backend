'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, MapPin, Star, LogOut, ChevronRight } from 'lucide-react';
import { SHOPPING_BAG_SVG } from '@/assets/icons';

export function UserProfile() {
   const router = useRouter();

   const [isProfileOpen, setIsProfileOpen] = useState(false);

   const user = {
      name: 'John Doe',
      email: 'john@example.com',
      picture: '/assets/avatar.png',
   };

   const profileRef = useRef(null);
   const buttonRef = useRef(null);

   useEffect(() => {
      const handleOutsideClick = (e) => {
         if (
            profileRef.current &&
            !profileRef.current.contains(e.target) &&
            buttonRef.current &&
            !buttonRef.current.contains(e.target)
         ) {
            setIsProfileOpen(false);
         }
      };

      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);

      return () => {
         document.removeEventListener('mousedown', handleOutsideClick);
         document.removeEventListener('touchstart', handleOutsideClick);
      };
   }, []);

   const menuItems = useMemo(
      () => [
         {
            title: 'Orders',
            href: '/orders',
            icon: SHOPPING_BAG_SVG,
         },
         {
            title: 'Addresses',
            href: '/addresses',
            icon: <MapPin size={17} strokeWidth={2} />,
         },
         {
            title: 'Reviews',
            href: '/reviews',
            icon: <Star size={17} strokeWidth={2} />,
         },
      ],
      [],
   );

   const menuItemClass =
      'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[#3D4152] transition-all duration-150 hover:bg-[#F8F8F8]';

   const handleNavigate = (href) => {
      setIsProfileOpen(false);
      router.push(href);
   };

   const handleLogout = () => {
      setIsProfileOpen(false);
   };

   return (
      <div className="relative h-[40px] w-[40px] max-[700px]:h-[36px] max-[700px]:w-[36px] max-[500px]:h-[32px] max-[500px]:w-[32px]">
         <img
            ref={buttonRef}
            src={user.picture || '/assets/avatar.png'}
            alt={user.name}
            className="h-full w-full cursor-pointer rounded-full border border-[#E8E8E8] object-cover"
            draggable={false}
            onClick={() => setIsProfileOpen((prev) => !prev)}
         />

         {isProfileOpen && (
            <div
               ref={profileRef}
               className="absolute right-0 top-[50px] z-[120] w-[240px] overflow-hidden rounded-2xl border border-[#ECECEC] bg-white shadow-[0_8px_24px_rgba(40,44,63,.12)]"
            >
               <div className="absolute -top-2 right-4 h-4 w-4 rotate-45 border-l border-t border-[#ECECEC] bg-white" />

               <div className="relative p-3">
                  <div className="flex flex-col items-center">
                     <img
                        src={user.picture || '/assets/avatar.png'}
                        alt={user.name}
                        className="h-12 w-12 rounded-full border border-[#ECECEC] object-cover"
                     />

                     <h2 className="mt-2 text-[15px] font-semibold leading-none tracking-tight text-[#02060C]">
                        {user.name}
                     </h2>

                     <p className="mt-1 text-[11px] text-[#7E808C]">{user.email}</p>
                  </div>

                  <div className="my-2.5 border-t border-[#F1F1F1]" />

                  <div className="space-y-0.5">
                     {menuItems.map(({ title, href, icon }) => (
                        <button key={title} onClick={() => handleNavigate(href)} className={menuItemClass}>
                           <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F8F8F8] text-[#3D4152]">
                                 {icon}
                              </div>

                              <span className="text-[15px] font-medium">{title}</span>
                           </div>

                           <ChevronRight size={16} className="text-[#B5B5B5]" />
                        </button>
                     ))}
                  </div>

                  <div className="my-2.5 border-t border-[#F1F1F1]" />

                  <button
                     onClick={handleLogout}
                     className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[#E53935] transition-all duration-150 hover:bg-[#FFF4F4]"
                  >
                     <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFF4F4]">
                        <LogOut size={15} strokeWidth={2} />
                     </div>

                     <span className="text-[14px] font-medium">Logout</span>
                  </button>
               </div>
            </div>
         )}
      </div>
   );
}
