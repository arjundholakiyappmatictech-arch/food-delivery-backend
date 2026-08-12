'use client';

import { createOrder, getOrder, generateInvoice } from '@/services/orderService';
import { makePayment } from '@/services/paymentService';
import { parseApiError } from '@/utils/apiError';
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

   const makePaymentt = async (orderId, paymentMethod) => {
      try {
         setLoading(true);
         setError(null);

         const response = await makePayment(orderId, paymentMethod);

         return response;
      } catch (error) {
         const apiError = parseApiError(error);

         setError(apiError.message ?? 'Payment failed.');

         return null;
      } finally {
         setLoading(false);
      }
   };

   const fetchOrder = useCallback(async (orderId, signal) => {
      try {
         setLoading(true);
         setError('');

         return await getOrder(orderId, signal);
      } catch (error) {
         if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
            return null;
         }

         const apiError = parseApiError(error);

         setError(apiError.message || 'Unable to fetch order details.');

         return null;
      } finally {
         setLoading(false);
      }
   }, []);

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
      placeOrder,
      makePaymentt,
      fetchOrder,
      generateOrderInvoice,
      loading,
      error,
   };
}
