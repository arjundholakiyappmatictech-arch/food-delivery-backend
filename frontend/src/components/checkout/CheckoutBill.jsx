'use client';
export default function CheckoutBill({ totalItems, itemTotal, deliveryFee, totalPrice, loading, error, onPlaceOrder }) {
   return (
      <section className="h-fit w-full min-w-0 rounded-[0.1cm] border-2 border-[#E9E9E9] p-[20px]">
         <h2 className="mb-[20px] text-[20px] font-[600] text-[#02060C]">Bill Details</h2>

         <div className="flex justify-between gap-[10px] text-[16px] font-[500] text-[#02060CB3]">
            <span>Items</span>
            <span className="shrink-0">{totalItems}</span>
         </div>

         <div className="mt-[8px] flex justify-between gap-[10px] text-[16px] font-[500] text-[#02060CB3]">
            <span>Item Subtotal</span>
            <span className="shrink-0">₹{itemTotal.toFixed(2)}</span>
         </div>

         <div className="mt-[8px] flex justify-between gap-[10px] text-[16px] font-[500] text-[#02060CB3]">
            <span>Delivery Fee</span>
            <span className="shrink-0">₹{deliveryFee.toFixed(2)}</span>
         </div>

         <hr className="my-[20px] border-[#E9E9E9]" />

         <div className="flex justify-between gap-[10px] text-[18px] font-[700] text-[#02060C]">
            <span>Total</span>
            <span className="shrink-0">₹{totalPrice.toFixed(2)}</span>
         </div>

         {error && <p className="mt-[10px] break-words text-[13px] text-red-500">{error}</p>}

         <button
            type="button"
            disabled={loading}
            onClick={onPlaceOrder}
            className="mt-[25px] flex w-full cursor-pointer items-center justify-center rounded-[0.1cm] bg-[#E56A77] py-[11px] text-[18px] font-[500] text-white transition-colors duration-200 hover:bg-[#D95765] disabled:cursor-not-allowed disabled:opacity-60"
         >
            {loading ? 'PLACING ORDER...' : 'PLACE ORDER'}
         </button>
      </section>
   );
}
