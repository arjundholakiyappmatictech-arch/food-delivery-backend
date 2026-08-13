import Image from 'next/image';

export default function OrderedItemsCard({ items }) {
   return (
      <section className="rounded-2xl border border-[#E9E9E9] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
         <h2 className="text-xl font-semibold text-[#02060C]">Ordered Items</h2>

         <div className="mt-5 divide-y divide-[#E9E9E9]">
            {items.map((item) => {
               const price = Number(item.price_at_purchase);
               const total = price * item.quantity;

               return (
                  <div key={item.id} className="flex items-center gap-4 py-5 first:pt-0 last:pb-0">
                     <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                        <img
                           src={item.menu_item.image_url || '/assets/pizza.jpg'}
                           alt={item.menu_item.name}
                           className="h-full w-full object-cover"
                           draggable={false}
                        />
                     </div>

                     <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold text-[#02060C]">
                           {item.menu_item.name} <span className="font-medium">×{item.quantity}</span>
                        </h3>
                     </div>

                     <div className="text-right">
                        <p className="font-semibold text-[#02060C]">₹{total.toFixed(2)}</p>

                        <p className="mt-1 text-xs text-gray-500">₹{price.toFixed(2)} each</p>
                     </div>
                  </div>
               );
            })}
         </div>
      </section>
   );
}
