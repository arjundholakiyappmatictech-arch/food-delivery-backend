'use client';

import { Home, BriefcaseBusiness, MapPin } from 'lucide-react';

function getAddressIcon(label) {
   const normalized = label?.toLowerCase();
   if (normalized === 'home') return Home;
   if (normalized === 'work') return BriefcaseBusiness;
   return MapPin;
}

export default function SelectAddressItem({ address, disabled, onSelect }) {
   const AddressIcon = getAddressIcon(address.label);
   const completeAddress = [address.address_line, address.city, address.state, address.pincode]
      .filter(Boolean)
      .join(', ');

   return (
      <button
         type="button"
         disabled={disabled}
         onClick={() => onSelect(address)}
         className="group flex w-full cursor-pointer items-start gap-3 rounded-xl border border-[#E9E9E9] bg-white p-3 text-left transition-all duration-150 hover:border-[#E56A77] hover:bg-[#FFF4F5]/30 focus:outline-none focus:ring-2 focus:ring-[#E56A77]/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
         <div className="mt-0.5 flex size-8.5 shrink-0 items-center justify-center rounded-lg bg-[#FFF4F5] text-[#E56A77] transition-colors duration-150 group-hover:bg-[#E56A77] group-hover:text-white">
            <AddressIcon className="size-4" />
         </div>

         <div className="min-w-0 flex-1">
            <span className="text-xs font-bold capitalize text-[#02060C] sm:text-sm">{address.label}</span>

            <p className="mt-0.5 break-words text-xs leading-relaxed text-[#595959]">{completeAddress}</p>
         </div>
      </button>
   );
}
