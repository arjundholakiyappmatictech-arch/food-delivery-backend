'use client';

export default function ReplaceCartDialog({ open, onClose, onReplace }) {
   if (!open) {
      return null;
   }

   return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
         <div className="w-full max-w-[380px] rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-[#02060C]">Replace your cart?</h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
               Your cart contains items from another restaurant. You can only order from one restaurant at a time.
            </p>

            <div className="mt-6 flex justify-end gap-3">
               <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-[#E9E9E9] px-4 py-2.5 text-sm font-medium text-[#02060C] transition hover:bg-gray-50"
               >
                  Keep Cart
               </button>

               <button
                  type="button"
                  onClick={onReplace}
                  className="rounded-xl bg-[#D95765] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#C74655]"
               >
                  Replace Cart
               </button>
            </div>
         </div>
      </div>
   );
}
