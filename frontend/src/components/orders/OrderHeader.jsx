'use client';

import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import GenerateInvoiceButton from './GenerateInvoiceButton';

export default function OrderHeader({ order }) {
   const router = useRouter();

   const isDelivered = order.status === 'delivered';

   const formattedDeliveredAt = formatDate(order.delivered_at) || null;

   return (
      <div className="mb-8">
         <button
            type="button"
            onClick={() => router.push('/orders')}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#02060C] transition hover:text-[#E56A77] cursor-pointer"
         >
            <ArrowLeft size={18} />
            Back to Orders
         </button>

         <div className="flex items-start justify-between gap-6 max-[640px]:flex-col">
            <div>
               <h1 className="text-4xl font-semibold tracking-tight text-[#02060C] max-[640px]:text-3xl">
                  Order Details
               </h1>

               <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
                  <p>
                     Order ID: <span className="font-medium text-[#02060C]">#{order.id}</span>
                  </p>
               </div>
            </div>

            <div className="flex items-center gap-3 max-[640px]:w-full max-[640px]:flex-col max-[640px]:items-stretch">
               <GenerateInvoiceButton order={order} />

               <div className="flex items-center gap-3 rounded-xl bg-green-50 px-5 py-3">
                  <CheckCircle2 size={20} className="shrink-0 text-green-600" />

                  <div>
                     <p className="font-semibold capitalize text-green-600">{order.status.replaceAll('_', ' ')}</p>

                     {isDelivered && formattedDeliveredAt && (
                        <p className="mt-0.5 text-xs text-gray-500">{formattedDeliveredAt}</p>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
