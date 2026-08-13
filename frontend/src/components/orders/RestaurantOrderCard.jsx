import { LOCATION_SVG } from '@/assets/icons';

export default function RestaurantOrderCard({ restaurant, order }) {
   const totalItems = order.order_items.reduce((total, item) => total + item.quantity, 0);

   return (
      <section className="rounded-2xl border border-[#E9E9E9] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
         {/* Restaurant */}
         <div className="flex items-center gap-5">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full">
               <img
                  src={restaurant.image_url || '/assets/default-restaurant.jpg'}
                  alt={restaurant.name}
                  className="h-full w-full object-cover"
                  draggable={false}
               />
            </div>

            <div className="min-w-0 flex-1">
               <h2 className="text-xl font-semibold text-[#02060C]">{restaurant.name}</h2>

               <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <div className="h-5 w-5 shrink-0">{LOCATION_SVG}</div>

                  <span className="truncate">{restaurant.address}</span>
               </div>
            </div>
         </div>

         {/* Order Details */}
         <div className="mt-6 border-t border-[#E9E9E9] pt-5">
            <div className="flex items-center justify-between">
               <div>
                  <p className="text-sm text-gray-500">Order ID</p>

                  <p className="mt-1 text-sm font-medium text-[#02060C]">#{order.id}</p>
               </div>

               <div className="text-right">
                  <p className="text-sm text-gray-500">Total Items</p>

                  <p className="mt-1 text-sm font-semibold text-[#02060C]">
                     {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  </p>
               </div>
            </div>
         </div>
      </section>
   );
}
