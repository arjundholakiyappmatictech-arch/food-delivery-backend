export default function CheckoutInstructions({ value, onChange }) {
   return (
      <section className="w-full">
         <h2 className="mb-[12px] text-[20px] font-[600] text-[#02060C]">Delivery Instructions</h2>

         <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Add instructions for delivery..."
            className="box-border min-h-[100px] w-full resize-none rounded-[0.1cm] border-2 border-[#E9E9E9] p-[12px] text-[15px] outline-none focus:border-[#E56A77]"
         />
      </section>
   );
}
