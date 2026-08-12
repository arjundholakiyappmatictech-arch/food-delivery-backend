import Image from 'next/image';
import { MapPin, Star, Phone } from 'lucide-react';

export default function RestaurantOrderCard({ restaurant, order }) {
   const totalItems = order.items.reduce((total, item) => total + item.quantity, 0);

   return (
      <section className="rounded-2xl border border-[#E9E9E9] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
         <div className="flex items-center gap-5">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full">
               <Image src={restaurant.image} alt={restaurant.name} fill className="object-cover" />
            </div>

            <div className="min-w-0 flex-1">
               <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-[#02060C]">{restaurant.name}</h2>

                  <span className="inline-flex items-center gap-1 rounded-md border border-green-500 px-2 py-1 text-xs font-semibold text-green-600">
                     <Star size={12} fill="currentColor" />
                     {restaurant.rating}
                  </span>
               </div>

               <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={16} />
                  <span>{restaurant.location}</span>
               </div>
            </div>

            <button
               type="button"
               className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff1f3] text-[#E56A77] transition hover:bg-[#E56A77] hover:text-white"
            >
               <Phone size={18} />
            </button>
         </div>

         <div className="mt-6 border-t border-[#E9E9E9] pt-5">
            <div className="flex items-center justify-between text-sm">
               <div>
                  <p className="text-gray-500">Order ID</p>
                  <p className="mt-1 font-medium text-[#02060C]">#{order.id}</p>
               </div>

               <div className="text-right">
                  <p className="text-gray-500">Total Items</p>
                  <p className="mt-1 font-semibold text-[#02060C]">{totalItems} items</p>
               </div>
            </div>
         </div>
      </section>
   );
}
