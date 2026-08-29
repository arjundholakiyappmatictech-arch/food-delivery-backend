import { USER_SVG, CARD_SVG, CALENDER_SVG, LOCATION_SVG } from '@/assets/icons';

export default function OrderUserInfoCard({ customer, payment, address }) {
   return (
      <section className="rounded-2xl border border-[#E9E9E9] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
         <h2 className="text-xl font-semibold text-[#02060C]">Order & User Information</h2>

         <div className="mt-6 divide-y divide-[#E9E9E9]">
            <div className="flex items-center gap-4 py-5 first:pt-0">
               <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff1f3] p-2 text-[#E56A77]">
                  {USER_SVG}
               </div>

               <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">Customer Name</p>

                  <p className="mt-1 text-sm font-medium text-[#02060C]">{customer?.full_name || 'N/A'}</p>
               </div>
            </div>

            <div className="flex items-center gap-4 py-5">
               <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff1f3] p-2 text-[#E56A77]">
                  {CARD_SVG}
               </div>

               <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">Payment Method</p>

                  <p className="mt-1 text-sm font-medium uppercase text-[#02060C]">{payment?.method || 'N/A'}</p>
               </div>

               {payment?.status && (
                  <span className="rounded-full bg-green-50 px-4 py-2 text-xs font-semibold capitalize text-green-600">
                     {payment.status}
                  </span>
               )}
            </div>

            <div className="flex items-center gap-4 py-5 last:pb-0">
               <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff1f3] p-2 text-[#E56A77]">
                  {CALENDER_SVG}
               </div>

               <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">Order Date & Time</p>

                  <p className="mt-1 text-sm font-medium text-[#02060C]">{payment?.paid_at || 'N/A'}</p>
               </div>
            </div>

            <div className="flex gap-4 py-5 last:pb-0">
               <div className="flex h-11 w-11 shrink-0 items-center  justify-center rounded-full bg-[#fff1f3] p-2 text-[#E56A77]">
                  {LOCATION_SVG}
               </div>

               <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">Delivery Address</p>

                  <p className="mt-1 text-sm font-medium text-[#02060C]">
                     {address?.address_line}
                     {address?.city && `, ${address.city}`}
                     {address?.state && `, ${address.state}`}
                     {address?.pincode && ` - ${address.pincode}`}
                  </p>
               </div>
            </div>
         </div>
      </section>
   );
}
