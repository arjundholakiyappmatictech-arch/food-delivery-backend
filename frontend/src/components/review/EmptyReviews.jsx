'use client';

import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';

export default function EmptyReviews() {
   return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E9E9E9] bg-white px-4 py-16 text-center">
         <div className="flex size-14 items-center justify-center rounded-full bg-[#FFF4F5] text-[#E56A77]">
            <Star className="size-7 fill-[#E56A77]" />
         </div>

         <h2 className="mt-4 text-lg font-bold text-[#02060C]">No reviews yet</h2>

         <p className="mt-1 max-w-sm text-xs leading-relaxed text-[#595959]">
            You haven&apos;t reviewed any restaurants yet. Once your orders are delivered, you can write reviews and they will appear here.
         </p>

         <Link
            href="/orders"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#E56A77] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#D95765]"
         >
            <span>View Delivered Orders</span>
            <ArrowRight className="size-3.5" />
         </Link>
      </div>
   );
}
