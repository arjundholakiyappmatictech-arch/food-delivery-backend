'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

import { generateInvoicePdf } from '@/utils/generateInvoicePDF';
import useGenerateInvoice from '@/lib/hooks/useGenerateInvoice';

export default function GenerateInvoiceButton({ order }) {
   const { generateOrderInvoice } = useGenerateInvoice();

   const [generating, setGenerating] = useState(false);

   const handleGenerateInvoice = async () => {
      try {
         setGenerating(true);

         const response = await generateOrderInvoice(order.id);

         if (!response) {
            return;
         }

         generateInvoicePdf(response.data, order);
      } finally {
         setGenerating(false);
      }
   };

   return (
      <button
         type="button"
         onClick={handleGenerateInvoice}
         disabled={generating || order.status !== 'delivered'}
         className={`inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition ${
            order.status === 'delivered' && !generating
               ? 'cursor-pointer border-[#E9E9E9] bg-white text-[#02060C] hover:border-[#E56A77] hover:text-[#E56A77]'
               : 'cursor-not-allowed border-[#E9E9E9] bg-[#F5F5F5] text-[#A6A6A6]'
         }`}
      >
         <Download size={17} />

         {generating ? 'Generating...' : 'Generate Invoice'}
      </button>
   );
}
