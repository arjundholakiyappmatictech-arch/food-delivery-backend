import Link from 'next/link';

export default function RestaurantCard({ restaurant }) {
   const { id, name, address, status, distance } = restaurant;

   return (
      <div className="w-full cursor-pointer rounded-[0.3cm] bg-white transition-all duration-100 hover:scale-[1.02]">
         <Link href={`/restaurants/${id}`}>
            {/* Restaurant Image */}
            <div className="h-[165px] w-full overflow-hidden rounded-[0.3cm] bg-gray-200">
               <div className="flex h-full items-center justify-center text-gray-400">Restaurant Image</div>
            </div>

            {/* Restaurant Info */}
            <div className="m-[5px] max-[560px]:m-[2px]">
               <h2 className="line-clamp-1 text-[18px] font-[700] max-[700px]:text-[16px]">{name}</h2>

               <h4 className="text-[16px] font-[550] max-[700px]:text-[14px]">
                  {status === 'open' ? '🟢 Open' : '🔴 Closed'}
                  {distance && <> • {distance}</>}
               </h4>

               <h3 className="line-clamp-1 text-[14px] font-[600] text-[#6B7280] max-[700px]:text-[12px]">{address}</h3>
            </div>
         </Link>
      </div>
   );
}
