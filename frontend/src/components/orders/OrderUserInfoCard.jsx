import { CalendarDays, CreditCard, UserRound } from 'lucide-react';

export default function OrderUserInfoCard({ user }) {
   return (
      <section className="rounded-2xl border border-[#E9E9E9] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
         <h2 className="text-xl font-semibold text-[#02060C]">Order & User Information</h2>

         <div className="mt-6 divide-y divide-[#E9E9E9]">
            <InfoRow icon={<UserRound size={19} />} label="Customer Name" value={user.name} />

            <InfoRow
               icon={<CreditCard size={19} />}
               label="Payment Method"
               value={`${user.paymentMethod} – ${user.paymentProvider}`}
               badge={user.paymentStatus}
            />

            <InfoRow icon={<CalendarDays size={19} />} label="Order Date & Time" value={user.orderDate} />
         </div>
      </section>
   );
}

function InfoRow({ icon, label, value, badge }) {
   return (
      <div className="flex items-center gap-4 py-5 first:pt-0 last:pb-0">
         <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff1f3] text-[#E56A77]">
            {icon}
         </div>

         <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500">{label}</p>

            <p className="mt-1 text-sm font-medium text-[#02060C]">{value}</p>
         </div>

         {badge && (
            <span className="rounded-full bg-green-50 px-4 py-2 text-xs font-semibold text-green-600">{badge}</span>
         )}
      </div>
   );
}
