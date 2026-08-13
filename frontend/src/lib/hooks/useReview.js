'use client';

import { createReview } from '@/services/reviewService';
import { parseApiError } from '@/utils/apiError';
import { useCallback, useState } from 'react';

export default function useReview() {
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   const submitReview = useCallback(async (orderId, data, signal) => {
      try {
         setLoading(true);
         setError('');

         return await createReview(orderId, data, signal);
      } catch (error) {
         if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
            return null;
         }

         const apiError = parseApiError(error);

         setError(apiError.message || 'Unable to submit review.');

         return null;
      } finally {
         setLoading(false);
      }
   }, []);

   return {
      submitReview,
      loading,
      error,
   };
}
