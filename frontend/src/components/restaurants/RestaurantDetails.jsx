'use client';

import { useRouter } from 'next/navigation';

import useRestaurantStore from '@/lib/store/restaurantStore';

import RestaurantMenu from './RestaurantMenu';
import RestaurantMenuSkeleton from './RestaurantMenuSkeleton';
import useRestaurant from '@/lib/hooks/useRestaurant';
import { MENU_ICON_URL } from '@/assets/icons';
import { useEffect } from 'react';

export default function RestaurantDetails({ restaurantId }) {
   const router = useRouter();

   const { selectedRestaurant, hasHydrated } = useRestaurantStore();

   const { menus, loading, error } = useRestaurant(restaurantId);

   useEffect(() => {
      if (hasHydrated && !selectedRestaurant) {
         router.replace('/');
      }
   }, [hasHydrated, selectedRestaurant, router]);

   if (!hasHydrated) {
      return <RestaurantMenuSkeleton />;
   }

   if (!selectedRestaurant) {
      return null;
   }

   if (loading) {
      return <RestaurantMenuSkeleton />;
   }

   if (error) {
      return (
         <div className="py-20 text-center">
            <p className="text-red-600">{error}</p>
         </div>
      );
   }

   return (
      <div className="mx-auto mt-[30px] w-[800px] max-[820px]:mt-[10px] max-[820px]:w-[98%]">
         {/* Restaurant Info */}
         <div className="flex rounded-[0.3cm] border border-[#E9E9E9] shadow-[3px_3px_10px_#E9E9E9]">
            <div className="m-[20px] max-[600px]:m-[10px]">
               <img
                  src={selectedRestaurant?.image_url || '/assets/restaurant-placeholder.png'}
                  alt={selectedRestaurant.name}
                  className="h-[175px] w-[175px] rounded-[0.3cm] object-cover max-[600px]:h-[125px] max-[600px]:w-[125px]"
                  draggable={false}
               />
            </div>

            <div className="my-[20px] flex flex-col max-[600px]:my-[12px]">
               <h1 className="text-[30px] font-[600] text-[#02060CEB] max-[720px]:text-[20px] max-[600px]:text-[17px] max-[600px]:font-[700]">
                  {selectedRestaurant.name}
               </h1>

               <h4 className="mt-[10px] text-[14px] font-[500] text-[#02060CEB] max-[600px]:mt-[5px] max-[600px]:text-[12px]">
                  Status:{' '}
                  {selectedRestaurant.status === 'open' ? (
                     <span className="text-green-600">Open</span>
                  ) : (
                     <span className="text-red-600">Closed</span>
                  )}
               </h4>

               <h4 className="mt-[10px] text-[14px] font-[500] text-[#02060CEB] max-[600px]:mt-[5px] max-[600px]:text-[12px]">
                  <span className="text-[#02060CEB]">
                     {menus.length
                        ? `${menus
                             .slice(0, 3)
                             .map((menu) => menu.name)
                             .join(', ')}${menus.length > 3 ? ' +' + (menus.length - 3) + ' more' : ''}`
                        : 'No menus available'}
                  </span>
               </h4>

               <h4 className="mt-[10px] text-[14px] font-[500] text-[#02060CEB] max-[600px]:mt-[5px] max-[600px]:text-[12px]">
                  <span className="text-[#02060C99]">{selectedRestaurant.distance}</span> • {''}
                  <span className="text-[#02060C99]">{selectedRestaurant.address}</span>
               </h4>
            </div>
         </div>
         {/* MENU */}
         <div className="flex justify-center mt-[20px] mb-[10px]">
            <img
               src={MENU_ICON_URL}
               alt="menu-icon"
               className="h-[35px] w-[35px] p-[4px] max-[600px]:h-[23px] max-[600px]:w-[23px] max-[600px]:p-[2px]"
               onContextMenu={(e) => e.preventDefault()}
               onDragStart={(e) => e.preventDefault()}
            />
            <h1 className="text-[25px] font-[500] max-[600px]:text-[18px]">MENU</h1>
         </div>
         {menus.length > 0 ? (
            <RestaurantMenu menus={menus} />
         ) : (
            <div className="py-10 text-center">
               <h2 className="text-xl font-semibold">No menu available</h2>

               <p className="mt-2 text-gray-500">This restaurant have not added any menu yet.</p>
            </div>
         )}
      </div>
   );
}
