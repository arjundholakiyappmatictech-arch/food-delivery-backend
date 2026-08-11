import CheckoutPayment from './CheckoutPayment';

export default function CheckoutBill({ totalItems, itemTotal, deliveryFee, totalPrice, loading, error, onPlaceOrder }) {
   return (
      <section className="h-fit w-full min-w-0 rounded-[0.1cm] border-2 border-[#E9E9E9] p-[20px]">
         <h2 className="mb-[20px] text-[20px] font-[600] text-[#02060C]">Bill Details</h2>

         <div className="flex justify-between text-[16px] font-[500] text-[#02060CB3]">
            <span>Items</span>
            <span>{totalItems}</span>
         </div>

         <div className="mt-[8px] flex justify-between text-[16px] font-[500] text-[#02060CB3]">
            <span>Item Subtotal</span>
            <span>₹{itemTotal.toFixed(2)}</span>
         </div>

         <div className="mt-[8px] flex justify-between text-[16px] font-[500] text-[#02060CB3]">
            <span>Delivery Fee</span>
            <span>₹{deliveryFee.toFixed(2)}</span>
         </div>

         <hr className="my-[20px] border-[#E9E9E9]" />

         <div className="flex justify-between text-[18px] font-[700] text-[#02060C]">
            <span>Total</span>
            <span>₹{totalPrice.toFixed(2)}</span>
         </div>

         <CheckoutPayment loading={loading} error={error} onPlaceOrder={onPlaceOrder} />
      </section>
   );
}
