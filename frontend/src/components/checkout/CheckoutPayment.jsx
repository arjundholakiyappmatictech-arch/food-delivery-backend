'use client';

import { useState } from 'react';

export default function CheckoutPayment({ loading, error, onPlaceOrder }) {
   const [paymentMethod, setPaymentMethod] = useState('cod');

   const handleSubmit = () => {
      onPlaceOrder(paymentMethod);
   };

   return (
      <div className="mt-[25px]">
         <h3 className="mb-[12px] text-[16px] font-[600] text-[#02060C]">Payment Method</h3>

         <label className="flex cursor-pointer items-center gap-[10px] rounded-[0.1cm] border border-[#E9E9E9] p-[12px]">
            <input
               type="radio"
               name="payment_method"
               value="cod"
               checked={paymentMethod === 'cod'}
               onChange={(event) => setPaymentMethod(event.target.value)}
               className="accent-[#E56A77]"
            />

            <span className="text-[14px] font-[500] text-[#02060C]">Cash on Delivery</span>
         </label>

         <label className="mt-[8px] flex cursor-pointer items-center gap-[10px] rounded-[0.1cm] border border-[#E9E9E9] p-[12px]">
            <input
               type="radio"
               name="payment_method"
               value="upi"
               checked={paymentMethod === 'upi'}
               onChange={(event) => setPaymentMethod(event.target.value)}
               className="accent-[#E56A77]"
            />

            <span className="text-[14px] font-[500] text-[#02060C]">Online Payment</span>
         </label>

         {error && <p className="mt-[10px] text-[13px] text-red-500">{error}</p>}

         <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="mt-[20px] flex w-full cursor-pointer items-center justify-center rounded-[0.1cm] bg-[#D95765] py-[11px] text-[17px] font-[500] text-white transition hover:bg-[#C74655] disabled:cursor-not-allowed disabled:opacity-60"
         >
            {loading ? 'PLACING ORDER...' : paymentMethod === 'cod' ? 'PLACE ORDER' : 'PAY NOW'}
         </button>
      </div>
   );
}
