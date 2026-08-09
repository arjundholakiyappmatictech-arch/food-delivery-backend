import { BriefcaseBusiness, Home, MapPin } from 'lucide-react';

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
         className="flex w-full items-start gap-4 rounded-2xl border border-[#e4e7ec] bg-white p-4 text-left shadow-[0_6px_18px_rgba(16,24,40,0.04)] transition hover:border-[#ffcfbd] hover:bg-[#fff8f4] focus:outline-none focus:ring-4 focus:ring-[#ef3b0a]/10 disabled:cursor-not-allowed disabled:opacity-70"
      >
         <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fff1e8] text-[#ef3b0a]">
            <AddressIcon className="h-6 w-6" />
         </span>

         <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
               <span className="text-base font-bold capitalize text-[#121826]">{address.label}</span>

               {address.is_default && (
                  <span className="rounded-full bg-[#fff1e8] px-2.5 py-1 text-xs font-bold text-[#ef3b0a]">
                     Default
                  </span>
               )}
            </span>

            <span className="mt-1 block break-words text-sm font-medium leading-6 text-[#667085]">
               {completeAddress}
            </span>
         </span>
      </button>
   );
}
