import { WalletCards } from 'lucide-react';

export default function BillSummaryCard({ bill }) {
   return (
      <section className="rounded-2xl border border-[#E9E9E9] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
         <h2 className="text-xl font-semibold text-[#02060C]">Bill Summary</h2>

         <div className="mt-6 space-y-4 text-sm">
            <BillRow label="Item Total" value={`₹${bill.itemTotal.toFixed(2)}`} />

            <BillRow label="Packaging Fee" value={`₹${bill.packagingFee.toFixed(2)}`} />

            <BillRow label="Delivery Fee" value={`₹${bill.deliveryFee.toFixed(2)}`} />

            <BillRow label="Platform Fee" value={`₹${bill.platformFee.toFixed(2)}`} />

            <BillRow label="Discount (TOMATO20)" value={`- ₹${bill.discount.toFixed(2)}`} discount />
         </div>

         <div className="my-6 border-t border-dashed border-[#D9D9D9]" />

         <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-[#02060C]">Total Amount</span>

            <span className="text-2xl font-bold text-[#E56A77]">₹{bill.total.toFixed(2)}</span>
         </div>

         <div className="mt-5 flex items-center gap-3 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-600">
            <WalletCards size={18} />
            You Saved ₹{bill.discount.toFixed(2)} on this order
         </div>
      </section>
   );
}

function BillRow({ label, value, discount = false }) {
   return (
      <div className="flex items-center justify-between gap-4">
         <span className={discount ? 'text-green-600' : 'text-gray-600'}>{label}</span>

         <span className={discount ? 'font-medium text-green-600' : 'font-medium text-[#02060C]'}>{value}</span>
      </div>
   );
}
