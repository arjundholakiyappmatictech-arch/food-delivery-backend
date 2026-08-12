'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

import { generateInvoicePdf } from '@/utils/generateInvoicePDF';
import useOrder from '@/lib/hooks/useOrder';

export default function GenerateInvoiceButton({ order }) {
   const { generateOrderInvoice } = useOrder();

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
         disabled={generating}
         className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E9E9E9] bg-white px-5 py-3 text-sm font-semibold text-[#02060C] transition hover:border-[#E56A77] hover:text-[#E56A77] disabled:cursor-not-allowed disabled:opacity-60"
      >
         <Download size={17} />

         {generating ? 'Generating...' : 'Generate Invoice'}
      </button>
   );
}
