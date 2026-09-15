'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { generateInvoice } from '@/services/orderService';
import { generateInvoicePdf } from '@/utils/generateInvoicePDF';
import { parseApiError } from '@/utils/apiError';

export default function GenerateInvoiceButton({ order }) {
   const [generating, setGenerating] = useState(false);

   const handleGenerateInvoice = async () => {
      try {
         setGenerating(true);

         const response = await generateInvoice(order.id);

         if (!response?.data) {
            return;
         }

         generateInvoicePdf(response.data, order);
      } catch (error) {
         if (error?.name !== 'CanceledError' && error?.code !== 'ERR_CANCELED') {
            toast.error(parseApiError(error).message || 'Unable to generate invoice.');
         }
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
