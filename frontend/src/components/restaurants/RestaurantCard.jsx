/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';

import useRestaurantStore from '@/lib/store/restaurantStore';

export default function RestaurantCard({ restaurant }) {
   const { id, name, address, status, distance, image_url, menus } = restaurant;

   const { setSelectedRestaurant } = useRestaurantStore();

   return (
      <div
         className="res-card h-[100%] w-[250px] cursor-pointer rounded-[0.3cm] bg-[#FFF] mx-auto transition-all duration-100 hover:scale-105 max-[1000px]:w-[220px] max-[800px]:w-[32vw] max-[560px]:w-[47vw]"
         onContextMenu={(e) => e.preventDefault()}
         onDragStart={(e) => e.preventDefault()}
      >
         <Link href={`/restaurants/${id}`} onClick={() => setSelectedRestaurant(restaurant)}>
            <div className="res-img">
               <img
                  src={image_url || '/assets/default-restaurant.jpg'}
                  alt={name}
                  className="h-[165px] w-full overflow-hidden rounded-[0.3cm] object-cover"
               />
            </div>

            <div className="res-info m-[5px] max-[560px]:m-[2px]">
               <h2 className="line-break-anyword line-clamp-1 text-[18px] font-[700] max-[700px]:text-[16px]">
                  {name}
               </h2>

               <h4 className="text-[16px] font-[550] max-[700px]:text-[14px]">
                  {status === 'open' ? (
                     <span className="text-green-600">Open</span>
                  ) : (
                     <span className="text-red-600">Closed</span>
                  )}
                  {distance && ` • ${distance}`}
               </h4>

               <h3 className="line-clamp-1 text-[14px] font-[600] text-[#6B7280] max-[700px]:text-[12px]">
                  {menus?.length
                     ? menus
                          .slice(0, 3)
                          .map((menu) => menu.name)
                          .join(', ')
                     : 'No menus'}
               </h3>

               <h5 className="text-[12px] font-[550] text-[#4E4E4B] max-[700px]:text-[10px]">{address}</h5>
            </div>
         </Link>
      </div>
   );
}
