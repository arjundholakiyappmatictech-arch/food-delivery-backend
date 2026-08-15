'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { EditAddressForm } from '@/components/addresses/EditAddressForm';
import useAuthGuard from '@/lib/hooks/useAuth';
import { getAddresses } from '@/services/addressService';

export default function EditAddressPage() {
   useAuthGuard();

   const params = useParams();
   const router = useRouter();
   const addressId = params?.addressId;

   const [address, setAddress] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      if (!addressId) return;

      const fetchAddress = async () => {
         try {
            setLoading(true);
            const response = await getAddresses('', 1);
            const found = response.addresses.find((a) => String(a.id) === String(addressId));

            if (found) {
               setAddress(found);
            } else {
               toast.error('Address not found.');
               router.replace('/addresses');
            }
         } catch {
            toast.error('Failed to load address details.');
            router.replace('/addresses');
         } finally {
            setLoading(false);
         }
      };

      fetchAddress();
   }, [addressId, router]);

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
            ) : null}
         </div>
      </main>
   );
}
