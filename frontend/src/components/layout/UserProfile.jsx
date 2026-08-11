'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

import { SHOPPING_BAG_SVG2, LOCATION_SVG, REVIEW_SVG, LOGOUT_SVG } from '@/assets/icons';

import { useAuthStore } from '@/lib/store/useAuthStore';

export default function UserProfile() {
   const router = useRouter();

   const user = useAuthStore((state) => state.user);
   const clearUser = useAuthStore((state) => state.clearUser);

   const [isProfileOpen, setIsProfileOpen] = useState(false);

   const profileRef = useRef(null);
   const buttonRef = useRef(null);

   useEffect(() => {
      const handleOutsideClick = (event) => {
         if (
            profileRef.current &&
            !profileRef.current.contains(event.target) &&
            buttonRef.current &&
            !buttonRef.current.contains(event.target)
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
            icon: SHOPPING_BAG_SVG2,
            iconClass: 'h-7 w-7',
         },
         {
            title: 'Addresses',
            href: '/addresses',
            icon: LOCATION_SVG,
            iconClass: 'h-5 w-5',
         },
         {
            title: 'Reviews',
            href: '/reviews',
            icon: REVIEW_SVG,
            iconClass: 'h-5 w-5',
         },
      ],
      [],
   );

   const handleNavigate = (href) => {
      setIsProfileOpen(false);
      router.push(href);
   };

   const handleLogout = () => {
      setIsProfileOpen(false);

      localStorage.removeItem('access_token');
      clearUser();

      router.replace('/login');
   };

   if (!user) {
      return null;
   }

   return (
      <div className="relative h-[40px] w-[40px] shrink-0 max-[700px]:h-[36px] max-[700px]:w-[36px] max-[500px]:h-[32px] max-[500px]:w-[32px]">
         {/* Profile Button */}
         <button
            ref={buttonRef}
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="h-full w-full cursor-pointer overflow-hidden rounded-full p-0"
            aria-label="Open profile menu"
            aria-expanded={isProfileOpen}
         >
            <img
               src="/assets/user.png"
               alt={user.full_name || 'User'}
               className="block h-full w-full rounded-full border border-[#E8E8E8] object-cover"
               draggable={false}
            />
         </button>

         {/* Dropdown */}
         {isProfileOpen && (
            <div
               ref={profileRef}
               className="absolute right-0 top-[50px] z-[120] w-[240px] overflow-hidden rounded-2xl border border-[#ECECEC] bg-white shadow-[0_8px_24px_rgba(40,44,63,.12)]"
            >
               <div className="relative p-3">
                  {/* User information */}
                  <div className="flex flex-col items-center">
                     <img
                        src="/assets/user.png"
                        alt={user.full_name || 'User'}
                        className="h-12 w-12 rounded-full border border-[#ECECEC] object-cover"
                        draggable={false}
                     />

                     <h2 className="mt-2 max-w-full truncate px-2 text-[15px] font-semibold leading-none tracking-tight text-[#02060C]">
                        {user.full_name}
                     </h2>

                     <p className="mt-1 max-w-full truncate px-2 text-[11px] text-[#7E808C]">{user.email}</p>
                  </div>

                  <div className="my-2.5 border-t border-[#F1F1F1]" />

                  {/* Menu */}
                  <div className="space-y-0.5">
                     {menuItems.map(({ title, href, icon, iconClass }) => (
                        <button
                           key={title}
                           type="button"
                           onClick={() => handleNavigate(href)}
                           className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[#3D4152] transition-colors duration-150 hover:bg-[#F8F8F8]"
                        >
                           <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F8F8F8] text-[#3D4152]">
                                 <div className={iconClass}>{icon}</div>
                              </div>

                              <span className="text-[15px] font-medium">{title}</span>
                           </div>

                           <ChevronRight size={16} className="shrink-0 text-[#B5B5B5]" />
                        </button>
                     ))}
                  </div>

                  <div className="my-2.5 border-t border-[#F1F1F1]" />

                  {/* Logout */}
                  <button
                     type="button"
                     onClick={handleLogout}
                     className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-[#E53935] transition-colors duration-150 hover:bg-[#FFF4F4]"
                  >
                     <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FFF4F4]">
                        <div className="h-5 w-5">{LOGOUT_SVG}</div>
                     </div>

                     <span className="text-[14px] font-medium">Logout</span>
                  </button>
               </div>
            </div>
         )}
      </div>
   );
}
