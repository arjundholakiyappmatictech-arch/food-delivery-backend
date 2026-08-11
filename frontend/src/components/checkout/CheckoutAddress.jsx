import { LOCATION_SVG } from '@/assets/icons';

export default function CheckoutAddress({ selectedLocation }) {
   return (
      <section className="w-full">
         <h2 className="mb-[10px] text-[20px] font-[600] text-[#02060C]">Delivery Address</h2>

         <div className="flex w-full min-w-0 items-center gap-[12px] rounded-[0.1cm] border-2 border-[#E9E9E9] px-[16px] py-[14px]">
            <div className="flex h-[36px] w-[38px] shrink-0 items-center justify-center">
               <span className="text-[#E56A77]">{LOCATION_SVG}</span>
            </div>

            <div className="min-w-0">
               <h3 className="text-[16px] font-[600] capitalize leading-[20px] text-[#02060C]">
                  {selectedLocation?.title}
               </h3>

               <p className="mt-[3px] break-words text-[14px] leading-[19px] text-[#02060CB3]">
                  {selectedLocation?.address}
               </p>
            </div>
         </div>
      </section>
   );
}
