'use client';

import { useRouter } from 'next/navigation';
import { Home, BriefcaseBusiness, MapPin, Pencil, Trash2, MoreVertical } from 'lucide-react';

const ADDRESS_ICONS = {
   home: Home,
   work: BriefcaseBusiness,
};

export default function AddressItem({ address, isMenuOpen, menuRef, onToggleMenu, onDeleteClick }) {
   const router = useRouter();
   const Icon = ADDRESS_ICONS[address.label?.toLowerCase()] || MapPin;

   const completeAddress = [address.address_line, address.city, address.state, address.pincode]
      .filter(Boolean)
      .join(', ');

   return (
      <div className="group relative flex items-start justify-between gap-3 rounded-xl border border-[#E9E9E9] bg-white p-3 transition-all duration-150 hover:border-[#E56A77] hover:bg-[#FFF4F5]/20">
         <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="mt-0.5 flex size-8.5 shrink-0 items-center justify-center rounded-lg bg-[#FFF4F5] text-[#E56A77]">
               <Icon className="size-4" />
            </div>

            <div className="min-w-0 flex-1">
               <h3 className="text-xs font-bold capitalize text-[#02060C] sm:text-sm">{address.label}</h3>

               <p className="mt-0.5 break-words text-xs leading-relaxed text-[#595959]">{completeAddress}</p>
            </div>
         </div>

         <div className="relative shrink-0" ref={isMenuOpen ? menuRef : null}>
            <button
               type="button"
               onClick={onToggleMenu}
               className="cursor-pointer rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-[#02060C]"
               aria-label="Address options"
            >
               <MoreVertical className="size-4" />
            </button>

            {isMenuOpen && (
               <div className="absolute right-0 top-7 z-20 w-28 overflow-hidden rounded-xl border border-[#E9E9E9] bg-white py-1 shadow-lg">
                  <button
                     type="button"
                     onClick={() => router.push(`/addresses/${address.id}/edit`)}
                     className="flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-xs font-medium text-[#02060C] transition hover:bg-[#FFF4F5] hover:text-[#E56A77]"
                  >
                     <Pencil className="size-3.5" />
                     <span>Edit</span>
                  </button>

                  <button
                     type="button"
                     onClick={onDeleteClick}
                     className="flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-xs font-medium text-red-600 transition hover:bg-red-50"
                  >
                     <Trash2 className="size-3.5" />
                     <span>Delete</span>
                  </button>
               </div>
            )}
         </div>
      </div>
   );
}
