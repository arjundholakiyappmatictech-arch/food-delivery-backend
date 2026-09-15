'use client';

import Link from 'next/link';
import { CART_SVG } from '@/assets/icons';

export default function EmptyCart() {
   return (
      <main className="mx-auto flex min-h-[65vh] w-full max-w-[1200px] flex-col items-center justify-center px-4 py-12 text-center animate-[fadeIn_0.4s_ease-out]">
         {/* Icon Container */}
         <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-b from-[#FFF5F6] to-[#FFEBEF] p-6 text-[#D95765] shadow-[0_8px_24px_rgba(217,87,101,0.12)] ring-1 ring-[#FFE2E6]">
            <div className="h-12 w-12">{CART_SVG}</div>
         </div>

         {/* Text Details */}
         <h2 className="text-[24px] font-[700] tracking-tight text-[#02060C] max-[600px]:text-[20px]">
            Your Cart is Empty
         </h2>

         <p className="mt-2.5 max-w-[400px] text-[15px] leading-relaxed text-[#7E808C] max-[600px]:text-[13px]">
            Looks like you haven&apos;t added anything to your cart yet. Explore top restaurants near you to satisfy your cravings!
         </p>

         {/* Call to Action */}
         <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-[#D95765] px-7 py-3.5 text-[14px] font-[600] uppercase tracking-wider text-white shadow-[0_6px_20px_rgba(217,87,101,0.32)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#C74655] hover:shadow-[0_8px_25px_rgba(217,87,101,0.42)] active:translate-y-0"
         >
            See Restaurants Near You
         </Link>
      </main>
   );
}
