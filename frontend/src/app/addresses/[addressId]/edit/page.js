'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { EditAddressForm } from '@/components/addresses/EditAddressForm';
import useAuthGuard from '@/lib/hooks/useAuth';
import useAddress from '@/lib/hooks/useAddress';

export default function EditAddressPage() {
   useAuthGuard();

   const params = useParams();
   const addressId = params?.addressId;

   const { address, loading, error } = useAddress(addressId);

   return (
      <main className="flex min-h-screen min-h-dvh w-full items-center justify-center bg-[#FAFAFA] px-4 py-6 sm:px-6">
         <div className="w-full max-w-[500px] rounded-2xl border border-[#E9E9E9] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-6">
            <header className="mb-3.5">
               <Link
                  href="/addresses"
                  className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#595959] transition-colors duration-150 hover:text-[#02060C]"
               >
                  <ArrowLeft className="size-3.5" />
                  <span>Back to Addresses</span>
               </Link>

               <h1 className="text-xl font-bold tracking-tight text-[#02060C] sm:text-2xl">Edit delivery address</h1>

               <p className="mt-0.5 text-xs text-[#595959]">Update your address details.</p>
            </header>

            {loading ? (
               <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Loader2 className="size-5 animate-spin text-[#E56A77]" />

                  <p className="mt-2 text-xs font-medium text-[#595959]">Loading address details...</p>
               </div>
            ) : address ? (
               <EditAddressForm addressId={addressId} initialData={address} />
            ) : (
               <div className="py-8 text-center">
                  <p className="text-xs font-medium text-[#595959]">{error || 'Address not found.'}</p>

                  <Link
                     href="/addresses"
                     className="mt-2 inline-block text-xs font-semibold text-[#E56A77] hover:underline"
                  >
                     Back to addresses
                  </Link>
               </div>
            )}
         </div>
      </main>
   );
}
