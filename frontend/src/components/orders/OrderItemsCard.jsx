import Image from 'next/image';

export default function OrderedItemsCard({ items }) {
   return (
      <section className="rounded-2xl border border-[#E9E9E9] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
         <h2 className="text-xl font-semibold text-[#02060C]">Ordered Items</h2>

         <div className="mt-5 divide-y divide-[#E9E9E9]">
            {items.map((item) => (
               <div key={item.id} className="flex items-center gap-4 py-5 first:pt-0 last:pb-0">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                     <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>

                  <div className="flex h-16 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fff1f3] text-sm font-semibold text-[#E56A77]">
                     {item.quantity}x
                  </div>

                  <div className="min-w-0 flex-1">
                     <h3 className="truncate font-semibold text-[#02060C]">{item.name}</h3>

                     {item.description && <p className="mt-1 text-sm text-gray-500">{item.description}</p>}
                  </div>

                  <div className="text-right">
                     <p className="font-semibold text-[#02060C]">₹{item.total.toFixed(2)}</p>

                     <p className="mt-1 text-xs text-gray-500">₹{item.price.toFixed(2)} each</p>
                  </div>
               </div>
            ))}
         </div>

         <button
            type="button"
            className="mt-6 w-full rounded-xl border border-[#E9E9E9] px-5 py-3 text-sm font-semibold text-[#02060C] transition hover:border-[#E56A77] hover:text-[#E56A77]"
         >
            View Restaurant Menu ↗
         </button>
      </section>
   );
}
