'use client';

import { useCallback, useState } from 'react';

import { generateInvoice } from '@/services/orderService';
import { parseApiError } from '@/utils/apiError';

export default function useGenerateInvoice() {
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   const generateOrderInvoice = useCallback(async (orderId, signal) => {
      try {
         setLoading(true);
         setError('');

         return await generateInvoice(orderId, signal);
      } catch (error) {
         if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
            return null;
         }

         const apiError = parseApiError(error);

         setError(apiError.message || 'Unable to generate invoice.');

         return null;
      } finally {
         setLoading(false);
      }
   }, []);

   return {
      generateOrderInvoice,
      loading,
      error,
   };
}
