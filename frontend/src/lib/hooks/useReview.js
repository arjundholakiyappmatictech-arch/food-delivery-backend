'use client';

import { createReview } from '@/services/reviewService';
import { parseApiError } from '@/utils/apiError';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function useReview() {
   const queryClient = useQueryClient();

   const reviewMutation = useMutation({
      mutationFn: async ({ orderId, data, signal }) => {
         try {
            return await createReview(orderId, data, signal);
         } catch (error) {
            const apiError = parseApiError(error);

            throw new Error(apiError.message || 'Unable to submit review.');
         }
      },

      onSuccess: (response, variables) => {
         const newReview = response?.data;
         const targetOrderId = newReview?.order_id || variables?.orderId;

         if (targetOrderId) {
            queryClient.setQueryData(['orders'], (old) => {
               const list = old?.data ?? old;
               if (!Array.isArray(list)) return old;
               const updated = list.map((o) => (o.id === targetOrderId ? { ...o, order_review: newReview } : o));
               return old?.data ? { ...old, data: updated } : updated;
            });
            queryClient.invalidateQueries({ queryKey: ['order', targetOrderId] });
         }

         queryClient.invalidateQueries({ queryKey: ['orders'] });

         if (newReview) {
            queryClient.setQueryData(['reviews'], (old) => {
               if (!old?.pages?.length || old.pages.some((p) => p?.data?.some((r) => r.id === newReview.id))) {
                  return old;
               }
               return {
                  ...old,
                  pages: old.pages.map((p, i) => (i === 0 ? { ...p, data: [newReview, ...(p.data ?? [])] } : p)),
               };
            });
         }

         queryClient.invalidateQueries({ queryKey: ['reviews'] });
      },
   });

   return {
      submitReview: (orderId, data, signal) =>
         reviewMutation.mutateAsync({
            orderId,
            data,
            signal,
         }),

      loading: reviewMutation.isPending,

      error: reviewMutation.error?.message || '',
   };
}
