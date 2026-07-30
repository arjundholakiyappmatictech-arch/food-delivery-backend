'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { AddressForm } from '@/components/addresses/AddressForm';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import useAuthGuard from '@/lib/hooks/useAuth';

export default function AddAddressPage() {
   useAuthGuard();
   return (
      <main className="mx-auto min-h-screen max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
         <Link
            href="/"
            className={cn(
               buttonVariants({
                  variant: 'ghost',
                  size: 'sm',
               }),
               'mb-6 -ml-3',
            )}
         >
            <ArrowLeft className="size-4" />
            Back
         </Link>

         <section className="rounded-2xl border bg-card p-6 sm:p-8">
            <div className="mb-8">
               <h1 className="text-2xl font-semibold tracking-tight">Add delivery address</h1>

               <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Enter the complete address where you want your order delivered.
               </p>
            </div>

            <AddressForm />
         </section>
      </main>
   );
}
