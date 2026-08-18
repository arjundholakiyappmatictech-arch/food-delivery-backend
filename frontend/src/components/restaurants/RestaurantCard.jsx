'use client';

import Link from 'next/link';

import useRestaurantStore from '@/lib/store/restaurantStore';

export default function RestaurantCard({ restaurant, animationDelay = 0 }) {
   const { id, name, address, status, distance, image_url, menus } = restaurant;

   const { setSelectedRestaurant } = useRestaurantStore();

   return (
      <div
         style={{
            animationDelay: `${animationDelay}ms`,
         }}
         className={`
         res-card
         mx-auto
         h-[100%]
         w-[250px]
         cursor-pointer
         rounded-[0.3cm]
         bg-[#FFF]
         animate-[restaurantIn_0.6s_cubic-bezier(0.22,1,0.36,1)_both]
         transition-all
         duration-200
         hover:scale-105
         max-[1000px]:w-[220px]
         max-[800px]:w-[32vw]
         max-[560px]:w-full
         ${status === 'closed' ? 'bg-[#F1F1F1]' : 'bg-white'}
      `}
         onContextMenu={(e) => e.preventDefault()}
         onDragStart={(e) => e.preventDefault()}
      >
         <Link href={`/restaurants/${id}`} onClick={() => setSelectedRestaurant(restaurant)}>
            <div className="res-img">
               <img
                  src={image_url || '/assets/default-restaurant.jpg'}
                  alt={name}
                  className={`
                  h-[165px]
                  w-full
                  overflow-hidden
                  rounded-[0.3cm]
                  object-cover
                  transition-all
                  duration-300
                  ${status === 'closed' ? 'grayscale brightness-90' : ''}
               `}
                  draggable={false}
               />
            </div>

            <div className="res-info m-[5px] max-[560px]:m-[2px]">
               <h2 className="line-clamp-1 line-break-anyword text-[18px] font-[700] max-[700px]:text-[16px]">
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
