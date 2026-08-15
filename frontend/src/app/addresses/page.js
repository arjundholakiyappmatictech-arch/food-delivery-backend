'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
   Plus,
   MapPin,
   Home,
   BriefcaseBusiness,
   Pencil,
   Trash2,
   MoreVertical,
   Loader2,
   AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import useAuthGuard from '@/lib/hooks/useAuth';
import useAddresses from '@/lib/hooks/useAddresses';
import { deleteAddress } from '@/services/addressService';
import { parseApiError } from '@/utils/apiError';
import { AddressSearch } from '@/components/location/AddressSearch';

function getAddressIcon(label) {
   const normalized = label?.toLowerCase();
   if (normalized === 'home') return Home;
   if (normalized === 'work') return BriefcaseBusiness;
   return MapPin;
}

export default function AddressesPage() {
   useAuthGuard();

   const router = useRouter();

   const {
      addresses,
      hasSavedAddresses,
      loading,
      searching,
      hasMore,
      searchAddresses,
      loadMoreAddresses,
      removeAddress,
   } = useAddresses();

   const [menuOpenId, setMenuOpenId] = useState(null);
   const [deletingAddress, setDeletingAddress] = useState(null);
   const [isDeleting, setIsDeleting] = useState(false);

   const menuRef = useRef(null);

   useEffect(() => {
      const handleOutsideClick = (event) => {
         if (menuRef.current && !menuRef.current.contains(event.target)) {
            setMenuOpenId(null);
         }
      };

      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);

      return () => {
         document.removeEventListener('mousedown', handleOutsideClick);
         document.removeEventListener('touchstart', handleOutsideClick);
      };
   }, []);

   const handleDeleteConfirm = async () => {
      if (!deletingAddress) return;

      try {
         setIsDeleting(true);
         await deleteAddress(deletingAddress.id);
         removeAddress(deletingAddress.id);
         toast.success('Address deleted successfully.');
         setDeletingAddress(null);
      } catch (error) {
         const apiError = parseApiError(error);
         toast.error(apiError.message ?? 'Unable to delete address. Please try again.');
      } finally {
         setIsDeleting(false);
      }
   };

   return (
      <main className="flex min-h-screen min-h-dvh w-full items-center justify-center bg-[#FAFAFA] px-4 py-6 sm:px-6">
         <div className="w-full max-w-[500px] rounded-2xl border border-[#E9E9E9] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-6">
            {/* Header */}
            <header className="mb-3.5 text-center">
               <h1 className="text-xl font-bold tracking-tight text-[#02060C] sm:text-2xl">My Addresses</h1>
               <p className="mt-0.5 text-xs text-[#595959]">
                  {hasSavedAddresses
                     ? 'Manage your saved delivery locations.'
                     : 'Add a delivery address to manage your locations.'}
               </p>
            </header>

            <div className="space-y-3">
               {/* Search */}
               {hasSavedAddresses && <AddressSearch onSearch={searchAddresses} />}

               {/* Loading State */}
               {loading && addresses.length === 0 ? (
                  <div className="space-y-2 py-2">
                     {[1, 2].map((i) => (
                        <div key={i} className="flex animate-pulse items-center gap-3 rounded-xl border border-[#E9E9E9] p-3">
                           <div className="size-8.5 rounded-lg bg-gray-200" />
                           <div className="flex-1 space-y-1.5">
                              <div className="h-3.5 w-24 rounded bg-gray-200" />
                              <div className="h-3 w-44 rounded bg-gray-100" />
                           </div>
                        </div>
                     ))}
                  </div>
               ) : hasSavedAddresses ? (
                  <>
                     {/* Address List */}
                     <div className="max-h-60 space-y-2 overflow-y-auto scrollbar-hide">
                        {searching ? (
                           <div className="flex flex-col items-center justify-center py-4 text-center">
                              <Loader2 className="size-4 animate-spin text-[#E56A77]" />
                              <p className="mt-1 text-xs font-medium text-[#595959]">Searching addresses...</p>
                           </div>
                        ) : addresses.length === 0 ? (
                           <div className="rounded-xl border border-dashed border-[#E9E9E9] bg-[#FAFAFA] py-4 text-center">
                              <p className="text-xs font-medium text-[#595959]">
                                 No saved addresses match your search.
                              </p>
                           </div>
                        ) : (
                           addresses.map((address) => {
                              const AddressIcon = getAddressIcon(address.label);
                              const isMenuOpen = menuOpenId === address.id;
                              const completeAddress = [
                                 address.address_line,
                                 address.city,
                                 address.state,
                                 address.pincode,
                              ]
                                 .filter(Boolean)
                                 .join(', ');

                              return (
                                 <div
                                    key={address.id}
                                    className="group relative flex items-start justify-between gap-3 rounded-xl border border-[#E9E9E9] bg-white p-3 transition-all duration-150 hover:border-[#E56A77] hover:bg-[#FFF4F5]/20"
                                 >
                                    {/* Icon and details */}
                                    <div className="flex items-start gap-3 min-w-0 flex-1">
                                       <div className="flex size-8.5 shrink-0 items-center justify-center rounded-lg bg-[#FFF4F5] text-[#E56A77] mt-0.5">
                                          <AddressIcon className="size-4" />
                                       </div>

                                       <div className="min-w-0 flex-1">
                                          <h3 className="text-xs sm:text-sm font-bold capitalize text-[#02060C]">
                                             {address.label}
                                          </h3>

                                          <p className="mt-0.5 text-xs leading-relaxed text-[#595959] break-words">
                                             {completeAddress}
                                          </p>
                                       </div>
                                    </div>

                                    {/* Three dots kebab menu */}
                                    <div className="relative shrink-0" ref={isMenuOpen ? menuRef : null}>
                                       <button
                                          type="button"
                                          onClick={() => setMenuOpenId(isMenuOpen ? null : address.id)}
                                          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-[#02060C] transition cursor-pointer"
                                          aria-label="Address options"
                                       >
                                          <MoreVertical className="size-4" />
                                       </button>

                                       {/* Dropdown Menu */}
                                       {isMenuOpen && (
                                          <div className="absolute right-0 top-7 z-20 w-28 overflow-hidden rounded-xl border border-[#E9E9E9] bg-white py-1 shadow-lg">
                                             <button
                                                type="button"
                                                onClick={() => {
                                                   setMenuOpenId(null);
                                                   router.push(`/addresses/${address.id}/edit`);
                                                }}
                                                className="flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#02060C] hover:bg-[#FFF4F5] hover:text-[#E56A77] transition text-left"
                                             >
                                                <Pencil className="size-3.5" />
                                                <span>Edit</span>
                                             </button>

                                             <button
                                                type="button"
                                                onClick={() => {
                                                   setMenuOpenId(null);
                                                   setDeletingAddress(address);
                                                }}
                                                className="flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition text-left"
                                             >
                                                <Trash2 className="size-3.5" />
                                                <span>Delete</span>
                                             </button>
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              );
                           })
                        )}

                        {hasMore && (
                           <div className="pt-1 text-center">
                              <button
                                 type="button"
                                 onClick={loadMoreAddresses}
                                 className="text-xs font-semibold text-[#E56A77] hover:underline"
                              >
                                 Load more addresses
                              </button>
                           </div>
                        )}
                     </div>

                     {/* Add New Address Button matching select page */}
                     <Link
                        href="/addresses/add"
                        className="flex h-9.5 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#E56A77] bg-white px-4 text-xs sm:text-sm font-semibold text-[#E56A77] transition-colors duration-150 hover:bg-[#FFF4F5] focus:outline-none focus:ring-2 focus:ring-[#E56A77]/30"
                     >
                        <Plus className="size-3.5" />
                        <span>Add New Address</span>
                     </Link>
                  </>
               ) : (
                  /* Empty State */
                  <div className="space-y-3.5 text-center py-2">
                     <div className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-[#FFF4F5] text-[#E56A77]">
                        <MapPin className="size-5.5" />
                     </div>

                     <div className="space-y-1">
                        <h3 className="text-sm sm:text-base font-bold text-[#02060C]">No saved addresses</h3>
                        <p className="text-xs leading-relaxed text-[#595959]">Add an address to manage delivery locations.</p>
                     </div>

                     <div className="pt-1">
                        <Link
                           href="/addresses/add"
                           className="flex h-9.5 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#E56A77] px-4 text-xs sm:text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-[#D95765] active:bg-[#C84E5B] focus:outline-none focus:ring-2 focus:ring-[#E56A77]/40"
                        >
                           <Plus className="size-3.5" />
                           <span>Add Address</span>
                        </Link>
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* Delete Confirmation Modal */}
         {deletingAddress && (
            <div
               className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
               onClick={(e) => {
                  if (e.target === e.currentTarget && !isDeleting) {
                     setDeletingAddress(null);
                  }
               }}
            >
               <div className="relative w-full max-w-sm rounded-2xl border border-[#E9E9E9] bg-white p-5 shadow-xl text-center">
                  <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                     <AlertCircle className="size-5" />
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-[#02060C]">Delete Address?</h3>
                  <p className="mt-1 text-xs text-[#595959] leading-relaxed">
                     Are you sure you want to delete your <span className="font-semibold capitalize text-[#02060C]">{deletingAddress.label}</span> address?
                  </p>

                  <div className="mt-4 flex items-center justify-center gap-2">
                     <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => setDeletingAddress(null)}
                        className="flex-1 rounded-xl border border-[#E9E9E9] bg-white py-2 text-xs font-semibold text-[#595959] hover:bg-gray-50 transition disabled:opacity-50 cursor-pointer"
                     >
                        Cancel
                     </button>

                     <button
                        type="button"
                        disabled={isDeleting}
                        onClick={handleDeleteConfirm}
                        className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-red-600 py-2 text-xs font-semibold text-white hover:bg-red-700 transition disabled:opacity-60 cursor-pointer"
                     >
                        {isDeleting ? (
                           <>
                              <Loader2 className="size-3 animate-spin" />
                              <span>Deleting...</span>
                           </>
                        ) : (
                           'Delete'
                        )}
                     </button>
                  </div>
               </div>
            </div>
         )}
      </main>
   );
}
