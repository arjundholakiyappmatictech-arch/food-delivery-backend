/* eslint-disable react-hooks/static-components */

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

export function SavedAddressItem({ address, onSelect, disabled = false }) {
   const AddressIcon = getAddressIcon(address.label);

   const completeAddress = [address.address_line, address.city, address.state, address.pincode]
      .filter(Boolean)
      .join(', ');

   return (
      <button
         type="button"
         disabled={disabled}
         onClick={() => onSelect(address)}
         className="flex min-h-24 w-full items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left transition-colors hover:border-orange-200 hover:bg-orange-50/50 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
         <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-50">
            <AddressIcon className="size-5 text-orange-600" />
         </div>

         <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold capitalize leading-5 text-gray-900">{address.label}</p>

            <p className="mt-1 break-words text-sm leading-5 text-gray-500">{completeAddress}</p>
         </div>
      </button>
   );
}
