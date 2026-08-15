'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { AddAddressForm } from '@/components/addresses/AddAddressForm';
import useAuthGuard from '@/lib/hooks/useAuth';

function AddAddressContent() {
   useAuthGuard();
   const searchParams = useSearchParams();
   const isFromSelect = searchParams.get('from') === 'select';

   return (
      <main className="flex min-h-screen min-h-dvh w-full items-center justify-center bg-[#FAFAFA] px-4 py-6 sm:px-6">
         <div className="w-full max-w-[500px] rounded-2xl border border-[#E9E9E9] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-6">
            <header className="mb-3.5">
               <Link
                  href={isFromSelect ? '/addresses/select' : '/addresses'}
                  className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#595959] transition-colors duration-150 hover:text-[#02060C]"
               >
                  <ArrowLeft className="size-3.5" />
                  <span>{isFromSelect ? 'Back to Select Address' : 'Back to Addresses'}</span>
               </Link>

               <h1 className="text-xl font-bold tracking-tight text-[#02060C] sm:text-2xl">Add delivery address</h1>

               <p className="mt-0.5 text-xs text-[#595959]">
                  Enter your address details to save a new delivery location.
               </p>
            </header>

            <AddAddressForm />
         </div>
      </main>
   );
}

export default function AddAddressPage() {
   return (
      <Suspense fallback={null}>
         <AddAddressContent />
      </Suspense>
   );
}
