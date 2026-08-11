'use client';

import { createOrder } from '@/services/orderService';
import { useCallback, useState } from 'react';

export default function useOrder() {
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   const placeOrder = useCallback(async (data, signal) => {
      try {
         setLoading(true);
         setError('');

         return await createOrder(data, signal);
      } catch (error) {
         if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
            return null;
         }

         const message = error.response?.data?.message || 'Unable to place order. Please try again.';

         setError(message);

         throw error;
      } finally {
         setLoading(false);
      }
   }, []);

   const makePayment = async (orderId, paymentMethod) => {
      try {
         setLoading(true);
         setError(null);

         const response = await makePaymentApi(orderId, paymentMethod);

         return response;
      } catch (error) {
         const apiError = parseApiError(error);

         setError(apiError.message ?? 'Payment failed.');

         return null;
      } finally {
         setLoading(false);
      }
   };

   return {
      placeOrder,
      makePayment,
      loading,
      error,
   };
}
