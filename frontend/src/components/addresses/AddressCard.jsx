'use client';

import { BriefcaseBusiness, Home, MapPin, ChevronRight } from 'lucide-react';

function getAddressIcon(label) {
   const normalizedLabel = label?.toLowerCase();

   if (normalizedLabel === 'home') {
      return Home;
   }

   if (normalizedLabel === 'work') {
      return BriefcaseBusiness;
   }

   return MapPin;
}

export default function AddressCard({ address, disabled = false, onSelect }) {
   const AddressIcon = getAddressIcon(address.label);
   const completeAddress = [address.address_line, address.city, address.state, address.pincode]
      .filter(Boolean)
      .join(', ');

   return (
      <button
         type="button"
         disabled={disabled}
         onClick={() => onSelect(address)}
         className="group flex w-full cursor-pointer items-start gap-3 rounded-xl border border-[#E9E9E9] bg-white p-3.5 text-left transition-all duration-150 hover:border-[#E56A77] hover:bg-[#FFF4F5]/40 focus:outline-none focus:ring-2 focus:ring-[#E56A77]/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
         <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#FFF4F5] text-[#E56A77] transition-colors duration-150 group-hover:bg-[#E56A77] group-hover:text-white">
            <AddressIcon className="size-4.5" />
         </div>

         <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
               <span className="text-sm font-bold capitalize text-[#02060C]">{address.label}</span>

               {address.is_default && (
                  <span className="rounded bg-[#FFF4F5] px-1.5 py-0.5 text-[10px] font-semibold text-[#E56A77]">
                     Default
                  </span>
               )}
            </div>

            <p className="mt-0.5 break-words text-xs leading-relaxed text-[#595959]">{completeAddress}</p>
         </div>

         <ChevronRight className="size-4 shrink-0 self-center text-[#A6A6A6] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[#E56A77]" />
      </button>
   );
}
