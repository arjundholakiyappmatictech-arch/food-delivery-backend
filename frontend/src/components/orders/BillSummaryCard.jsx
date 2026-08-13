export default function BillSummaryCard({ order }) {
   const items = order.order_items.reduce((total, item) => total + item.quantity, 0);

   const itemSubtotal = order.order_items.reduce(
      (total, item) => total + Number(item.price_at_purchase) * item.quantity,
      0,
   );

   const deliveryFee = Number(order.delivery_fee);
   const total = Number(order.total);

   return (
      <section className="rounded-2xl border border-[#E9E9E9] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
         <h2 className="text-xl font-semibold text-[#02060C]">Bill Summary</h2>

         <div className="mt-5 space-y-4 text-sm">
            <div className="flex items-center justify-between">
               <span className="text-gray-500">Items</span>
               <span className="font-medium text-[#02060C]">{items}</span>
            </div>

            <div className="flex items-center justify-between">
               <span className="text-gray-500">Item Subtotal</span>
               <span className="font-medium text-[#02060C]">₹{itemSubtotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between">
               <span className="text-gray-500">Delivery Fee</span>
               <span className="font-medium text-[#02060C]">₹{deliveryFee.toFixed(2)}</span>
            </div>
         </div>

         <div className="mt-5 border-t border-[#E9E9E9] pt-5">
            <div className="flex items-center justify-between">
               <span className="font-semibold text-[#02060C]">Total</span>

               <span className="text-lg font-semibold text-[#02060C]">₹{total.toFixed(2)}</span>
            </div>
         </div>
      </section>
   );
}
