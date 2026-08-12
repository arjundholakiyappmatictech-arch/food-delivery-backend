'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CreativeCtaSection({ creativeFontClass }) {
   return (
      <section className="bg-white min-h-[85vh] flex flex-col justify-center py-20 pb-28 max-[800px]:py-16 max-[560px]:py-12 relative overflow-hidden">
         {/* Subtle top border gradient */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-[#E2E2E2] to-transparent" />

         <div className="relative z-10 mx-auto w-full max-w-[1800px] px-[60px] max-[1200px]:px-[40px] max-[800px]:px-[25px] max-[560px]:px-[15px]">
            
            <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
               
               <div className="inline-flex items-center gap-3 mb-10 opacity-70">
                  <div className="h-[1px] w-12 bg-gray-300" />
                  <span className="text-[12px] font-[700] tracking-[0.3em] text-gray-500 uppercase">
                     The Next Step
                  </span>
                  <div className="h-[1px] w-12 bg-gray-300" />
               </div>
               
               <h2 className={`mb-8 text-[72px] text-[#E56A77] leading-[1.1] tracking-tight max-[1000px]:text-[56px] max-[800px]:text-[48px] max-[560px]:text-[40px] ${creativeFontClass}`}>
                  From our kitchen to your table.
               </h2>
               
               <p className="mb-14 text-[22px] font-[400] text-[#5F5F5F] max-w-3xl leading-relaxed max-[800px]:text-[18px] max-[560px]:text-[16px]">
                  Experience the magic of seamless ordering and delicious meals crafted by passionate local chefs. Your next favorite dish is just a tap away.
               </p>

               <Link
                  href="/"
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[#02060C] px-10 py-5 text-[18px] font-[700] text-white shadow-[0_15px_30px_-10px_rgba(2,6,12,0.4)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_rgba(229,106,119,0.3)] active:translate-y-0"
               >
                  <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
                     <div className="relative h-full w-8 bg-white/20" />
                  </div>
                  <span className="relative z-10 flex items-center gap-3">
                     Explore Menu
                     <ArrowRight className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-2" />
                  </span>
               </Link>

            </div>
         </div>
      </section>
   );
}
