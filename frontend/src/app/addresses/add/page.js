'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { AddressForm } from '@/components/addresses/AddressForm';
import useAuthGuard from '@/lib/hooks/useAuth';

export default function AddAddressPage() {
   useAuthGuard();

   return (
      <main className="flex min-h-[calc(100vh-75px)] w-full items-center justify-center bg-[#FAFAFA] px-4 py-8 sm:px-6 sm:py-12 md:px-8">
         <div className="w-full max-w-lg rounded-2xl border border-[#E9E9E9] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-8 md:p-10">
            <header className="mb-6">
               <Link
                  href="/addresses"
                  className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#595959] transition-colors duration-150 hover:text-[#02060C]"
               >
                  <ArrowLeft className="size-3.5" />
                  <span>Back to Addresses</span>
               </Link>

               <h1 className="text-2xl font-bold tracking-tight text-[#02060C] sm:text-3xl">
                  Add delivery address
               </h1>

               <p className="mt-2 text-sm text-[#595959]">
                  Enter your address details to save a new delivery location.
               </p>
            </header>

            <AddressForm />
         </div>
      </main>
   );
}
