'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createOrder, getOrder, cancelOrder } from '@/services/orderService';
import { makePayment, verifyPayment } from '@/services/paymentService';
import { parseApiError } from '@/utils/apiError';

export default function useOrder(orderId = null) {
   const queryClient = useQueryClient();

   const orderQuery = useQuery({
      queryKey: ['order', orderId],
      queryFn: ({ signal }) => getOrder(orderId, signal),
      enabled: Boolean(orderId),
      refetchInterval: (query) => {
         const data = query.state.data;
         const orderData = data?.data ?? data;
         const status = orderData?.status;

         return status === 'delivered' || status === 'cancelled' ? false : 5000;
      },
   });

   const createOrderMutation = useMutation({
      mutationFn: async (data) => {
         try {
            return await createOrder(data);
         } catch (error) {
            throw parseApiError(error);
         }
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['orders'] });
      },
   });

   const makePaymentMutation = useMutation({
      mutationFn: async ({ orderId: id, paymentMethod }) => {
         try {
            return await makePayment(id, paymentMethod);
         } catch (error) {
            throw parseApiError(error);
         }
      },
      onSuccess: (_, variables) => {
         queryClient.invalidateQueries({ queryKey: ['orders'] });
         if (variables?.orderId) {
            queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
         }
      },
   });

   const verifyPaymentMutation = useMutation({
      mutationFn: async ({ orderId: id, paymentData }) => {
         try {
            return await verifyPayment(id, paymentData);
         } catch (error) {
            throw parseApiError(error);
         }
      },
   });

   const cancelOrderMutation = useMutation({
      mutationFn: async (id) => {
         try {
            return await cancelOrder(id);
         } catch (error) {
            throw parseApiError(error);
         }
      },
      onSuccess: (_, orderId) => {
         queryClient.invalidateQueries({ queryKey: ['orders'] });
         queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      },
   });

   const order = orderQuery.data?.data ?? orderQuery.data ?? null;
   const queryError = orderQuery.error ? parseApiError(orderQuery.error)?.message : null;
   const mutationError = createOrderMutation.error?.message || makePaymentMutation.error?.message;

   return {
      order,
      placeOrder: createOrderMutation.mutateAsync,
      makePaymentt: (id, paymentMethod) => makePaymentMutation.mutateAsync({ orderId: id, paymentMethod }),
      verifyPayment: (id, paymentData) =>
         verifyPaymentMutation.mutateAsync({
            orderId: id,
            paymentData,
         }),
      cancelOrder: (id) => cancelOrderMutation.mutateAsync(id),
      fetchOrder: (id, signal) =>
         queryClient.fetchQuery({
            queryKey: ['order', id || orderId],
            queryFn: () => getOrder(id || orderId, signal),
         }),
      loading:
         orderQuery.isLoading ||
         createOrderMutation.isPending ||
         makePaymentMutation.isPending ||
         cancelOrderMutation.isPending,

      error: queryError || mutationError || cancelOrderMutation.error?.message || '',
   };
}
